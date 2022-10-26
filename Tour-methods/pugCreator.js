const express = require("express");
const router = express.Router();
const catchAsync = require("../apiFunctions/errorHandling");
const Tour = require("../modals/Tour");
const axios = require("axios").default;
const cookieToken = require("../apiFunctions/cookieToken");
const cookies = require("cookie-parser");
const Book = require("../modals/Booking");
const User = require("../modals/User");
const factory = require("../Factory/factory");
const Review = require("../modals/Review");
// router.use(cookies);

const checkBooking = async (req, res, next) => {
  const userId = req.id;
  const tourId = req.params.id;
  const bookings = await Book.findOne({ user: userId, tour: tourId });
  if (!bookings) {
    req.isBooked = false;
  } else {
    req.isBooked = true;
  }
  next();
};

const checkFav = async (req, res, next) => {
  if (req.id) {
    const userId = req.id;
    const tourId = req.params.id;
    const user = await User.findById(userId);
    if (user.favTours.includes(tourId)) {
      req.isFav = true;
    } else {
      req.isFav = false;
    }
  }
  next();
};

router.use(cookieToken);
router.get(
  "/",
  catchAsync(async (req, res, next) => {
    res.status(200).render("base", {
      tour: "HII i am a new one here",
    });
  })
);

router.get(
  "/overview",
  require("./stripe").redirectingUrl,
  catchAsync(async (req, res, next) => {
    const newtour = await Tour.find();

    res.status(200).render("overview", {
      tour: newtour,
    });
  })
);

router.get(
  "/tour/:id",
  checkBooking,
  checkFav,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let url = `/api/v1/tours/${id}`;
    const tour = await Tour.findById(id).populate("reviews");
    res.status(200).render("tour", {
      tour: tour,
      isBooked: req.isBooked,
      isFav: req.isFav,
    });
  })
);

router.get(
  "/users/signup",
  catchAsync(async (req, res, next) => {
    res.status(200).render("signup");
  })
);

router.get(
  "/users/booking",
  catchAsync(async (req, res, next) => {
    const id = req.id;
    const bookings = await Book.find({ user: id });
    console.log("The booking is ");
    console.log(bookings);
    let newTour = [];
    for (el of bookings) {
      let tour = await Tour.findById(el.tour);
      newTour.unshift(tour);
    }
    res.status(200).render("overview", {
      tour: newTour,
    });
  })
);

router.get(
  "/users/favourite-Tours",
  catchAsync(async (req, res, next) => {
    console.log(req.id);
    const user = await User.findById({ _id: req.id });
    let SimpleArray = [];

    for (el of user.favTours) {
      let tour = await Tour.findById(el);
      SimpleArray.unshift(tour);
    }
    console.log(user);
    res.status(200).render("overview", {
      tour: SimpleArray,
    });
  })
);

router.get(
  "/users/reviews",
  catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ user: req.id }).populate("tour");
    console.log(reviews);
    res.status(200).render("review", {
      reviews: reviews,
    });
  })
);

router.get(
  "/users/login",
  catchAsync(async (req, res, next) => {
    res.status(200).render("login");
  })
);

router.get(
  "/users/:id",
  catchAsync(async (req, res, next) => {
    res.cookie("resToken", "PasswordChanged", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).render("profile");
  })
);

router.get(
  "/users/forgetPass/:resetPass",
  catchAsync(async (req, res, next) => {
    const { resetPass } = req.params;
    res.cookie("resToken", resetPass);

    res.status(200).render("changePass");
  })
);

module.exports = router;
