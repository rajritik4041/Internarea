const express = require("express");
const router = express.Router();

const Internship = require("../Model/Internship");


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


router.get(["/", "/internship"], async (req, res) => {
  try {


    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;


    const {
      search,
      location,
      category,
      experience,
      minstipend,
    } = req.query;



    const filter = {};
    const andConditions = [];



    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      andConditions.push({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { aboutInternship: searchRegex },
          { aboutJob: searchRegex },
          { aboutCompany: searchRegex },
          { category: searchRegex },
          { location: searchRegex },
          { whoCanApply: searchRegex },
        ],
      });
    }



    if (location && location.trim()) {
      const locRegex = new RegExp(escapeRegex(location.trim()), "i");
      filter.location = locRegex;
    }

 

    if (category && category.trim()) {
      const catRegex = new RegExp(`^${escapeRegex(category.trim())}$`, "i");
      filter.category = catRegex;
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
      minstipend !== undefined &&
      minstipend !== null &&
      minstipend !== "" &&
      Number(minstipend) > 0
    ) {
      const minimumStipend = Number(minstipend);

      const pipeline = [
        {
          $match: filter,
        },

        {
          $addFields: {
            regexResult: {
              $regexFind: {
                input: {
                  $toString: "$stipend",
                },
                regex: "[0-9,]+",
              },
            },
          },
        },

        {
          $addFields: {
            stipendNumber: {
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
            stipendNumber: {
              $gte: minimumStipend,
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
            createAt: -1,
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
            stipendNumber: 0,
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
                  $toString: "$stipend",
                },
                regex: "[0-9,]+",
              },
            },
          },
        },

        {
          $addFields: {
            stipendNumber: {
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
            stipendNumber: {
              $gte: minimumStipend,
            },
          },
        },

        {
          $count: "total",
        },
      ];

      const [data, countResult] = await Promise.all([
        Internship.aggregate(pipeline),
        Internship.aggregate(countPipeline),
      ]);

      const totalJobs =
        countResult.length > 0
          ? countResult[0].total
          : 0;

      const totalPages =
        Math.ceil(totalJobs / limit);

      return res.status(200).json({
        success: true,
        data,
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

    const [data, totalJobs] = await Promise.all([
      Internship.find(filter)
        .sort({ createdAt: -1, createAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Internship.countDocuments(filter),
    ]);

    const totalPages =
      Math.ceil(totalJobs / limit);


    return res.status(200).json({
      success: true,
      data,
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
    console.error(
      "Get internships error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
      error: error.message,
    });
  }
});

module.exports = router;