const mongoose = require("mongoose");
const Tour = require("./Tour");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "There Should be a Review in the text Box"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "You should rate the tour by selecting the Stars"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "user",
    select: "name photo _id",
  });

  next();
});

reviewSchema.post("save", (doc, next) => {
  calAverageRatings(doc.tour);
  next();
});

const Review = mongoose.model("Review", reviewSchema);
const calAverageRatings = async (tourId) => {
  console.log(tourId);
  const stats = await Review.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nNumber: { $sum: 1 },
        nRatings: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
  const tour = await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nNumber,
    ratingsAverage: stats[0].nRatings,
  });
};
module.exports = Review;
