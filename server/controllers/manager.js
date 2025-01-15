const bcrypt = require('bcryptjs');
const Employee = require("../models/Employee"); 
const Doctor = require("../models/Doctor");
const ChannelInvoice = require('../models/ChannelInvoice');

// createEmployee controller
const createEmployee = async (req, res) => {
    try {
        const { name, username, password, role } = req.body; 

        // Check if username is already in use 
        const existingEmployee = await Employee.findOne({ username });
        if (existingEmployee) {
            return res.status(400).json({ message: "Username is already in use" });
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10); 

        const employee = new Employee({ name, username, password: hashedPassword, role });
        await employee.save();
        res.status(201).json({ message: 'Employee added successfully', employee });
    } catch (error) {
        res.status(400).json({ message: 'Error adding employee', error: error.message });
    }
};

// viewEmployees controller 
const viewEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().select('-password'); // Exclude password from response 
        res.status(200).json(employees);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching employees', error: error.message });
    }
};

// updateEmployee controller 
const updateEmployee = async () => {}; 

// deleteEmployee controller 
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByIdAndDelete(id); 
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting employee", error: error.message });
    }
}; 

// "/api/invoices", authenticateToken, viewChannelInvoices 
const viewChannelInvoices = async (req, res) => {
    try {
        const channelInvoices = await ChannelInvoice.find();
        res.status(200).json(channelInvoices);
    } catch (error) {
        res.status(400).json({ message: "Error fetching invoices" });
    }
};

// addLabTest controller 
const addLabTest = async () => {}; 

// updateLabTest controller 
const updateLabTest = async () => {}; 

// deleteLabTest controller 
const deleteLabTest = async () => {};

module.exports = {
    createEmployee, 
    viewEmployees, 
    deleteEmployee, 
    viewChannelInvoices,
};