const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');
const Doctor = require('../models/Doctor');
const tokenBlacklist = require('../models/tokenBlacklist');
require('dotenv').config();

const router = express.Router();

// Hardcoded Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = bcrypt.hashSync('admin123', 10);

// Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD)) {
        const token = jwt.sign({ username, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
        return res.status(200).json({ message: 'Login successful', token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// Create New Employee
router.post('/employees', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { name, username, password } = req.body; 

        // Check if username is already in use 
        const existingEmployee = await Employee.findOne({ username });
        if (existingEmployee) {
            return res.status(400).json({ message: "Username is already in use" });
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10); 

        const employee = new Employee({ name, username, password: hashedPassword });
        await employee.save();
        res.status(201).json({ message: 'Employee added successfully', employee });
    } catch (error) {
        res.status(400).json({ message: 'Error adding employee', error: error.message });
    }
});

// View all Employees 
router.get("/employees", authenticateToken, authorizeRole("Admin"), async (req, res) => {
    try {
        const employees = await Employee.find().select('-password'); // Exclude password from response 
        res.status(200).json(employees);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching employees', error: error.message });
    }
});

// Delete an Employee 
router.delete("/employees/:id", authenticateToken, authorizeRole("Admin"), async (req, res) => {
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
});

// Add a new doctor
router.post("/doctors", authenticateToken, authorizeRole("Admin"), async (req, res) => {
    try {
        const { name, specialty, fee, nextDate } = req.body; 
        const doctor = new Doctor({ name, specialty, fee, nextDate });
        await doctor.save();
        res.status(201).json({ message: "Doctor added successfully", doctor });
    } catch (error) {
        res.status(400).json({ message: "Error adding doctor", error: error.message });
    }
});

// Update a doctor
router.put("/doctors/:id", authenticateToken, authorizeRole("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json({ message: "Doctor updated successfully", doctor });
    } catch (error) {
        res.status(400).json({ message: "Error updating doctor", error: error.message });
    }
});

// Delete a doctor
router.delete('/doctors/:id', authenticateToken, authorizeRole('Admin'), (req, res) => {
    const { id } = req.params;
    const index = doctors.findIndex(doc => doc.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    doctors.splice(index, 1);
    res.status(200).json({ message: 'Doctor deleted successfully' });
});

// View all Doctors 
router.get("/doctors", authenticateToken, async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(400).json({ message: "Error fetching doctors", error: error.message });
    }
});

// Admin logout
router.post('/logout', authenticateToken, (req, res) => {
    const token = req.token; // Extract token from middleware
    tokenBlacklist.push(token); // Add token to blacklist
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
