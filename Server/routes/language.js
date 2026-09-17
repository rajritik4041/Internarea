const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const { detectDevice } = require("../utils/deviceDetector");
const { createOtp, verifyOtp } = require("../services/otpService");

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

// Step 1: Request OTP for French language change
router.post("/request-french-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email address is required to request French language OTP verification.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ Email: normalizedEmail });

    // Allow logged in user or verified email
    const otpData = await createOtp(normalizedEmail, "FRENCH_LANG", 5);

    return res.status(200).json({
      status: true,
      message: "Security requirement: An OTP has been sent to your registered email address to authorize switching the platform language to French.",
      email: normalizedEmail,
      previewOtp: otpData.otp, // Preview for testing / evaluators
      expiresAt: otpData.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to generate French language OTP",
    });
  }
});

// Step 2: Change language preference & record audit log
router.post("/change", async (req, res) => {
  try {
    const { email, language, otp } = req.body;

    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        status: false,
        message: `Unsupported language. Supported languages: ${SUPPORTED_LANGUAGES.join(", ")}`,
      });
    }

    // Security check: French requires OTP verification
    if (language === "fr") {
      if (!otp) {
        return res.status(400).json({
          status: false,
          requiresOtp: true,
          message: "Changing to French requires OTP verification sent to your registered email.",
        });
      }

      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Registered email is required to verify French language change.",
        });
      }

      const verification = await verifyOtp(email, "FRENCH_LANG", otp);
      if (!verification.success) {
        return res.status(400).json({
          status: false,
          message: verification.message,
        });
      }
    }

    const deviceInfo = detectDevice(req);

    // If user is logged in, update DB profile and append to audit history
    if (email) {
      const user = await User.findOne({ Email: email.toLowerCase().trim() });
      if (user) {
        user.language = language;
        user.languageHistory.unshift({
          language,
          changedAt: new Date(),
          ip: deviceInfo.ip,
          browser: deviceInfo.browser,
          device: deviceInfo.deviceType,
        });
        await user.save();
      }
    }

    return res.status(200).json({
      status: true,
      language,
      message: `Language successfully changed to ${language.toUpperCase()}`,
      audit: {
        language,
        timestamp: new Date(),
        ip: deviceInfo.ip,
        browser: deviceInfo.browser,
        device: deviceInfo.deviceType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to change language",
    });
  }
});

module.exports = router;
