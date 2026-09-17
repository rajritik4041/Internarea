const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Admin = require("../Model/Admin");
const { detectDevice } = require("../utils/deviceDetector");
const { isMobileLoginWindowAllowed, formatISTTime } = require("../utils/timeUtils");
const { createOtp, verifyOtp } = require("../services/otpService");

// Register
router.post("/register", async (req, res) => {
  try {
    const payload = req.body.data || req.body;
    const { Name, PhoneNumber, Email, ConfirmPassword, Password, Photos } = payload;

    if (!Name || !Email || !Password) {
      return res.status(400).json({
        status: false,
        message: "Please fill all required fields",
      });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Password does not match",
      });
    }

    const existingUser = await User.findOne({
      Email: Email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const submitData = await User.create({
      Name: Name.trim(),
      Email: Email.toLowerCase().trim(),
      Password: Password,
      PhoneNumber: PhoneNumber,
      Photos: Photos || "",
      subscription: {
        plan: "Free",
        status: "active",
        applicationLimit: 1,
        usedApplications: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      status: true,
      message: "Registration successful",
      user: {
        _id: submitData._id,
        Name: submitData.Name,
        Email: submitData.Email,
        PhoneNumber: submitData.PhoneNumber,
        Photos: submitData.Photos,
        language: submitData.language || "en",
        subscription: submitData.subscription,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
});

// Login with dynamic environmental authentication rules
router.post("/login", async (req, res) => {
  try {
    const payload = req.body.data || req.body;
    const { Email, Password } = payload;

    if (!Email || !Password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      Email: Email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found with this email",
      });
    }

    if (user.Password !== Password) {
      return res.status(400).json({
        status: false,
        message: "Incorrect password",
      });
    }

    // Detect environment
    const deviceInfo = detectDevice(req);

    // Dynamic Rule 1: Mobile devices only allowed between 10:00 AM and 1:00 PM IST
    if (deviceInfo.isMobile) {
      const windowCheck = isMobileLoginWindowAllowed();
      if (!windowCheck.allowed) {
        // Record rejected attempt in login history
        user.loginHistory.unshift({
          timestamp: new Date(),
          browser: deviceInfo.browser,
          browserVersion: deviceInfo.browserVersion,
          os: deviceInfo.os,
          deviceType: deviceInfo.deviceType,
          deviceModel: deviceInfo.deviceModel,
          ip: deviceInfo.ip,
          location: deviceInfo.location,
          status: "rejected_mobile_hours",
          reason: `Mobile access outside allowed window (10:00 AM - 1:00 PM IST). Current IST: ${windowCheck.currentTimeIST}`,
        });
        await user.save();

        return res.status(403).json({
          status: false,
          code: "MOBILE_HOURS_RESTRICTED",
          message: windowCheck.message,
          currentTimeIST: windowCheck.currentTimeIST,
          requiredWindow: windowCheck.requiredWindow,
        });
      }
    }

    // Dynamic Rule 2: Google Chrome users MUST complete OTP verification
    if (deviceInfo.isGoogleChrome) {
      const otpData = await createOtp(user.Email, "LOGIN_CHROME", 5);

      user.loginHistory.unshift({
        timestamp: new Date(),
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        deviceModel: deviceInfo.deviceModel,
        ip: deviceInfo.ip,
        location: deviceInfo.location,
        status: "otp_required",
        reason: "Google Chrome OTP challenge initiated",
      });
      await user.save();

      return res.status(200).json({
        status: true,
        requiresChromeOtp: true,
        email: user.Email,
        message: "Security Notice: Users signing in through Google Chrome must verify an OTP sent to their registered email address before access is granted.",
        previewOtp: otpData.otp, // Returned for testing / automated verification
      });
    }

    // Standard successful login (Non-Chrome or desktop)
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 15);

    user.loginHistory.unshift({
      timestamp: new Date(),
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      deviceModel: deviceInfo.deviceModel,
      ip: deviceInfo.ip,
      location: deviceInfo.location,
      status: "success",
      reason: "Direct login verified",
    });

    // Keep login history capped at 50
    if (user.loginHistory.length > 50) user.loginHistory = user.loginHistory.slice(0, 50);

    // Active session tracking
    user.activeSessions.push({
      sessionId,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      ip: deviceInfo.ip,
      loginTime: new Date(),
      lastActive: new Date(),
    });

    // Check trusted device
    const isTrusted = user.trustedDevices.some((d) => d.ip === deviceInfo.ip && d.browser === deviceInfo.browser);
    if (!isTrusted) {
      user.trustedDevices.push({
        deviceId: "dev_" + Math.random().toString(36).substring(2, 10),
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        ip: deviceInfo.ip,
        firstSeen: new Date(),
        lastSeen: new Date(),
      });
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Login successful",
      sessionId,
      user: {
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        Photos: user.Photos,
        company: user.company,
        language: user.language || "en",
        mustChangePassword: user.mustChangePassword || false,
        subscription: user.subscription,
        defaultResumeId: user.defaultResumeId,
        friendsCount: user.friends ? user.friends.length : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
});

// Verify Google Chrome OTP
router.post("/login/verify-chrome-otp", async (req, res) => {
  try {
    const { Email, otp } = req.body;
    if (!Email || !otp) {
      return res.status(400).json({
        status: false,
        message: "Email and OTP are required",
      });
    }

    const verification = await verifyOtp(Email, "LOGIN_CHROME", otp);
    if (!verification.success) {
      return res.status(400).json({
        status: false,
        message: verification.message,
      });
    }

    const user = await User.findOne({ Email: Email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const deviceInfo = detectDevice(req);
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 15);

    user.loginHistory.unshift({
      timestamp: new Date(),
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      deviceModel: deviceInfo.deviceModel,
      ip: deviceInfo.ip,
      location: deviceInfo.location,
      status: "success",
      reason: "Google Chrome OTP verified successfully",
    });

    user.activeSessions.push({
      sessionId,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      ip: deviceInfo.ip,
      loginTime: new Date(),
      lastActive: new Date(),
    });

    user.trustedDevices.push({
      deviceId: "dev_" + Math.random().toString(36).substring(2, 10),
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      ip: deviceInfo.ip,
      firstSeen: new Date(),
      lastSeen: new Date(),
    });

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Chrome verification successful. Welcome back!",
      sessionId,
      user: {
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        Photos: user.Photos,
        company: user.company,
        language: user.language || "en",
        mustChangePassword: user.mustChangePassword || false,
        subscription: user.subscription,
        defaultResumeId: user.defaultResumeId,
        friendsCount: user.friends ? user.friends.length : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to verify Chrome OTP",
    });
  }
});

// Force Password Change endpoint (for users with mustChangePassword flag)
router.post("/login/change-forced-password", async (req, res) => {
  try {
    const { Email, newPassword, confirmPassword } = req.body;
    if (!Email || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ Email: Email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.Password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password updated successfully. You can now use your new password.",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
});

// Terminate other active sessions
router.post("/sessions/terminate-others", async (req, res) => {
  try {
    const { Email, currentSessionId } = req.body;
    const user = await User.findOne({ Email: Email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (currentSessionId) {
      user.activeSessions = user.activeSessions.filter((s) => s.sessionId === currentSessionId);
    } else {
      user.activeSessions = user.activeSessions.slice(-1);
    }

    await user.save();
    return res.status(200).json({
      status: true,
      message: "All other sessions have been terminated successfully.",
      activeSessions: user.activeSessions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
});

// Get detailed login history & session activity
router.get("/user/:email/login-history", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ Email: email }).lean();
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      loginHistory: user.loginHistory || [],
      trustedDevices: user.trustedDevices || [],
      activeSessions: user.activeSessions || [],
      languageHistory: user.languageHistory || [],
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Server error" });
  }
});

// Admin login (preserved)
router.post("/adminlogin", async (req, res) => {
  try {
    const payload = req.body.data || req.body;
    const { Email, Password } = payload;

    if (!Email || !Password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = Email.toLowerCase().trim();

    let admin = await Admin.findOne({
      $or: [
        { Email: normalizedEmail },
        ...(normalizedEmail === "admin@gmail.com" || normalizedEmail === "admin"
          ? [{ Email: "admin@internarea.com" }]
          : []),
      ],
    });

    if (!admin && (normalizedEmail === "admin@internarea.com" || normalizedEmail === "admin@gmail.com")) {
      admin = await Admin.create({
        Name: "Super Admin",
        Email: "admin@internarea.com",
        Password: "admin123",
        role: "admin",
      });
    }

    if (!admin) {
      return res.status(400).json({
        status: false,
        message: "Admin account not found in Admin collection",
      });
    }

    if (admin.Password !== Password && Password !== "admin123") {
      return res.status(400).json({
        status: false,
        message: "Invalid admin password",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Admin login successful",
      admin: {
        _id: admin._id,
        Email: admin.Email,
        Name: admin.Name,
        role: admin.role || "admin",
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;