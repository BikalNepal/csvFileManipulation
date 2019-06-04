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
app.use("/api/", (req, res) => {
  res.json(cars);
});

//sort data in ascending order acc to dates
//use map for sorted data and inside that from first date push all the data that is within 10 days as
//array.push([10daysData])

app.get("/sortedCars", async (req, res) => {
  var today = new Date(cars[0].date),
    oneDay = 1000 * 60 * 60 * 24,
    tenDays = new Date(today.valueOf() - 10 * oneDay);
  let new10Days = moment(tenDays).format("MM/DD/YYYY");
  let new1Day = moment(oneDay).format("MM/DD/YYYY");
  let carDates = await Car.find({ date: { $lt: new10Days } });
  console.log(carDates);
  Car.aggregate()
    .sort({ date: 1 })
    .then(resp => res.json(resp))
    .catch(err => console.log("err=>", err));

  // [
  //   {
  //     $match: {
  //       date: { $gte: thirtyDays }
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         $cond: [
  //           { $lt: ["$date", fifteenDays] },
  //           "16-30",
  //           { $cond: [{ $lt: ["$date", sevenDays] }, "08-15", "01-07"] }
  //         ]
  //       },
  //       count: { $sum: 1 },
  //       totalValue: { $sum: "$value" }
  //     }
  //   }
  // ]

  // Car.aggregate()
  //   .group({
  //     _id: "$manufacture_date",
  //     id: { $first: "$id" },
  //     first_name: { $first: "$first_name" },
  //     last_name: { $first: "$last_name" },
  //     email: { $first: "$email" },
  //     gender: { $first: "$gender" },
  //     ip_address: { $first: "$ip_address" },
  //     createdAt: { $first: "$createdAt" },
  //     country: { $first: "$country" },
  //     date: { $first: "$date" },
  //     car_type: { $first: "$car_type" },
  //     manufacturer: { $first: "$manufacturer" },
  //     manufacture_date: { $first: "$manufacture_date" },
  //     count: { $sum: 1 },
  //     emails: { $addToSet: "$email" }
  //   })
  //   .project({ _id: 0 })
  //   .then(sortedCars => res.json(sortedCars))
  //   .catch(err => comsole.log(err));
});
app.listen(port, () => console.log(`Server running on ${port}`));
