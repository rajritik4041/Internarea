"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/Components/Navbar";
import { API_BASE_URL } from "@/data/api";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Send,
  Sparkles,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  Search,
  Hash,
  AtSign,
  Image as ImageIcon,
} from "lucide-react";

export default function PublicSpacePage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Community state
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  // Post creation state
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"text" | "photo" | "video">("text");
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");

  // Comment drawer/state per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // User search / peer connect
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredUsers, setDiscoveredUsers] = useState<any[]>([]);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);

  const fetchSocialStatus = async (email: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/community/status/${encodeURIComponent(email)}`);
      if (res.data && res.data.status) {
        setFriendCount(res.data.friendCount || 0);
        setFriendsList(res.data.friends || []);
        setFriendRequests(res.data.friendRequestsReceived || []);
      }
    } catch (e) {}
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const email = currentUser?.Email || "";
      const res = await axios.get(`${API_BASE_URL}/api/posts/feed?email=${encodeURIComponent(email)}`);
      if (res.data && res.data.status) {
        setFeed(res.data.data || []);
        if (res.data.userFriendCount !== undefined) {
          setFriendCount(res.data.userFriendCount);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (query = "") => {
    try {
      const email = currentUser?.Email || "";
      const res = await axios.get(
        `${API_BASE_URL}/api/community/users?currentEmail=${encodeURIComponent(email)}&q=${encodeURIComponent(query)}`
      );
      if (res.data && res.data.status) {
        setDiscoveredUsers(res.data.data || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          fetchSocialStatus(parsed.Email);
        } catch (e) {}
      }
    }
    fetchFeed();
    fetchUsers();
  }, []);

  // Tier limit display
  const getPostingQuotaDisplay = (count: number) => {
    if (count <= 0) return { limit: 0, text: "0 Posts / Day (Requires at least 1 friend)" };
    if (count === 1) return { limit: 1, text: "1 Post / Day (1 Friend tier)" };
    if (count <= 5) return { limit: 2, text: "2 Posts / Day (2–5 Friends tier)" };
    if (count <= 10) return { limit: 5, text: "5 Posts / Day (6–10 Friends tier)" };
    return { limit: Infinity, text: "Unlimited Posts / Day (>10 Friends VIP tier)" };
  };

  const quotaInfo = getPostingQuotaDisplay(friendCount);

  // Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setPostError("Please log in to share posts with the community");
      return;
    }

    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setPostError("");
      setPostSuccess("");

      const res = await axios.post(`${API_BASE_URL}/api/posts`, {
        userEmail: currentUser.Email,
        content: content.trim(),
        mediaUrl: mediaUrl.trim(),
        mediaType: mediaUrl.trim() ? mediaType : "text",
        privacy: "public",
      });

      if (res.data && res.data.status) {
        setPostSuccess("Post published successfully to the Public Space!");
        setContent("");
        setMediaUrl("");
        fetchFeed();
        setTimeout(() => setPostSuccess(""), 3000);
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.code === "NO_FRIENDS_POST_BLOCKED") {
        setPostError("Posting Blocked: You must have at least 1 accepted friend to post in Public Space. Connect with peers from the right sidebar!");
      } else if (err.response?.status === 429) {
        setPostError(err.response.data.message || "Daily posting quota reached for your current friend tier.");
      } else {
        setPostError(err.response?.data?.message || "Failed to create post.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Like Post
  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {
        userEmail: currentUser.Email,
      });
      if (res.data && res.data.status) {
        setFeed((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const likes = p.likes || [];
              const isLiked = likes.some((id: any) => id.toString() === currentUser._id?.toString());
              return {
                ...p,
                likes: isLiked
                  ? likes.filter((id: any) => id.toString() !== currentUser._id?.toString())
                  : [...likes, currentUser._id],
              };
            }
            return p;
          })
        );
      }
    } catch (e) {}
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!currentUser || !commentText.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        userEmail: currentUser.Email,
        text: commentText.trim(),
      });
      if (res.data && res.data.status) {
        setFeed((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
        );
        setCommentText("");
      }
    } catch (e) {}
  };

  // Send Friend Request
  const handleSendFriendRequest = async (targetId: string) => {
    if (!currentUser) return;
    try {
      setConnectingUserId(targetId);
      await axios.post(`${API_BASE_URL}/api/community/friend-request`, {
        fromEmail: currentUser.Email,
        targetUserId: targetId,
      });
      fetchUsers(searchQuery);
    } catch (e) {
    } finally {
      setConnectingUserId(null);
    }
  };

  // Accept Friend Request
  const handleAcceptFriend = async (requesterId: string) => {
    if (!currentUser) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/community/accept-friend`, {
        userEmail: currentUser.Email,
        requesterId,
      });
      if (res.data && res.data.status) {
        setFriendCount(res.data.newFriendCount);
        fetchSocialStatus(currentUser.Email);
        fetchFeed();
      }
    } catch (e) {}
  };

  // Delete Own Post
  const handleDeletePost = async (postId: string) => {
    if (!currentUser || !confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
        data: { userEmail: currentUser.Email },
      });
      setFeed((prev) => prev.filter((p) => p._id !== postId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not delete post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Users size={14} /> InternArea Community Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("community.title", "Public Space Community")}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t(
                "community.subtitle",
                "Connect with students and professionals worldwide. Share project showcases, ask questions, and grow your career network."
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto">
            <div className="text-xs uppercase font-bold tracking-wider text-blue-200">
              Your Network Tier
            </div>
            <div className="text-2xl font-black mt-0.5">{friendCount} Friend{friendCount === 1 ? "" : "s"}</div>
            <div className="text-[11px] text-blue-100 mt-1 font-medium">
              {quotaInfo.text}
            </div>
          </div>
        </div>

        {/* Layout: Main Feed (Col 8) + Sidebar (Col 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post Box */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-600" /> Share an update or question
                </span>
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  Quota: {quotaInfo.text}
                </span>
              </div>

              {friendCount === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Friend Requirement:</strong> Users with 0 accepted friends cannot create posts. Connect with peers from the recommendations on the right to start posting!
                  </div>
                </div>
              )}

              {postError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {postError}
                </div>
              )}

              {postSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> {postSuccess}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Use #internship or @username to mention peers..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        if (e.target.value) setMediaType("photo");
                      }}
                      placeholder="Optional image URL (https://...)"
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 w-full sm:w-64 outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !content.trim() || friendCount === 0}
                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    {submitting ? "Publishing..." : "Post Update"}
                  </button>
                </div>
              </form>
            </div>

            {/* Feed Listings */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16 text-xs text-gray-400">Loading community feed...</div>
              ) : feed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-gray-700">No Posts in Feed Yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Be the first to share an opportunity, project, or learning note with your peers!
                  </p>
                </div>
              ) : (
                feed.map((post) => {
                  const isAuthor = currentUser && (post.user === currentUser._id || post.authorEmail === currentUser.Email);
                  const isLiked = currentUser && (post.likes || []).some((id: any) => id.toString() === currentUser._id?.toString());

                  return (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 transition hover:shadow-md"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                            {post.authorName ? post.authorName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                              {post.authorName || "Peer Student"}
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.2 rounded-full font-semibold">
                                {post.friendCountAtPosting || 0} Friends
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>

                        {isAuthor && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-gray-400 hover:text-red-600 p-1 transition"
                            title="Delete Post"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed mb-4">
                        {post.content}
                      </p>

                      {/* Media (if provided) */}
                      {post.mediaUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 max-h-96">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.mediaUrl}
                            alt="Post attachment"
                            className="w-full h-auto object-cover max-h-96"
                            onError={(e: any) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Post Actions: Like, Comment, Share */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition hover:bg-gray-100 ${
                            isLiked ? "text-red-600 font-bold" : ""
                          }`}
                        >
                          <Heart size={16} className={isLiked ? "fill-red-600 text-red-600" : ""} />
                          <span>{(post.likes || []).length} Likes</span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveCommentPostId(
                              activeCommentPostId === post._id ? null : post._id
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                          <MessageCircle size={16} />
                          <span>{(post.comments || []).length} Comments</span>
                        </button>

                        <button
                          onClick={() => {
                            axios.post(`${API_BASE_URL}/api/posts/${post._id}/share`);
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Share2 size={16} />
                          <span>{post.shares || 0} Shares</span>
                        </button>
                      </div>

                      {/* Comment Drawer */}
                      {activeCommentPostId === post._id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
                          <div className="space-y-2">
                            {(post.comments || []).map((c: any, i: number) => (
                              <div key={i} className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1">
                                <div className="font-bold text-gray-800 flex items-center justify-between">
                                  <span>{c.userName}</span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(c.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-700">{c.text}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post._id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Sidebar: Social Connect & Friend Requests */}
          <div className="lg:col-span-4 space-y-6">
            {/* Friend Requests Drawer */}
            {friendRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <UserPlus size={16} className="text-blue-600" /> Pending Requests
                  </span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {friendRequests.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {friendRequests.map((reqUser) => (
                    <div key={reqUser._id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <div className="font-bold text-xs text-gray-900 truncate">{reqUser.Name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{reqUser.Email}</div>
                      </div>
                      <button
                        onClick={() => handleAcceptFriend(reqUser._id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posting Tiers Guide Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Public Space Posting Rules
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                To prevent spam and foster genuine connections, daily posting privileges scale with your network:
              </p>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span>0 Friends</span>
                  <span className="font-bold text-red-600">No Posting</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span>1 Friend</span>
                  <span className="font-bold text-gray-800">1 Post / Day</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span>2–5 Friends</span>
                  <span className="font-bold text-gray-800">2 Posts / Day</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span>6–10 Friends</span>
                  <span className="font-bold text-gray-800">5 Posts / Day</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-blue-50 text-blue-800">
                  <span>&gt;10 Friends</span>
                  <span className="font-bold">Unlimited Posts</span>
                </div>
              </div>
            </div>

            {/* Discover Peers to Connect */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Connect with Peers
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchUsers(e.target.value);
                  }}
                  placeholder="Search students..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {discoveredUsers.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">No other users found</div>
                ) : (
                  discoveredUsers.map((u) => {
                    const isAlreadyFriend = friendsList.some((f) => f._id === u._id);
                    return (
                      <div
                        key={u._id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-gray-50 transition border border-gray-100"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.Name ? u.Name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-gray-900 truncate">{u.Name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{u.company || "InternArea Member"}</div>
                          </div>
                        </div>

                        {isAlreadyFriend ? (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md shrink-0">
                            Friend
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(u._id)}
                            disabled={connectingUserId === u._id}
                            className="px-2 py-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-semibold rounded-lg shrink-0 transition"
                          >
                            + Connect
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
