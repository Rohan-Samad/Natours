const Tour = require("../modals/Tour");
const stripe = require("stripe")(
  "sk_test_51LtrEsL04f8ZItyZlF2MLYk3tY4vKI1HiV3xyWseSnAKJRKrGCIeF6timl5RuHrHwYRNHSIhn9WOoN05XCgLTEDs00ceET3MqT"
);
const Book = require("../modals/Booking");

module.exports.checkoutSession = async (req, res, next) => {
  const tourID = req.params.tourId;
  const tour = await Tour.findById(tourID);

  const product = await stripe.products.create({
    name: tour.name,
    description: tour.summary,
    images: [`${tour.imageCover}`],
  });
  const price = await stripe.prices.create({
    unit_amount: tour.price * 100,
    currency: "usd",
    product: `${product.id}`,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    id: tour._id,
    success_url: `${req.protocol}://${req.get("host")}/overview?price=${
      tour.price
    }&tour=${tour.id}&user=${req.user._id}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour._id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price: `${price.id}`,
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  // await Book.create({
  //   tour: tour._id,
  //   user: req.user._id,
  //   price: tour.price,
  // });
  res.status(200).json({
    status: "success",
    session,
  });
  next();
};

module.exports.redirectingUrl = async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !price && !user) {
    return next();
  } else {
    await Book.create(req.query);
    res.redirect(req.originalUrl.split("?")[0]);
    return next();
  }
};
