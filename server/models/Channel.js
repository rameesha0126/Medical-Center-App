const mongoose = require("mongoose"); 

const channelSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  contactNo: { type: Number, required: true },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Doctor model
    ref: 'Doctor', // The name of the model being referenced
    required: true
  },
  channelDate: { type: Date, required: true },
  channelFee: { type: Number, required: true },
  channelNo: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" }, 
  createdDate: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }, // Manager or Employee name
});

module.exports = mongoose.model("Channel", channelSchema);