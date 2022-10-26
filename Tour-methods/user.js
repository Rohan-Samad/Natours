const express = require("express");
const router = express.Router();
const catchAsync = require("../apiFunctions/errorHandling");
const User = require("../modals/User");
const jwt = require("jsonwebtoken");
const SECRET_MSG = 'thisismytopsecrettokenfilethatyoucan"tstealit';
const bcrypt = require("bcrypt");
const cookieToken = require("../apiFunctions/cookieToken");
const checkAuth = require("../apiFunctions/checkAuth");
const Email = require("../apiFunctions/Email");
const multer = require("multer");
const sharp = require("sharp");
const pug = require("pug");
// creating An Auth Token

authCreator = (id) => {
  const authtoken = jwt.sign({ id }, SECRET_MSG);
  return authtoken;
};
const filterObj = (obj, ...exWords) => {
  exWords.forEach((element) => {
    if (obj[element]) {
      delete obj[element];
    }
  });
  return obj;
};

function checkingAuth(req, res, next) {
  if (!req.user) {
    const err = {
      statusCode: 400,
      message: "You have to login or Signup",
    };
    next(err);
  }
  next();
}

//  Setting up Multer

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     console.log(file);
//     cb(null, `user-${req.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const err = {
      statusCode: 400,
      message: "There should be an Image only",
    };
    cb(err, false);
  }
};

const resizeProfilePhoto = (req, res, next) => {
  if (!req.file) {
    next();
  } else {
    req.file.filename = `user-${req.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90, failOnError: false })
      .toFile(`public/img/users/${req.file.filename}`);
    next();
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Getting all the tours

router.get(
  "/",
  catchAsync(async (req, res) => {
    const user = await User.find();
    res.status(200).json({ status: "success", data: user });
  })
);

// Signing up in the Account
router.post(
  "/signup",

  catchAsync(async (req, res, next) => {
    const { password, cpassword } = req.body;
    let err = {};

    err.statusCode = 500;
    if (password.length <= 7) {
      const err = {
        statusCode: 400,
        message: "the password should contain at least 8 characters",
      };
      next(err);
    }
    if (!cpassword || password !== cpassword) {
      err.message = "Please confirm the password Correctly";
      return next(err);
    }
    const securePass = await bcrypt.hash(password, 12);
    // const csecurePass = await bcrypt.hash(cpassword, 12);
    const user = await User.create({
      ...req.body,
      password: securePass,
    });

    const token = authCreator(user._id);

    let url = `/users/${user._id}`;
    const sendMail = await new Email(user, url).welcomeEmail();
    res.cookie("jwt", token);
    res.status(200).json({ status: "success", token: token });
  })
);

// Logging in the account
router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    // const userId = req.headers.id;s
    let { email, password } = req.body;

    if (!email || !password) {
      let err = {};
      err.statusCode = 500;
      err.message = "There should be a Email or Password";
      return next(err);
    }
    const users = await User.findOne({ email: req.body.email });

    if (!users || users === null) {
      return res
        .status(400)
        .json({ status: "fail", message: "Sorry this Email does not exist" });
    }

    const id = authCreator(users._id);
    const boolean = await bcrypt.compare(req.body.password, users.password);

    if (!boolean) {
      return res
        .status(400)
        .json({ status: "fail", message: "Sorry wrong Password" });
    } else {
      const cookieOption = {
        secure: true,
      };

      res.cookie("jwt", id);
      res.status(200).json({ status: "success", authToken: id });
    }
  })
);

// logging out the account
router.get("/logout", async (req, res) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

router.patch(
  "/updateProfile",
  cookieToken,
  upload.single("photo"),
  resizeProfilePhoto,
  catchAsync(async (req, res) => {
    if (!req.id) {
      let err = {
        statusCode: 401,
        message: "You have to login or Signup",
      };
      next(err);
    }

    let user = req.body;
    user = filterObj(req.body, "role", "password", "email", "cpassword");

    if (req.file) {
      console.log("in the req.file");
      user.photo = req.file.filename;
    }
    const newuser = await User.findByIdAndUpdate(req.id, user, { new: true });

    res.status(200).json({ status: "success", data: newuser });
  })
);

router.get("/booking/:userId", cookieToken, async (req, res, next) => {
  const userId = req.id;
  if (!userId) {
    const err = { statusCode: 400, message: "There should be a user id" };
    next(err);
  }
  const tour = await Book.findEach({ user: req.id });
  res.status(200).json({ status: "success", data: tour });
});

router.post(
  "/forgetPassword",
  require("../apiFunctions/forgetPass").forgetPass
);

router.get(
  "/sendingEmail/:resetPass",
  require("../apiFunctions/forgetPass").sendingEmail
);

router.post("/resetPassword", require("../apiFunctions/forgetPass").resetPass);

router.get(
  "/checkout-session/:tourId",
  cookieToken,
  checkingAuth,
  require("./stripe").checkoutSession
);
// SEND REVIEWS

router.get("/selectFav/:tourId", cookieToken, async (req, res, next) => {
  const userId = req.id;
  const tourId = JSON.parse(req.params.tourId);
  console.log(userId, tourId);
  let user = await User.findById(userId);
  console.log(user);
  let favArray = user.favTours;
  console.log(favArray);
  if (!favArray) {
    favArray = [];
    favArray.unshift(tourId);
    console.log(favArray);
  } else if (favArray.includes(tourId)) {
    const index = favArray.indexOf(tourId);
    if (index > -1) {
      favArray.splice(index, 1);
    }
  } else {
    favArray.unshift(tourId);
  }

  console.log("favArray is");
  console.log(favArray);

  let updatedUser = await User.findByIdAndUpdate(
    userId,
    { favTours: favArray },
    { new: true }
  );
  res.status(200).json({ status: "success", data: updatedUser });
});

router.use("/sendReview", require("./reviewCreator"));

module.exports = router;
