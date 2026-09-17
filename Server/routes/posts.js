const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const User = require("../Model/User");
const Notification = require("../Model/Notification");

/**
 * Calculates max allowed posts per day based on accepted friends count:
 * - 0 friends: 0 posts/day (Cannot post)
 * - 1 friend: 1 post/day
 * - 2-5 friends: 2 posts/day
 * - 6-10 friends: 5 posts/day
 * - >10 friends: unlimited (Infinity)
 */
function getPostingLimit(friendCount) {
  if (friendCount <= 0) return 0;
  if (friendCount === 1) return 1;
  if (friendCount >= 2 && friendCount <= 5) return 2;
  if (friendCount >= 6 && friendCount <= 10) return 5;
  return Infinity;
}

// Create new post
router.post("/", async (req, res) => {
  try {
    const { userEmail, content, mediaUrl, mediaType, privacy } = req.body;

    if (!userEmail || !content?.trim()) {
      return res.status(400).json({
        status: false,
        message: "User email and post content are required",
      });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const friendCount = user.friends ? user.friends.length : 0;
    const dailyLimit = getPostingLimit(friendCount);

    // Enforce posting privilege rule 1: 0 friends cannot post
    if (dailyLimit === 0) {
      return res.status(403).json({
        status: false,
        code: "NO_FRIENDS_POST_BLOCKED",
        friendCount: 0,
        message: "You need at least 1 accepted friend to create posts in the Public Space. Connect with peers first!",
      });
    }

    // Check posts created today by this user (past 24h or calendar day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const postsTodayCount = await Post.countDocuments({
      user: user._id,
      createdAt: { $gte: startOfToday },
    });

    if (postsTodayCount >= dailyLimit) {
      return res.status(429).json({
        status: false,
        code: "DAILY_POST_LIMIT_REACHED",
        friendCount,
        dailyLimit,
        postsTodayCount,
        message: `Posting limit reached! With ${friendCount} friend(s), you can create up to ${dailyLimit} post(s) per day. Add more friends to unlock higher posting tiers!`,
      });
    }

    // Anti-spam & duplicate post check (within last 10 minutes)
    const recentDuplicate = await Post.findOne({
      user: user._id,
      content: content.trim(),
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recentDuplicate) {
      return res.status(400).json({
        status: false,
        message: "Duplicate post detected. Please avoid posting identical content repeatedly.",
      });
    }

    // Extract hashtags and mentions
    const hashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.toLowerCase());
    const mentions = (content.match(/@[a-zA-Z0-9_]+/g) || []).map((m) => m.replace("@", "").toLowerCase());

    const newPost = await Post.create({
      user: user._id,
      authorName: user.Name,
      authorEmail: user.Email,
      authorPhoto: user.Photos || "",
      content: content.trim(),
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "text",
      friendCountAtPosting: friendCount,
      privacy: privacy || "public",
      hashtags,
      mentions,
    });

    // Create notifications for mentioned users
    if (mentions.length > 0) {
      for (const username of mentions) {
        const mentionedUser = await User.findOne({
          $or: [
            { Name: new RegExp(`^${username}$`, "i") },
            { Email: new RegExp(`^${username}@`, "i") },
          ],
        });
        if (mentionedUser && mentionedUser._id.toString() !== user._id.toString()) {
          await Notification.create({
            recipient: mentionedUser._id,
            sender: user._id,
            senderName: user.Name,
            type: "mention",
            title: "Mentioned in a Post",
            message: `${user.Name} mentioned you in a post in Public Space.`,
            link: "/public-space",
          });
        }
      }
    }

    return res.status(201).json({
      status: true,
      message: "Post created successfully",
      post: newPost,
      friendCount,
      postsToday: postsTodayCount + 1,
      dailyLimit,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create post",
    });
  }
});

