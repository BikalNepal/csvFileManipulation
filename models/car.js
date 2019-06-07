const mongoose = require("mongoose");
const { Schema } = mongoose;

let carSchema = new Schema({
  id: String,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  ip_address: String,
  createdAt: String,
  country: String,
  date: Date,
  car_type: String,
  manufacture_date: Date,
  manufacturer: String
});
module.exports = mongoose.model("Car", carSchema);
