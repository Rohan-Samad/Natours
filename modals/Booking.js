const mongoose = require("mongoose");
// const { Schema } = mongoose;

const bookingTour = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "There should be A tour id surely"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "There should be A tour id surely"],
  },
  price: {
    type: Number,
    required: [true, "There should be a price"],
  },
  createdAt: {
    type: Date,
    dafault: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// bookingTour.pre(/^find/, (next) => {
//   this.populate("user").populate({
//     path: "tour",
//     select: "name",
//   });
//   next();
// });

const Book = mongoose.model("Book", bookingTour);

module.exports = Book;
