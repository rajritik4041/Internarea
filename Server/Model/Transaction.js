const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["resume_download", "subscription"],
      required: true,
    },
    plan: {
      type: String,
      enum: ["None", "Bronze", "Silver", "Gold"],
      default: "None",
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      default: "",
    },
    paymentGateway: {
      type: String,
      default: "Razorpay_TestMode",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending", "cancelled"],
      default: "success",
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    billingDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String, default: "Online Purchase" },
    },
    paymentTimeIST: {
      type: String,
      default: "",
    },
    validUntil: {
      type: Date,
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

module.exports = mongoose.model("Transaction", TransactionSchema);
