const mongoose = require("mongoose"); 

const labSchema = new mongoose.Schema({
    testName: { type: String, required: true }, 
    testPrice: { type: Number, required: true }
}); 

module.exports = mongoose.model("Lab", labSchema);