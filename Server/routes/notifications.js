const express = require("express");
const router = express.Router();
const Notification = require("../Model/Notification");
const User = require("../Model/User");

// Get notifications for user
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const notifications = await Notification.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json({
      status: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch notifications" });
  }
});

// Mark all as read
router.post("/mark-all-read", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    await Notification.updateMany({ recipient: user._id, read: false }, { read: true });
    return res.status(200).json({ status: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to mark read" });
  }
});

module.exports = router;
