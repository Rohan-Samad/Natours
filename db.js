const mongoose = require("mongoose");
// const url = `mongodb+srv://maidrgayi:${process.env.PASSWORD}@khanmongo.y2v8bcv.mongodb.net/?retryWrites=true&w=majority`;
const url = "mongodb://localhost:27017/natours";
const connectedMongo = () => {
  mongoose.connect(url, () => {
    console.log("Connected To mongo Successfully");
  });
};
module.exports = connectedMongo;
