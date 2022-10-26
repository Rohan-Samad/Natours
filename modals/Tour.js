const mongoose = require("mongoose");
const { Schema } = mongoose;
// const Review = require("../modals/Review");
const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    // review: Array,
    ratingsAverage: {
      type: Number,
      required: true,
      val: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, required: true },
    difficulty: { type: String, required: true },
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    locations: [
      {
        type: { type: String, default: "Point", enum: ["Point"] },
        description: String,
        coordinates: [Number],
        day: Number,
      },
    ],
    startLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      description: String,
      coordinates: [Number],
      address: String,
    },

    summary: { type: String, required: true },
    description: { type: String, required: true },
    imageCover: { type: String, required: true },
    images: { type: Array, required: true },
    priceDiscount: {
      type: Number,
      default: 0,
      validator: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount Rate can't be greatar than price rate",
      },
    },
    createdAt: { type: Date, default: new Date() },
    startDates: { type: Array, required: true },
    startDates: { type: Array },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // strictPopulate: false,
  }
);

tourSchema.index({ startLocation: "2dsphere" });
// tourSchema.index({ distance: "2dsphere" });

tourSchema.virtual("Retime").get(function () {
  const d = new Date();
  const array = [];
  this.startDates.forEach((el) => {
    let date = new Date(el);
    // console.log(date);

    let remaningTime = date.getTime() - d.getTime();

    if (remaningTime > 0) {
      array.push(remaningTime);
    }
  });
  return array;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});
tourSchema.post("find", async function (doc, next) {
  next();
});

let Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
