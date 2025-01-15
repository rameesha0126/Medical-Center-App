const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Doctor = require("../models/Doctor");
const Channel = require("../models/Channel");
const tokenBlacklist = require("../models/tokenBlacklist");
require('dotenv').config();

// Employee Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body; 
        const employee = await Employee.findOne({ username }); 

        if (!employee || !(await bcrypt.compare(password, employee.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { username: employee.username, role: employee.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error during login", error: error.message });
    }
};

// Employee logout
const logout = (req, res) => {
    const token = req.token; // Extract token from middleware
    tokenBlacklist.push(token); // Add token to blacklist
    res.status(200).json({ message: 'Logged out successfully' });
};

// viewDoctors
const viewDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate("name specialty fee nextDate")
            .sort({ specialty: 1 });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(400).json({ message: "Error fetching doctors", error: error.message });
    }
};

// editDoctor 
const editDoctor = async (req, res) => {
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
};

// addChannel controller 
const addChannel = async (req, res) => {
    try {
        const { patientName, contactNo, doctorId } = req.body;

        // Find the doctor by ID 
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // validate available slots 
        if (doctor.slots <= 0) {
            return res.status(400).json({ message: "No available slots for this doctor" });
        }

        // Determine channel number 
        const channelNo = doctor.channelList.length + 1;

        // Create a new channel 
        const newChannel = new Channel({
            patientName, 
            contactNo, 
            doctor: doctor._id, 
            channelDate: doctor.nextDate, 
            channelFee: doctor.fee, 
            channelNo,  
            createdBy: req.user.username,
        });

        await newChannel.save();

        // Update doctor's channel list and decrement slots 
        doctor.channelList.push(newChannel);
        doctor.slots -= 1;
        await doctor.save(); 
        // add channelInvoice logic
        res.status(201).json({ message: "Channel added successfully", newChannel });
    } catch (error) {
        res.status(500).json({ message: "Error creating channel", error: error.message });
    }
}; 

// viewChannelsByDoctor controller 
const viewChannelsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params; 

        // Validate doctor ID 
        const doctor = await Doctor.findById(doctorId); 
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        // Find channels for the given doctor ID 
        const channels = await Channel.find({ doctor: doctorId })
            .populate("channelNo", "patientName contactNo paymentStatus") //Include patient details 
            .sort({ channelNo: 1 }); // Sort by channel date 

        // Check if there are no channels 
        if (channels.length === 0) {
            return res.status(200).json({ message: "No channels found for this doctor" });
        }

        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ message: "Error fetching channels", error: error.message });
    }
};

// editChannel controller 
const editChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; 

        const channel = await Channel.findByIdAndUpdate(id, updates, { new: true })
            .populate("channelNo", "patientName", "contactNo", "paymentStatus");
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        res.status(200).json({ message: "Channel updated successfully", channel });
    } catch (error) {
        res.status(400).json({ message: "Error updating channel", error: error.message });
    }
}; 

// deleteChannel controller 
const deleteChannel = async () => {};

module.exports = {
    login, 
    logout, 
};