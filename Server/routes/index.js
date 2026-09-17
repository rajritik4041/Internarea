const express = require("express");
const router = express.Router();

const job = require("./Jobs");
const internship = require("./internship");
const register = require("./users");
const application = require("./application");
const Job = require("../Model/Job");
const Internship = require("../Model/Internship");

router.use("/job", job);
router.use("/internship", internship);
router.use("/application", application);
router.use("/", job);
router.use("/", internship);
router.use("/", register);

router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let item = null;
    let type = "job";

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
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
