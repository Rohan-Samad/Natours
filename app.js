const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const path = require("path");
const xss = require("xss-clean");
const express = require("express");
const cookies = require("cookie-parser");
const app = express();
// app.use(mongoSanitize());
app.use("/api", helmet());
app.use(xss());
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cors = require("cors");
const connectedMongo = require("./db");
const rateLimit = require("express-rate-limit");

connectedMongo();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "You have made too many request this time Please try again later!",
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "view"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", limiter);
app.use(cors());
app.use(cookies());
app.use(express.json());

app.use("/", require("./Tour-methods/pugCreator"));

app.use("/api/v1/tours", require("./Tour-methods/tour"));

app.use("/api/v1/users", require("./Tour-methods/user"));

// app.use("/api/v1/forgetpasword", require("./Tour-methods/user"));
// app.use("/api/v1/forgetpasword", require("./Tour-methods/user"));

app.all("*", (req, res, next) => {
  const err = new Error(`Sorry server Cant access the ${req.originalUrl}`);
  err.status = "fail";
  err.message = `Can't find the route for ${req.originalUrl}`;
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === 11000 && err.keyValue.email) {
    err.message = "Sorry This Email Already Exists";
  } else if (err.code === 11000 && err.keyValue.name) {
    err.message = "Sorry the name of the tour can't be duplicated";
  } else if (err.code === 11000) {
    err.message = `Sorry this ${err.keyValue} can't be duplicated`;
  }
  statusCode = err.statusCode || 404;
  estatus = err.status || "fail";
  console.log(err);
  console.log(err.stack);
  res.status(statusCode).json({ status: estatus, message: err.message });
  next();
});

// app.use("/api/v1/tours", require("./Tour-methods/tour"));

module.exports = app;
