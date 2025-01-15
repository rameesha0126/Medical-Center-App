const mongoose = require("mongoose"); 

const channelInvoiceSchema = new mongoose.Schema({
    createdDate: { type: Date, default: Date.now }, 
    refNo: { type: Number, required: true },
    patientName: { type: String, required: true }, 
    contactNo: { type: Number, required: true },
    //doctorName: { type: String, required: true }, 
    channelDate: { type: Date, required: true }, 
    patientNo: { type: Number, required: true }, 
    doctorFee: { type: Number, required: true }, 
    institutionFee: { type: Number, default: 600 },
    total: { type: Number, required: true },
}); 

module.exports = mongoose.model("ChannelInvoice", channelInvoiceSchema);