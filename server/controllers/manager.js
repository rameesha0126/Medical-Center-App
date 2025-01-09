const bcrypt = require('bcryptjs');
const Employee = require("../models/Employee"); 
const Doctor = require("../models/Doctor");

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

// addDoctor controller 
const addDoctor = async (req, res) => {
    try {
        const { name, specialty, fee, slots, nextDate } = req.body;
        const doctor = new Doctor({ name, specialty, fee, slots, nextDate });
        await doctor.save();
        res.status(201).json({ message: "Doctor added successfully", doctor });
    } catch (error) {
        res.status(400).json({ message: "Error adding doctor", error: error.message });
    }
}; 

// deleteDoctor controller 
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndDelete(id); 
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting doctor", error: error.message });
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
    addDoctor, 
    deleteDoctor,
};