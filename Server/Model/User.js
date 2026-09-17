const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },

    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    Password: {
      type: String,
      required: true,
    },

    PhoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    Photos: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "InternArea",
    },

    // Multi-language preference & history
    language: {
      type: String,
      default: "en",
      enum: ["en", "es", "hi", "pt", "zh", "fr"],
    },
    languageHistory: [
      {
        language: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        ip: { type: String, default: "" },
        browser: { type: String, default: "" },
        device: { type: String, default: "" },
      },
    ],

    // Password reset tracking
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    lastPasswordResetRequest: {
      type: Date,
    },
    passwordResetHistory: [
      {
        requestedAt: { type: Date, default: Date.now },
        method: { type: String, enum: ["email", "phone"] },
        identifier: { type: String },
        ip: { type: String },
        browser: { type: String },
        device: { type: String },
        status: { type: String, default: "completed" },
      },
    ],

    // Login Activity & Device Security
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        browser: { type: String, default: "" },
        browserVersion: { type: String, default: "" },
        os: { type: String, default: "" },
        deviceType: { type: String, default: "desktop" }, // desktop, laptop, tablet, mobile
        deviceModel: { type: String, default: "" },
        ip: { type: String, default: "" },
        location: { type: String, default: "" },
        status: { type: String, default: "success" }, // success, rejected_mobile_hours, otp_required, failed
        reason: { type: String, default: "" },
      },
    ],
    trustedDevices: [
      {
        deviceId: { type: String },
        browser: { type: String },
        os: { type: String },
        deviceType: { type: String },
        ip: { type: String },
        firstSeen: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now },
      },
    ],
    activeSessions: [
      {
        sessionId: { type: String },
        browser: { type: String },
        os: { type: String },
        deviceType: { type: String },
        ip: { type: String },
        loginTime: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
      },
    ],

    // Public Space & Community
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Subscription & Application Quota
    subscription: {
      plan: {
        type: String,
        enum: ["Free", "Bronze", "Silver", "Gold"],
        default: "Free",
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
      },
      applicationLimit: {
        type: Number,
        default: 1, // Free: 1, Bronze: 3, Silver: 5, Gold: 999999 (unlimited)
      },
      usedApplications: {
        type: Number,
        default: 0,
      },
      currentPeriodStart: {
        type: Date,
        default: Date.now,
      },
      currentPeriodEnd: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },

    // Resume builder defaults
    defaultResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", UserSchema);