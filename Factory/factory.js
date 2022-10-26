const catchAsync = require("../apiFunctions/errorHandling");
const features = require("../apiFunctions/getToursFunctions");

module.exports.getAll = (modal, popOne) => {
  return catchAsync(async (req, res) => {
    query = new features(modal, req.query)
      .filter()
      .populate(popOne)
      .fields()
      .pagination()
      .sort();

    let s = await query.query;
    res.status(200).json({
      status: "success",
      results: s.length,
      data: { tour: s },
    });
  });
};

module.exports.createOne = (modal) => {
  return catchAsync(async (req, res, next) => {
    const testTour = await modal.create(req.body);
    return res.status(200).json({ status: "success", data: testTour });

    next();
  });
};

module.exports.getOne = (modal, popOne) => {
  return catchAsync(async (req, res, next) => {
    const _id = req.params.id || req.id;
    const selectedTour = await modal.findById(req.params.id).populate(popOne);
    res.status(200).json({ status: "success", tour: selectedTour });
  });
};

module.exports.updateOne = (modal) => {
  return catchAsync(async (req, res) => {
    const newTour = await modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ status: "success", tour: newTour });
  });
};

module.exports.deleteOne = (modal) => {
  return catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    const newTour = await modal.findByIdAndDelete(req.params.id);

    res.status(200).json({ status: "success", tour: newTour });
  });
};

module.exports.checkNearMe = (modal) => {
  return catchAsync(async (req, res, next) => {
    const { distance, lntlng } = req.params;
    const [lnt, lng] = lntlng.split(",");
    const radius = distance / 6378.1;

    if (!lng || !lnt || !distance) {
      const err = {
        statusCode: 500,
        message: "distance or latitude or longitude can't be empty",
      };
      next(err);
    }

    const newTour = await modal.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lnt], radius] } },
    });

    res
      .status(200)
      .json({ status: "success", results: newTour.length, data: newTour });
  });
};

module.exports.findDistance = (modal) => {
  return async (req, res, next) => {
    const { lntlng } = req.params;
    const [lnt, lng] = lntlng.split(",");
    // const radius = distance / 6378.1;

    if (!lng || !lnt) {
      const err = {
        statusCode: 500,
        message: " latitude or longitude can't be empty",
      };
      next(err);
    }

    const newTour = await modal.aggregate([
      {
        $geoNear: {
          near: {
            type: "Points",
            coordinates: [lng * 1, lnt * 1],
          },
          distanceField: "distance",
        },
      },
      { $project: { distance: 1, name: 1 } },
    ]);

    res
      .status(200)
      .json({ status: "success", results: newTour.length, data: newTour });
  };
};
