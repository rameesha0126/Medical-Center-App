const mongoose = require("mongoose");
const channel = require("./Channel");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  fee: { type: Number, required: true }, 
  slots: { type: Number, default: 100},
  nextDate: { type: Date, required: true }, 
  // toPay: { type: Number, required: true }, 
  //channelList: [channel]
});

module.exports = mongoose.model("Doctor", doctorSchema);