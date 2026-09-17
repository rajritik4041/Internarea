const express = require("express");
const router = express.Router();

const Job = require("../Model/Job");

// Helper to escape regex special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get(["/", "/job"], async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const { search, location, category, experience } = req.query;
    const minctc = req.query.minCTC || req.query.minctc;

    const filter = {};
    const andConditions = [];

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      andConditions.push({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { aboutJob: searchRegex },
          { aboutCompany: searchRegex },
          { category: searchRegex },
          { location: searchRegex },
          { whoCanApply: searchRegex },
        ],
      });
    }

    if (location && location.trim()) {
      filter.location = new RegExp(escapeRegex(location.trim()), "i");
    }

    if (category && category.trim()) {
      filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, "i");
    }

    if (experience && experience.trim()) {
      const expTrim = experience.trim();
      const expRegex = new RegExp(escapeRegex(expTrim), "i");
      if (/fresher|0-1/i.test(expTrim)) {
        andConditions.push({
          $or: [
            { Experience: expRegex },
            { Experience: { $exists: false } },
            { Experience: null },
            { Experience: "" },
          ],
        });
      } else {
        filter.Experience = expRegex;
      }
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    if (
      minctc !== undefined &&
      minctc !== null &&
      minctc !== "" &&
      Number(minctc) > 0
    ) {
      const minimumCTC = Number(minctc);

      const pipeline = [
        {
          $match: filter,
        },
        {
          $addFields: {
            regexResult: {
              $regexFind: {
                input: {
                  $toString: "$CTC",
                },
                regex: "[0-9,]+",
              },
            },
          },
        },
        {
          $addFields: {
            ctcNumber: {
              $toDouble: {
                $replaceAll: {
                  input: {
                    $ifNull: [
                      "$regexResult.match",
                      "0",
                    ],
                  },
                  find: ",",
                  replacement: "",
                },
              },
            },
          },
        },
        {
          $match: {
            ctcNumber: {
              $gte: minimumCTC,
            },
          },
        },
        {
          $sort: {
            createAt: -1,
            createdAt: -1,
            _id: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            regexResult: 0,
            ctcNumber: 0,
          },
        },
      ];

      const countPipeline = [
        {
          $match: filter,
        },
        {
          $addFields: {
            regexResult: {
              $regexFind: {
                input: {
                  $toString: "$CTC",
                },
                regex: "[0-9,]+",
              },
            },
          },
        },
        {
          $addFields: {
            ctcNumber: {
              $toDouble: {
                $replaceAll: {
                  input: {
                    $ifNull: [
                      "$regexResult.match",
                      "0",
                    ],
                  },
                  find: ",",
                  replacement: "",
                },
              },
            },
          },
        },
        {
          $match: {
            ctcNumber: {
              $gte: minimumCTC,
            },
          },
        },
        {
          $count: "total",
        },
      ];

      const [jobs, countResult] = await Promise.all([
        Job.aggregate(pipeline),
        Job.aggregate(countPipeline),
      ]);

      const totalJobs = countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(totalJobs / limit);

      return res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          currentPage: page,
          limit,
          totalJobs,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    }

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .sort({ createAt: -1, createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalJobs / limit);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: page,
        limit,
        totalJobs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;