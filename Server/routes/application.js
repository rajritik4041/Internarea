const express = require("express");
const router = express.Router();
const Application = require("../Model/Application");

router.post("/", async (req, res) => {
  try {
    const { company, category, coverLetter, user, Application: appDetails } = req.body;

    if (!user || (!coverLetter && coverLetter !== "")) {
      return res.status(400).json({
        status: false,
        message: "Missing application data",
      });
    }

    const newApp = await Application.create({
      company: company || (appDetails && appDetails.company) || "InternArea Partner",
      category: category || (appDetails && appDetails.category) || "General",
      coverLetter: coverLetter || "",
      user: user,
      Application: appDetails || {},
      status: "pending",
    });

    return res.status(201).json({
      status: true,
      message: "Application submitted successfully",
      data: newApp,
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
