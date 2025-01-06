const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  fee: { type: Number, required: true }, 
  nextDate: { type: Date, required: true }
});

module.exports = mongoose.model('Doctor', doctorSchema);