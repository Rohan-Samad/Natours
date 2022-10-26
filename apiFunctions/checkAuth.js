const catchAsync = require("./errorHandling");
const jwt = require("jsonwebtoken");
const SECRET_MSG = 'thisismytopsecrettokenfilethatyoucan"tstealit';
const User = require("../modals/User");

const checkAuth = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    let err = {
      statusCode: 401,
      message: "You have to login or Signup",
    };
    next(err);
  }
  const id = jwt.verify(authorization, SECRET_MSG);
  const user = await User.findById(id.id);

  if (!id || !user) {
    let err = {
      statusCode: 404,
      message: "Invalid Token or maybe that user doesnot exists",
    };
    next(err);
  }
  req.id = id.id;

  return next();
});
module.exports = checkAuth;
