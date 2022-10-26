const fs = require("fs");
const Tour = require("../modals/Tour");
const connectedMongo = require("../db");
connectedMongo();

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/modifiedTour.json`, "utf-8")
);

const importData = async () => {
  try {
    const newTour = await Tour.create(data);
    console.log("It has Been Successfully Imported!💚");
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    const newTour = await Tour.deleteMany();
    console.log("It has Been Successfully Deleted!☢");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);