// Get personalized Feed (Friends' posts first, then trending and recent)
router.get("/feed", async (req, res) => {
  try {
    const userEmail = req.query.email;
    let currentUser = null;
    if (userEmail) {
      currentUser = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    }

    const friendIds = currentUser?.friends || [];

    // 1. Fetch friend posts
    const friendPosts = friendIds.length > 0
      ? await Post.find({ user: { $in: friendIds } })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean()
      : [];

    // 2. Fetch other public posts
    const otherPosts = await Post.find({
      user: { $nin: [...friendIds, currentUser?._id].filter(Boolean) },
      privacy: "public",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // 3. User's own posts
    const myPosts = currentUser
      ? await Post.find({ user: currentUser._id }).sort({ createdAt: -1 }).limit(20).lean()
      : [];

    // Combine prioritizing: user own posts & friends' posts first, then other public
    const feed = [...myPosts, ...friendPosts, ...otherPosts];

    // Remove duplicates by _id
    const seenIds = new Set();
    const uniqueFeed = feed.filter((post) => {
      const idStr = post._id.toString();
      if (seenIds.has(idStr)) return false;
      seenIds.add(idStr);
      return true;
    });

    return res.status(200).json({
      status: true,
      data: uniqueFeed,
      userFriendCount: friendIds.length,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch feed",
    });
  }
});

// Like / Unlike post
router.post("/:id/like", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === user._id.toString());
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== user._id.toString());
    } else {
      post.likes.push(user._id);
      // Notify post author
      if (post.user.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: user._id,
          senderName: user.Name,
          type: "like",
          title: "New Like",
          message: `${user.Name} liked your post.`,
          link: "/public-space",
        });
      }
    }

    await post.save();
    return res.status(200).json({
      status: true,
      liked: !alreadyLiked,
      totalLikes: post.likes.length,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to update like" });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { userEmail, text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ status: false, message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const newComment = {
      user: user._id,
      userName: user.Name,
      userPhoto: user.Photos || "",
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Notify post author
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: user._id,
        senderName: user.Name,
        type: "comment",
        title: "New Comment",
        message: `${user.Name} commented on your post: "${text.substring(0, 30)}..."`,
        link: "/public-space",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Comment added",
      comments: post.comments,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to add comment" });
  }
});

// Share post increment
router.post("/:id/share", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    post.shares += 1;
    await post.save();
    return res.status(200).json({ status: true, shares: post.shares });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to share post" });
  }
});

// Save (Bookmark) / Unsave post
router.post("/:id/save", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const alreadySaved = post.savedBy.some((id) => id.toString() === user._id.toString());
    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== user._id.toString());
    } else {
      post.savedBy.push(user._id);
    }

    await post.save();
    return res.status(200).json({ status: true, saved: !alreadySaved });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to save post" });
  }
});

// Report post
router.post("/:id/report", async (req, res) => {
  try {
    const { userEmail, reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    post.reports.push({
      user: user._id,
      reason: reason || "Inappropriate content",
      reportedAt: new Date(),
    });

    await post.save();
    return res.status(200).json({ status: true, message: "Thank you. Post has been reported for review." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to report post" });
  }
});

// Edit post (within configurable 15-minute time limit)
router.put("/:id", async (req, res) => {
  try {
    const { userEmail, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user || post.user.toString() !== user._id.toString()) {
      return res.status(403).json({ status: false, message: "Unauthorized to edit this post" });
    }

    // Configurable time limit: 15 minutes
    const EDIT_TIME_LIMIT_MINUTES = 15;
    const minutesSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60);

    if (minutesSinceCreation > EDIT_TIME_LIMIT_MINUTES) {
      return res.status(400).json({
        status: false,
        message: `Posts can only be edited within ${EDIT_TIME_LIMIT_MINUTES} minutes of creation.`,
      });
    }

    post.content = content.trim();
    post.updatedAt = new Date();
    await post.save();

    return res.status(200).json({ status: true, message: "Post updated successfully", post });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to edit post" });
  }
});

// Delete post (within 30 minutes or by author)
router.delete("/:id", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: "Post not found" });

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user || post.user.toString() !== user._id.toString()) {
      return res.status(403).json({ status: false, message: "Unauthorized to delete this post" });
    }

    await Post.deleteOne({ _id: post._id });
    return res.status(200).json({ status: true, message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to delete post" });
  }
});

module.exports = router;
