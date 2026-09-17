const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const { detectDevice } = require("../utils/deviceDetector");
const { createOtp, verifyOtp, generateLettersOnlyPassword } = require("../services/otpService");

// Step 1: Request Password Reset OTP (with 24-hour restriction)
router.post("/request", async (req, res) => {
  try {
    const { method, identifier } = req.body; // method: "email" | "phone", identifier: email or phone string
    if (!method || !identifier) {
      return res.status(400).json({
        status: false,
        message: "Reset method and email/phone identifier are required",
      });
    }

    const normalizedId = identifier.trim().toLowerCase();
    const query =
      method === "phone"
        ? { PhoneNumber: identifier.trim() }
        : { Email: normalizedId };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: `No account found with this ${method === "phone" ? "mobile number" : "email address"}.`,
      });
    }

    // Check 24-hour rate limit restriction
    const now = new Date();
    if (user.lastPasswordResetRequest) {
      const hoursSinceLastRequest = (now.getTime() - new Date(user.lastPasswordResetRequest).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRequest < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastRequest);
        return res.status(429).json({
          status: false,
          code: "RESET_LIMIT_EXCEEDED",
          message: "You can use this option only once per day.",
          hoursRemaining,
        });
      }
    }

    // Generate OTP
    const otpData = await createOtp(user.Email, "FORGOT_PASSWORD", 10);
    const deviceInfo = detectDevice(req);

    // Record request timestamp & audit entry
    user.lastPasswordResetRequest = now;
    user.passwordResetHistory.unshift({
      requestedAt: now,
      method: method,
      identifier: identifier.trim(),
      ip: deviceInfo.ip,
      browser: deviceInfo.browser,
      device: deviceInfo.deviceType,
      status: "otp_sent",
    });

    await user.save();

    return res.status(200).json({
      status: true,
      message: `A verification OTP has been sent to your registered ${method === "phone" ? "mobile number" : "email address"}.`,
      email: user.Email,
      previewOtp: otpData.otp, // Preview for testing / verification
      expiresAt: otpData.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to initiate password reset",
    });
  }
});

// Step 2: Verify OTP and Generate Letters-Only Random Password
router.post("/verify-and-reset", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({
        status: false,
        message: "Identifier and OTP are required",
      });
    }

    const normalizedId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ Email: normalizedId }, { PhoneNumber: identifier.trim() }],
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User account not found",
      });
    }

    // Verify OTP
    const verification = await verifyOtp(user.Email, "FORGOT_PASSWORD", otp);
    if (!verification.success) {
      return res.status(400).json({
        status: false,
        message: verification.message,
      });
    }

    // Requirement: Generate random password consisting ONLY of uppercase and lowercase English letters
    // without any numbers or special characters.
    const newRandomPassword = generateLettersOnlyPassword(12);

    // Ensure it strictly matches /^[A-Za-z]+$/
    if (!/^[a-zA-Z]+$/.test(newRandomPassword)) {
      throw new Error("Generated password violates alphabet-only constraint");
    }

    // Securely update database
    user.Password = newRandomPassword;
    user.mustChangePassword = true; // Required to change password immediately after next login

    const deviceInfo = detectDevice(req);
    user.passwordResetHistory.unshift({
      requestedAt: new Date(),
      method: "email",
      identifier: user.Email,
      ip: deviceInfo.ip,
      browser: deviceInfo.browser,
      device: deviceInfo.deviceType,
      status: "reset_successful",
    });

    await user.save();

    console.log(`[FORGOT PASSWORD] New letters-only password generated for ${user.Email}: ${newRandomPassword}`);

    return res.status(200).json({
      status: true,
      message: "Password reset successful! A newly generated random password consisting strictly of English letters has been created and sent to your verified contact.",
      generatedPassword: newRandomPassword, // Sent in response / email preview for direct verification
      mustChangePassword: true,
      instructions: "You must change this temporary password immediately after your next login.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to complete password reset",
    });
  }
});

module.exports = router;
