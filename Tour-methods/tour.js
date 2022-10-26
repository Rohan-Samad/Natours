const express = require("express");
const factory = require("../Factory/factory");
const jwt = require("jsonwebtoken");
const unwind = require("javascript-unwind");
const features = require("../apiFunctions/getToursFunctions");
const router = express.Router();
const User = require("../modals/User");
const mongoose = require("mongoose");
let Tour = require("../modals/Tour");
const checkAuth = require("../apiFunctions/checkAuth");
const restrictTo = require("../apiFunctions/restrictTo");
// MIDDLEWARES ⬇

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const middleware = (req, res, next) => {
  const { name, price } = req.body;
  // console.log("Your name is" + name + "your price is" + price);
  if (
    name === null ||
    name.length < 1 ||
    price === undefined ||
    price === null
  ) {
    return res.status(400).json({
      status: "fail",
      tour: "please! Make Sure that it contain a Valid Name or Price",
    });
  }
  next();
};

// fs.readFile("./dev-data/Simple-data.json", async (err, data) => {
//   tour = await JSON.parse(data);
// });

router.param("id", async (req, res, next, val) => {
  try {
    const selectedTour = await Tour.findById(req.params.id);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: "fail", tour: {} });
  }
  // let selectedTour = "ola mit";
  // if (!selectedTour) {
  // }
  next();
});

// function comparison(tour, attribute) {
//   let newArray = [];
//   let array = [];
//   // console.log(tour);
//   let newAttribute = attribute;
//   // let num = attribute.indexOf("-");
//   if (newAttribute.includes("-")) {
//     attribute = attribute.slice(1, attribute.length);
//   }
//   // console.log(a);
//   tour.forEach((el) => {
//     array.push(el[attribute]);
//   });
//   array.sort(function (a, b) {
//     if (newAttribute.includes("-")) {
//       return b - a;
//     } else if (!newAttribute.includes("-")) {
//       return a - b;
//     }
//   });
//   let element;
//   array.forEach((el) => {
//     for (items of tour) {
//       // console.log(items.price);
//       if (el === items[attribute]) {
//         element = items;
//         // console.log(element);
//       }
//     }
//     // element = tour.findOne({ price: el.price });
//     newArray.push(element);
//   });
//   // console.log(newArray);
//   return newArray;
// }

// function fieldSelection(tour, fields) {
//   let newArray = [];
//   tour.forEach((el, index) => {
//     let obj = {};
//     fields.forEach((elem, index) => {
//       if (el[elem]) {
//         obj[elem] = el[elem];
//       }
//       // console.log(el[elem]);
//     });
//     console.log(obj);
//     newArray.push(obj);
//   });
//   // console.log(newArray);
//   return newArray;
// }

// METHODS ❤
const url = require("url");
router.get("/Tour-Statics/:year", async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  const year = req.params.year * 1;
  const d = new Date();

  const query = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: {
            $dateFromString: {
              dateString: "$startDates",
              format: "%Y-%m-%d,%H:%M",
            },
          },
        },

        Tours: { $sum: 1 },
        startDates: { $first: "$startDates" },
        datesNow: {
          $first: `${d.getFullYear()}-${d.getMonth()}-${d.getDay()},${d.getHours()}:${d.getMinutes()}`,
        },

        Name: { $push: "$name" },
      },
    },
    {
      $addFields: {
        ReTime: {
          $subtract: [
            {
              $dateFromString: {
                dateString: "$startDates",
                format: "%Y-%m-%d,%H:%M",
              },
            },
            {
              $dateFromString: {
                dateString: "$datesNow",
                format: "%Y-%m-%d,%H:%M",
              },
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        datesNow: 0,
      },
    },
    {
      $match: { ReTime: { $gte: 0 } },
    },
    {
      $sort: { ReTime: 1 },
    },
  ]);

  res
    .status(200)
    .json({ status: "success", results: query.length, tour: { query } });
});

router.get("/top-5-cheap", async (req, res) => {
  try {
    req.query.sort = "price,-ratingsAverage";
    req.query.limit = 5;

    const query = new features(Tour, req.query)
      .filter()
      .fields()
      .pagination()
      .sorts()
      .unwind();
    let s = await query.query;
    res.status(200).json({
      status: "success",
      results: s.length,
      data: { tour: s },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/", factory.getAll(Tour, "reviews"));

// Tours near me
router.get("/distance/:distance/lntlng/:lntlng", factory.checkNearMe(Tour));

// Finding tours distance from me
router.get("/lntlng/:lntlng", factory.findDistance(Tour));
// Creating a new Tour

router.post("/", middleware, checkAuth, factory.createOne(Tour));

// For Grabing An Element With specific Id
router.get("/:id", factory.getOne(Tour, "reviews"));

//For Editing an Element

router.patch("/:id", middleware, restrictTo("admin"), factory.updateOne(Tour));

// FOR DELETING

router.delete("/:id", checkAuth, restrictTo("admin"), factory.deleteOne(Tour));

module.exports = router;
