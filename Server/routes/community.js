const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Notification = require("../Model/Notification");

// Get social connection state for current user
router.get("/status/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ Email: email })
      .populate("friends", "Name Email Photos company")
      .populate("friendRequestsReceived", "Name Email Photos company")
      .populate("friendRequestsSent", "Name Email Photos company")
      .lean();

    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    return res.status(200).json({
      status: true,
      friends: user.friends || [],
      friendRequestsReceived: user.friendRequestsReceived || [],
      friendRequestsSent: user.friendRequestsSent || [],
      following: user.following || [],
      friendCount: user.friends ? user.friends.length : 0,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch status" });
  }
});

// Search potential peers / users
router.get("/users", async (req, res) => {
  try {
    const { q, currentEmail } = req.query;
    const filter = { Email: { $ne: (currentEmail || "").toLowerCase().trim() } };

    if (q) {
      filter.$or = [
        { Name: { $regex: q, $options: "i" } },
        { Email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("Name Email Photos company friends")
      .limit(20)
      .lean();

    return res.status(200).json({ status: true, data: users });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to search users" });
  }
});

// Send Friend Request
router.post("/friend-request", async (req, res) => {
  try {
    const { fromEmail, targetUserId } = req.body;
    const sender = await User.findOne({ Email: fromEmail.toLowerCase().trim() });
    const target = await User.findById(targetUserId);

    if (!sender || !target) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (sender._id.toString() === target._id.toString()) {
      return res.status(400).json({ status: false, message: "Cannot send friend request to yourself" });
    }

    // Check if already friends
    if (sender.friends.includes(target._id)) {
      return res.status(400).json({ status: false, message: "You are already friends" });
    }

    // Check if request already sent
    if (sender.friendRequestsSent.includes(target._id)) {
      return res.status(400).json({ status: false, message: "Friend request already sent" });
    }

    sender.friendRequestsSent.push(target._id);
    target.friendRequestsReceived.push(sender._id);

    await sender.save();
    await target.save();

    await Notification.create({
      recipient: target._id,
      sender: sender._id,
      senderName: sender.Name,
      type: "friend_request",
      title: "New Friend Request",
      message: `${sender.Name} sent you a friend request.`,
      link: "/public-space",
    });

    return res.status(200).json({ status: true, message: "Friend request sent successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to send request" });
  }
});

// Accept Friend Request
router.post("/accept-friend", async (req, res) => {
  try {
    const { userEmail, requesterId } = req.body;
    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Remove from requests
    user.friendRequestsReceived = user.friendRequestsReceived.filter((id) => id.toString() !== requesterId);
    requester.friendRequestsSent = requester.friendRequestsSent.filter((id) => id.toString() !== user._id.toString());

    // Add to friends
    if (!user.friends.includes(requester._id)) user.friends.push(requester._id);
    if (!requester.friends.includes(user._id)) requester.friends.push(user._id);

    await user.save();
    await requester.save();

    await Notification.create({
      recipient: requester._id,
      sender: user._id,
      senderName: user.Name,
      type: "friend_accept",
      title: "Friend Request Accepted",
      message: `${user.Name} accepted your friend request! You can now view each other's posts and unlock higher posting tiers.`,
      link: "/public-space",
    });

    return res.status(200).json({
      status: true,
      message: "Friend request accepted",
      newFriendCount: user.friends.length,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to accept friend" });
  }
});

// Follow / Unfollow user
router.post("/toggle-follow", async (req, res) => {
  try {
    const { userEmail, targetUserId } = req.body;
    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    const target = await User.findById(targetUserId);

    if (!user || !target) return res.status(404).json({ status: false, message: "User not found" });

    const isFollowing = user.following.some((id) => id.toString() === targetUserId);
    if (isFollowing) {
      user.following = user.following.filter((id) => id.toString() !== targetUserId);
      target.followers = target.followers.filter((id) => id.toString() !== user._id.toString());
    } else {
      user.following.push(target._id);
      target.followers.push(user._id);
    }

    await user.save();
    await target.save();

    return res.status(200).json({ status: true, following: !isFollowing });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to toggle follow" });
  }
});

module.exports = router;
