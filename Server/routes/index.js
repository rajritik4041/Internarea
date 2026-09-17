const express = require("express");
const router = express.Router();

const job = require("./Jobs");
const internship = require("./internship");
const register = require("./users");
const application = require("./application");
const forgotPassword = require("./forgotPassword");
const language = require("./language");
const posts = require("./posts");
const community = require("./community");
const resume = require("./resume");
const subscription = require("./subscription");
const notifications = require("./notifications");

const Job = require("../Model/Job");
const Internship = require("../Model/Internship");

router.use("/job", job);
router.use("/internship", internship);
router.use("/application", application);
router.use("/forgot-password", forgotPassword);
router.use("/language", language);
router.use("/posts", posts);
router.use("/community", community);
router.use("/resume", resume);
router.use("/subscription", subscription);
router.use("/notifications", notifications);

router.use("/", job);
router.use("/", internship);
router.use("/", register);

router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let item = null;
    let type = "job";

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Job.findById(id).lean();
      if (!item) {
        item = await Internship.findById(id).lean();
        type = "internship";
      }
    }

    if (!item) {
      return res.status(404).json({
        status: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: item,
      type,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Server error",
    });
  }
});

module.exports = router;
