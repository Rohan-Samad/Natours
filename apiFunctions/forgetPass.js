const User = require("../modals/User");
const crypto = require("crypto");
const sendEmail = require("./Email");
const bcrypt = require("bcrypt");
let resPass = null;
let Email = require("./Email");
const fs = require("fs");
const SECRET_MSG = 'thisismytopsecrettokenfilethatyoucan"tstealit';
const jwt = require("jsonwebtoken");
let emailtemplate = fs.readFileSync("./apiFunctions/Ve.html", "utf-8");
const showAlert = require("./showAlert");
// const emails = require('../Html-pages/verify_email.html')

//

// catch async setup
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

const authCreator = (id) => {
  const authtoken = jwt.sign({ id }, SECRET_MSG);
  return authtoken;
};

//  Date Add
function addMinutes(numOfMinutes, date = new Date()) {
  const dateCopy = new Date(date.getTime());

  dateCopy.setMinutes(dateCopy.getMinutes() + numOfMinutes);

  return dateCopy;
}

// Creating A Hash Password

const passwordHashCreator = async () => {
  let secret = "HiiBeastandtheGhostRider";
  let resetPassword = await crypto.randomBytes(32).toString("hex");
  let encryptedPassword = await crypto
    .createHmac("sha256", secret)
    .update(resetPassword)
    .digest("hex");

  return resetPassword;
};

// Adding An Email functionality

module.exports.forgetPass = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (email === "fail") {
    let err = {
      statusCode: 200,
      message: "There Should be an email address to Send Reset Passoword",
    };
    next(err);
  }
  const users = await User.findOne({ email: email });
  if (!users) {
    let err = {
      statusCode: 404,
      message: "This Email does Not find please try to Signin",
    };
    next(err);
  } else if (users.length === 0 || !email) {
    const err = { statusCode: 404, message: "Sorry This email doesnot exists" };
    return next(err);
    // showAlert("fail", err.message);
  }

  const resetPass = await passwordHashCreator();
  // User.set("validateBeforeSave", false);
  const result = addMinutes(10);
  const UI = await User.findByIdAndUpdate(
    users._id,
    {
      resetPass: resetPass.toString(),
      resetPasswordExpireAt: result,
    },
    { new: true }
  );

  // emailtemplate = emailtemplate.replace(/{%RESETPASSW%}/g, resetPass);

  // const obj = {
  //   email: email,
  //   subject: "Reset Password",
  //   message: emailtemplate,
  //
  let url = `/users/forgetPass/${resetPass}`;
  let user = await new Email(users, url).sendResetPass();
  res.json({ status: "success", data: "Your password is on the way" });
});

module.exports.sendingEmail = catchAsync(async (req, res) => {
  const { resetPass } = await req.params;
  if (!resetPass) {
    return res.status(404).json({
      status: "success",
      message:
        "There should be a correct resetPass Or your request Maybe TimedOut",
    });
  }
  resPass = resetPass;
  res.json({ status: "success", data: resetPass });
});

// Resting the password

module.exports.resetPass = catchAsync(async (req, res, next) => {
  const { password, cpassword } = await req.body;
  const resPass = req.cookies.resToken;
  const users = await User.findOne({
    resetPass: resPass,
    resetPasswordExpireAt: { $gt: new Date() },
  });
  console.log(req.body);
  console.log("Reset Pass is");
  console.log(resPass);
  console.log("password is " + password);
  console.log("Confirm password is " + cpassword);
  if (!resPass || !users) {
    return res.status(200).json({
      status: "fail",
      message:
        "There should be a correct resetPass Or your request Maybe TimedOut",
    });
  }

  if (password !== cpassword) {
    const err = {
      statusCode: 200,
      message: "Credentials does not match",
    };
    next(err);
  }
  if (password.length < 8) {
    const err = {
      statusCode: 200,
      message: "password should not be less than 8 Characters",
    };
    next(err);
  }
  const ModifiedPassword = await bcrypt.hash(password, 12);
  console.log("the modified password" + ModifiedPassword);
  let user = await User.findByIdAndUpdate(users._id, {
    password: ModifiedPassword,
  });
  const token = authCreator(users._id);
  res.cookie("jwt", token);
  res.status(200).json({ status: "success", data: token, id: users._id });
});
