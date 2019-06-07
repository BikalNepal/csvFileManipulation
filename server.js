const express = require("express");
const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const _ = require("lodash");
const moment = require("moment");
const csv = "./car_mock_data.csv";
const Car = require("./models/car");
const port = process.env.PORT || 5000;
const app = express();

//DB config
const url = require("./config/keys").mongoURI;
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

//csvToJson
let cars;
csvtojson()
  .fromFile(csv)
  .then(jsonObj => {
    cars = jsonObj;
  });

// save multiple cars to Car model
let db = mongoose.connection;
db.once("open", () => {
  mongoose.connection.db
    .listCollections({ name: "cars" })
    .next((err, collInfo) => {
      if (!collInfo) {
        Car.collection.insertMany(cars, (err, data) => {
          err ? console.error(err) : console.log("Data inserted successfully!");
        });
      }
    });
});

//Use Routes
let toSortCars;
app.use("/api/", (req, res) => {
  Car.find({}).then(carArr => {
    toSortCars = carArr;
    res.json(carArr);
  });
});

//sort data in ascending order acc to dates
//use map for sorted data and inside that from first date push all the data that is within 10 days as
//array.push([10daysData])

app.get("/sortedCars", (req, res) => {
  Car.find({}).then(toSortCars => {
    toSortCars.sort((a, b) => {
      let x = new Date(a.date);
      let y = new Date(b.date);
      return x - y;
    });
    let startDate = toSortCars[0].date;
    let endDate = moment(startDate).add(10, "days");
    let totalArrays = [];
    let tenDaysArrays = [];
    toSortCars.length = 100;
    let emails = [];
    let count = 0;
    let position = 0;
    for (toSortCar of toSortCars) {
      if (toSortCar.date > endDate) {
        startDate = endDate;
        endDate = moment(startDate).add(10, "days");
        count = emails.length;
        let cars;
        tenDaysArrays.map(item => {
          cars = {
            id: item.id,
            email: item.email,
            date: item.date,
            count: count,
            emails: emails
          };
          return cars;
        });
        totalArrays[position] = cars;
        position = position + 1;
        emails = [];
        count = 0;
        tenDaysArrays = [];
      }
      if (toSortCar.date <= endDate) {
        tenDaysArrays.push(toSortCar);
        emails.push(toSortCar.email);
      }
    }
    console.log(totalArrays[0]);
    let merged = [].concat(...totalArrays);
    merged.sort((a, b) => {
      let x = new Date(a.date);
      let y = new Date(b.date);
      return x - y;
    });
    res.json(merged);
  });
});
app.listen(port, () => console.log(`Server running on ${port}`));
