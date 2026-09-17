const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: { type: String, required: true },
  userPhoto: { type: String, default: "" },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorPhoto: { type: String, default: "" },

    content: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["text", "photo", "video"],
      default: "text",
    },

    // Metadata required by spec:
    friendCountAtPosting: {
      type: Number,
      required: true,
      default: 0,
    },
    privacy: {
      type: String,
      enum: ["public", "friends"],
      default: "public",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [CommentSchema],
    shares: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 1,
    },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reports: [ReportSchema],

    hashtags: [{ type: String }],
    mentions: [{ type: String }],

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Post", PostSchema);
