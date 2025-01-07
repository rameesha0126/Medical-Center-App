const mongoose = require("mongoose"); 

const labTestInvoiceSchema = new mongoose.Schema({
    customerName: { type: String, required: true }, 
    contactNo: { type: Number, required: true },
    testName: { type: String, required: true },
    totalFee: { type: Number, required: true },
}); 

module.exports = mongoose.model("LabTestInvoice", labTestInvoiceSchema);