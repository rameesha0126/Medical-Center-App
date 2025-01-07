const mongoose = require("mongoose"); 

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
}); 

module.exports = mongoose.model("Employee", employeeSchema);