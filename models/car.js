const mongoose = require("mongoose");
const { Schema } = mongoose;

let carSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  gender: String,
  ipAddress: String,
  createdAt: Date,
  country: String,
  date: Date,
  carType: String,
  manufactureDate: Date,
  manufacturer: String
});
module.exports = mongoose.model("Car", carSchema);
