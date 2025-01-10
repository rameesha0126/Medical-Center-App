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

// addChannel controller 
const addChannel = async (req, res) => {
    try {
        const { patientName, contactNo, paymentStatus } = req.body;

        // Fetch the doctor details
        const doctorId = req.params.doctorId;
        const doctor = await Doctor.findById(doctorId); 
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Use doctor's nextDate, fee and channel number for the channel 
        const channel = new Channel({
            patientName, 
            contactNo, 
            doctor: doctor._id, 
            channelDate: doctor.nextDate, 
            channelFee: doctor.fee, 
            channelNo: doctor.channelList.length, 
            paymentStatus, 
            createdDate: Date.now(), 
            createdBy: req.user.username,
        });

        await channel.save();
        doctor.channelList.push(channel._id); 
        // add channelInvoice logic
        res.status(201).json({ message: "Channel added successfully", channel });
    } catch (error) {
        res.status(400).json({ message: "Error creating channel", error: error.message });
    }
}; 

// viewChannels controller 
const viewChannels = async (req, res) => {
    try {
        const channels = await Channel.find({
            doctor: { $elemMatch: { doctor: req.params.doctorId } }
        })
            .populate("patientName contactNo paymentStatus")
            .sort({ patientName: 1 });
        res.status(400).json(channels);
    } catch (error) {
        res.status(400).json({ message: "Error fetching channels", error: error.message });
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

// createChannelInvoice controller 
const createChannelInvoice = async () => {}; 

module.exports = {
    login, 
    logout, 
    viewDoctors, 
    addChannel, 
    viewChannels, 
    editChannel,
};