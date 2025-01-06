const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const sharedRoutes = require("./sharedRoutes");
const tokenBlacklist = require('../models/tokenBlacklist');
const { authenticateToken } = require("../middleware/authMiddleware");
require('dotenv').config();

const router = express.Router();

// Employee Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body; 
        const employee = await Employee.findOne({ username }); 

        if (!employee || !(await bcrypt.compare(password, employee.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { username: employee.username, role: "employee" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error during login", error: error.message });
    }
});

// Employee logout
router.post('/logout', authenticateToken, (req, res) => {
    const token = req.token; // Extract token from middleware
    tokenBlacklist.push(token); // Add token to blacklist
    res.status(200).json({ message: 'Logged out successfully' });
});

// Use shared routes
router.use(sharedRoutes);

module.exports = router;
