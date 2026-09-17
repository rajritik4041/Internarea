const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Transaction = require("../Model/Transaction");
const { isSubscriptionPaymentWindowAllowed, formatISTTime, getISTDate } = require("../utils/timeUtils");

const PLAN_DETAILS = {
  Free: { price: 0, limit: 1, name: "Free" },
  Bronze: { price: 100, limit: 3, name: "Bronze" },
  Silver: { price: 300, limit: 5, name: "Silver" },
  Gold: { price: 1000, limit: 999999, name: "Gold (Unlimited)" },
};

// 1. Get Subscription Status & Plan options
router.get("/status/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Check if billing cycle has expired and reset monthly quota
    const now = new Date();
    if (user.subscription && user.subscription.currentPeriodEnd && now > new Date(user.subscription.currentPeriodEnd)) {
      user.subscription.usedApplications = 0;
      user.subscription.currentPeriodStart = now;
      user.subscription.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    const windowCheck = isSubscriptionPaymentWindowAllowed();

    return res.status(200).json({
      status: true,
      subscription: user.subscription || {
        plan: "Free",
        status: "active",
        applicationLimit: 1,
        usedApplications: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      paymentWindow: windowCheck,
      plans: PLAN_DETAILS,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch subscription status" });
  }
});

// 2. Initiate Payment (Checks 5:00 AM - 11:45 AM IST window)
router.post("/initiate-payment", async (req, res) => {
  try {
    const { userEmail, plan } = req.body;

    if (!userEmail || !plan || !PLAN_DETAILS[plan]) {
      return res.status(400).json({ status: false, message: "Valid user email and plan are required" });
    }

    // Strict security check: Payment must be between 5:00 AM and 11:45 AM IST
    const windowCheck = isSubscriptionPaymentWindowAllowed();
    if (!windowCheck.allowed) {
      return res.status(403).json({
        status: false,
        code: "PAYMENT_HOURS_RESTRICTED",
        message: windowCheck.message,
        currentTimeIST: windowCheck.currentTimeIST,
        requiredWindow: windowCheck.requiredWindow,
      });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const selectedPlan = PLAN_DETAILS[plan];
    const orderId = "order_sub_" + Math.random().toString(36).substring(2, 12).toUpperCase();

    return res.status(200).json({
      status: true,
      message: "Payment window verified. Gateway ready.",
      orderId,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      currency: "INR",
      keyId: "rzp_test_internarea_key",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to initiate payment" });
  }
});

// 3. Verify Payment & Activate Plan
router.post("/verify-payment", async (req, res) => {
  try {
    const { userEmail, plan, paymentId, orderId, billingDetails } = req.body;

    if (!userEmail || !plan || !PLAN_DETAILS[plan]) {
      return res.status(400).json({ status: false, message: "Missing required parameters" });
    }

    // Verify payment window
    const windowCheck = isSubscriptionPaymentWindowAllowed();
    if (!windowCheck.allowed) {
      return res.status(403).json({
        status: false,
        code: "PAYMENT_HOURS_RESTRICTED",
        message: windowCheck.message,
        currentTimeIST: windowCheck.currentTimeIST,
      });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const selectedPlan = PLAN_DETAILS[plan];
    const txId = paymentId || "pay_sub_" + Math.random().toString(36).substring(2, 12).toUpperCase();
    const invoiceNum = "INV-SUB-" + Date.now().toString().slice(-6);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update User Subscription & Quota
    user.subscription = {
      plan: plan,
      status: "active",
      applicationLimit: selectedPlan.limit,
      usedApplications: 0, // Reset usage on purchase/upgrade
      currentPeriodStart: new Date(),
      currentPeriodEnd: validUntil,
    };
    await user.save();

    // Create Invoice & Transaction Record
    const transaction = await Transaction.create({
      user: user._id,
      userEmail: user.Email,
      userName: user.Name,
      type: "subscription",
      plan: plan,
      amount: selectedPlan.price,
      currency: "INR",
      transactionId: txId,
      orderId: orderId || "",
      status: "success",
      invoiceNumber: invoiceNum,
      billingDetails: billingDetails || {
        name: user.Name,
        email: user.Email,
        phone: user.PhoneNumber,
        address: "Online Subscription",
      },
      paymentTimeIST: formatISTTime(getISTDate()),
      validUntil: validUntil,
    });

    return res.status(200).json({
      status: true,
      message: `Congratulations! Your ${plan} plan has been activated successfully. You now have ${selectedPlan.limit === 999999 ? "unlimited" : selectedPlan.limit} internship applications this month!`,
      subscription: user.subscription,
      invoice: transaction,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to activate subscription" });
  }
});

// 4. Cancel subscription
router.post("/cancel", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    user.subscription.status = "cancelled";
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Subscription cancelled. Current plan features will remain active until end of billing period.",
      subscription: user.subscription,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Cancel failed" });
  }
});

// 5. Invoices list for user
router.get("/invoices/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const invoices = await Transaction.find({ userEmail: email }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ status: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch invoices" });
  }
});

module.exports = router;
