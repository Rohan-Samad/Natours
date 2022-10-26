const Review = require("../modals/Review");
const express = require("express");
const path = require("path");
const router = express.Router();
const catchAsync = require("../apiFunctions/errorHandling");
const factory = require("../Factory/factory");
const cookieToken = require("../apiFunctions/cookieToken");
const checkAuth = require("../apiFunctions/checkAuth");

router.use(express.static(path.join(__dirname, "public")));
const validator = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user || !req.body.tour) {
    const err = {
      statusCode: 500,
      message: "There should be an tour id or User id",
    };
    next(err);
  }
  next();
});

router.get("/", checkAuth, factory.getAll(Review));
router.post("/:tourId", cookieToken, validator, factory.createOne(Review));

module.exports = router;
