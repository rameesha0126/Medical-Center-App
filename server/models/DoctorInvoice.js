const mongoose = require('mongoose'); 

const doctorInvoiceSchema = new mongoose.Schema({
    createdDate: { type: Date, default: Date.now }, 
    refNo: { type: Number, required: true },
    patientCount: { type: Number, required: true }, 
    totalFee: { type: Number, required: true }
}); 

module.exports = mongoose.model("DoctorInvoice", doctorInvoiceSchema);