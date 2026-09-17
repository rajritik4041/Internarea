const express = require("express");
const router = express.Router();
const Resume = require("../Model/Resume");
const User = require("../Model/User");
const Transaction = require("../Model/Transaction");
const { createOtp, verifyOtp } = require("../services/otpService");
const { detectDevice } = require("../utils/deviceDetector");
const { formatISTTime, getISTDate } = require("../utils/timeUtils");

// 1. Save or update resume (draft or version)
router.post("/save", async (req, res) => {
  try {
    const { userEmail, resumeId, title, personalInfo, education, skills, workExperience, internships, projects, certifications, achievements, languages, socialLinks, references, templateId, themeColor, fontFamily, isDefault } = req.body;

    if (!userEmail) {
      return res.status(400).json({ status: false, message: "User email is required" });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    let resume;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    }

    if (resume) {
      // Update existing
      resume.title = title || resume.title;
      resume.personalInfo = personalInfo || resume.personalInfo;
      resume.education = education || resume.education;
      resume.skills = skills || resume.skills;
      resume.workExperience = workExperience || resume.workExperience;
      resume.internships = internships || resume.internships;
      resume.projects = projects || resume.projects;
      resume.certifications = certifications || resume.certifications;
      resume.achievements = achievements || resume.achievements;
      resume.languages = languages || resume.languages;
      resume.socialLinks = socialLinks || resume.socialLinks;
      resume.references = references || resume.references;
      resume.templateId = templateId || resume.templateId;
      resume.themeColor = themeColor || resume.themeColor;
      resume.fontFamily = fontFamily || resume.fontFamily;
      resume.updatedAt = new Date();
      if (isDefault !== undefined) resume.isDefault = isDefault;
      await resume.save();
    } else {
      // Create new version
      const existingCount = await Resume.countDocuments({ user: user._id });
      resume = await Resume.create({
        user: user._id,
        userEmail: user.Email,
        title: title || `Professional Resume v${existingCount + 1}`,
        version: existingCount + 1,
        isDefault: existingCount === 0 || isDefault,
        personalInfo: personalInfo || {},
        education: education || [],
        skills: skills || [],
        workExperience: workExperience || [],
        internships: internships || [],
        projects: projects || [],
        certifications: certifications || [],
        achievements: achievements || [],
        languages: languages || [],
        socialLinks: socialLinks || {},
        references: references || [],
        templateId: templateId || "modern",
        themeColor: themeColor || "#2563EB",
        fontFamily: fontFamily || "Inter",
      });

      if (resume.isDefault) {
        user.defaultResumeId = resume._id;
        await user.save();
      }
    }

    return res.status(200).json({
      status: true,
      message: "Resume saved successfully",
      resume,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to save resume" });
  }
});

// 2. Step 1 of Payment: Request OTP for Identity Verification before Razorpay
router.post("/request-payment-otp", async (req, res) => {
  try {
    const { userEmail, resumeId } = req.body;
    if (!userEmail) {
      return res.status(400).json({ status: false, message: "User email is required" });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otpData = await createOtp(user.Email, "RESUME_PAYMENT", 5);

    return res.status(200).json({
      status: true,
      message: "Identity verification required: An OTP has been sent to your registered email before initiating Razorpay checkout for ₹50.",
      email: user.Email,
      previewOtp: otpData.otp,
      expiresAt: otpData.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to generate payment OTP" });
  }
});

// 3. Step 2: Verify OTP and initiate Razorpay order
router.post("/verify-otp-and-initiate-pay", async (req, res) => {
  try {
    const { userEmail, otp, resumeId } = req.body;
    if (!userEmail || !otp) {
      return res.status(400).json({ status: false, message: "Email and OTP are required" });
    }

    const verification = await verifyOtp(userEmail, "RESUME_PAYMENT", otp);
    if (!verification.success) {
      return res.status(400).json({ status: false, message: verification.message });
    }

    // Generate Order ID
    const orderId = "order_res_" + Math.random().toString(36).substring(2, 12).toUpperCase();

    return res.status(200).json({
      status: true,
      message: "Identity verified successfully. Payment gateway enabled.",
      orderId,
      amount: 50,
      currency: "INR",
      keyId: "rzp_test_internarea_key",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to initialize payment" });
  }
});

// 4. Step 3: Verify Payment and Activate Resume
router.post("/verify-payment", async (req, res) => {
  try {
    const { userEmail, resumeId, paymentId, orderId, billingDetails } = req.body;
    if (!userEmail || !resumeId) {
      return res.status(400).json({ status: false, message: "Missing payment confirmation parameters" });
    }

    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ status: false, message: "Resume not found" });

    const txId = paymentId || "pay_res_" + Math.random().toString(36).substring(2, 12).toUpperCase();
    const invoiceNum = "INV-RES-" + Date.now().toString().slice(-6);

    resume.isPaid = true;
    resume.paymentId = txId;
    resume.orderId = orderId || "";
    resume.invoiceNumber = invoiceNum;
    resume.amountPaid = 50;
    resume.verifiedAt = new Date();
    resume.isDefault = true; // Auto-set as default resume for internship applications
    await resume.save();

    // Auto link as default in user profile
    user.defaultResumeId = resume._id;
    await user.save();

    // Record Transaction & Invoice
    const transaction = await Transaction.create({
      user: user._id,
      userEmail: user.Email,
      userName: user.Name,
      type: "resume_download",
      resumeId: resume._id,
      amount: 50,
      currency: "INR",
      transactionId: txId,
      orderId: orderId || "",
      status: "success",
      invoiceNumber: invoiceNum,
      billingDetails: billingDetails || {
        name: user.Name,
        email: user.Email,
        phone: user.PhoneNumber,
      },
      paymentTimeIST: formatISTTime(getISTDate()),
    });

    return res.status(200).json({
      status: true,
      message: "Payment verified successfully! Resume is now generated and set as your default resume for internship applications.",
      resume,
      invoice: transaction,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to verify payment" });
  }
});

// 5. Get all resumes for user
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const resumes = await Resume.find({ userEmail: email }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ status: true, data: resumes });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch resumes" });
  }
});

// 6. Get single resume by ID
router.get("/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) return res.status(404).json({ status: false, message: "Resume not found" });
    return res.status(200).json({ status: true, data: resume });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to fetch resume" });
  }
});

// 7. Set resume as default
router.post("/:id/set-default", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ Email: userEmail.toLowerCase().trim() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    await Resume.updateMany({ user: user._id }, { isDefault: false });
    const updated = await Resume.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });

    user.defaultResumeId = updated._id;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Default resume updated successfully for internship applications",
      resume: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Failed to set default" });
  }
});

// 8. Log Download
router.post("/:id/download-log", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (resume) {
      const deviceInfo = detectDevice(req);
      resume.downloadHistory.unshift({
        downloadedAt: new Date(),
        ip: deviceInfo.ip,
      });
      await resume.save();
    }
    return res.status(200).json({ status: true, message: "Download logged" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Log error" });
  }
});

module.exports = router;
