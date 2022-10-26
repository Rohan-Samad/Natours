const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    maxLength: [20, "The Name can't be greater than 20 characters"],
    required: [true, "There should be a name"],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: [true, "This Email had already declared"],
    validate: [validator.isEmail, "Given Email is not correct"],
  },
  photo: { type: String, default: "default.png" },
  role: {
    type: String,
    enum: ["user", "admin", "guide", "leadGuide", "assistantAdmin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "There should be a password"],
    validator: {
      validator: function (e) {
        return e >= 8;
      },
      message: "Password should contain atleast 8 Characters",
    },
  },
  favTours: [{ type: mongoose.Schema.ObjectId }],
  resetPass: { type: String },
  resetPasswordExpireAt: { type: String },
});

// userSchema.methods.createRandomPass = function () {
//   const resetPassword = crypto.randomBytes(32).toString("hex");
//   console.log(resetPassword);
//   return resetPassword;
// };
// userSchema.virtual("reviews", {
//   ref: "User",
//   foreignField: "tour",
//   localField: "_id",
// });
userSchema.pre("find", function (next) {
  this.populate({ path: "favTours", ref: "Tour", select: "-Retime" });
  console.log("In the pre Middleware");

  next();
});

userSchema.methods.createRandomPass = function () {
  let resetPassword;
  return (resetPassword = crypto.randomBytes(32).toString("hex"));
};
const User = mongoose.model("User", userSchema);

module.exports = User;
