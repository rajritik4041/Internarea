const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: { type: String, default: "System" },
    type: {
      type: String,
      enum: ["like", "comment", "share", "friend_request", "friend_accept", "mention", "subscription", "security", "resume"],
      required: true,
    },
    title: { type: String, default: "" },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
