const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["FRENCH_LANG", "LOGIN_CHROME", "FORGOT_PASSWORD", "RESUME_PAYMENT"],
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: Mongo deletes document when current time > expiresAt
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

module.exports = mongoose.model("Otp", OtpSchema);
