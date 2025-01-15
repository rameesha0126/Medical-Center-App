const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  fee: { type: Number, required: true }, 
  slots: { type: Number, default: 100},
  nextDate: { type: Date, required: true }, 
  channelList: [], 
  paidChannelList: [],
  toPay: { type: Number }, 
});

module.exports = mongoose.model("Doctor", doctorSchema);