const catchAsync = require("./errorHandling");
const jwt = require("jsonwebtoken");
const SECRET_MSG = 'thisismytopsecrettokenfilethatyoucan"tstealit';
const User = require("../modals/User");

module.exports = restrictTo = (...rol) => {
  return async (req, res, next) => {
    id = req.id;

    if (!id) {
      const err = {
        statusCode: 401,
        message: "Yoy have to login or signup",
      };
      return next(err);
    }
    let i = 0;
    const obUser = await User.findById(id);
    if (!obUser) {
      const err = {
        statusCode: 401,
        message: "There should be a correct id in the system",
      };
      return next(err);
    }

    rol.forEach((el) => {
      if (obUser.role === el) {
        i = 1;
      }
    });
    if (i !== 1) {
      const err = {
        statusCode: 401,
        message: "you doesnot have access to this site",
      };
      return next(err);
    }
    next();
  };
};
