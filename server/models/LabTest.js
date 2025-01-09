const mongoose = require("mongoose"); 

const labTestSchema = new mongoose.Schema({
    customerName: { type: String, required: true }, 
    contactNo: { type: Number, required: true },
    testName: { type: String, required: true },
    testFee: { type: Number, required: true }, 
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String, required: true }, // Manager or Employee name
}); 

module.exports = mongoose.model("LabTest", labTestSchema);