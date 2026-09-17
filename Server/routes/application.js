const express = require("express");
const router = express.Router();
const Application = require("../Model/Application");
const User = require("../Model/User");
const Resume = require("../Model/Resume");

router.post("/", async (req, res) => {
  try {
    const { company, category, coverLetter, user: clientUser, Application: appDetails, resumeId } = req.body;

    if (!clientUser || (!coverLetter && coverLetter !== "")) {
      return res.status(400).json({
        status: false,
        message: "Missing application data",
      });
    }

    const email = (clientUser.Email || clientUser.email || "").toLowerCase().trim();
    let dbUser = await User.findOne({ Email: email });

    // Quota Enforcement
    if (dbUser) {
      if (!dbUser.subscription) {
        dbUser.subscription = {
          plan: "Free",
          status: "active",
          applicationLimit: 1,
          usedApplications: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
      }

      // Check quota
      const limit = dbUser.subscription.applicationLimit || 1;
      const used = dbUser.subscription.usedApplications || 0;

      if (used >= limit) {
        return res.status(403).json({
          status: false,
          code: "QUOTA_EXHAUSTED",
          message: `You have exhausted your monthly internship application quota (${used}/${limit}). Upgrade your subscription plan to apply for more opportunities!`,
          plan: dbUser.subscription.plan,
          usedApplications: used,
          applicationLimit: limit,
        });
      }

      // Increment quota
      dbUser.subscription.usedApplications += 1;
      await dbUser.save();
    }

    // Default resume linkage
    let attachedResumeId = resumeId || (dbUser ? dbUser.defaultResumeId : null);
    let attachedResumeData = null;
    if (attachedResumeId) {
      attachedResumeData = await Resume.findById(attachedResumeId).select("title version templateId personalInfo isPaid").lean();
    }

    const newApp = await Application.create({
      company: company || (appDetails && appDetails.company) || "InternArea Partner",
      category: category || (appDetails && appDetails.category) || "General",
      coverLetter: coverLetter || "",
      user: dbUser ? {
        _id: dbUser._id,
        Name: dbUser.Name,
        Email: dbUser.Email,
        PhoneNumber: dbUser.PhoneNumber,
        Photos: dbUser.Photos,
      } : clientUser,
      Application: {
        ...(appDetails || {}),
        attachedResume: attachedResumeData || undefined,
      },
      status: "pending",
    });

    return res.status(201).json({
      status: true,
      message: "Application submitted successfully",
      data: newApp,
      remainingQuota: dbUser ? Math.max(0, (dbUser.subscription.applicationLimit || 1) - dbUser.subscription.usedApplications) : 0,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to submit application",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      status: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch applications",
    });
  }
});

router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const applications = await Application.find({
      $or: [
        { "user.Email": email },
        { "user.email": email },
      ],
    }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch user applications",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update status",
    });
  }
});

module.exports = router;
