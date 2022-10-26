const cookies = require("cookie-parser");
const SECRET_MSG = 'thisismytopsecrettokenfilethatyoucan"tstealit';
const jwt = require("jsonwebtoken");
const User = require("../modals/User");

const cookieToken = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const id = jwt.verify(req.cookies.jwt, SECRET_MSG);
      const nuser = await User.findById(id.id);
      if (nuser) {
        if (!id || !nuser) {
          let err = {
            statusCode: 404,
            message: "Invalid Token or maybe that user doesnot exists",
          };
          // next(err);
        }
        res.locals.user = nuser;
        req.id = nuser._id;
        req.user = nuser;
        // console.log(req.id);
      }
    } catch (err) {
      console.log(err);
      return next();
      // next();
    }
  }
  next();
};
module.exports = cookieToken;
