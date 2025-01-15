const Channel = require("../models/Channel");
const Doctor = require("../models/Doctor");
const { createChannelInvoice } = require("../utils/createChannelInvoice");

// "/api/channels", authorizeToken, addChannels
const addChannel = async (req, res) => {
    try {
        const { patientName, contactNo, doctorId, paymentStatus } = req.body; 

        // Validate required fields 
        if (!patientName || !contactNo || !doctorId) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

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
            paymentStatus,
            createdBy: req.user.username,
        });

        await newChannel.save();

        // Update doctor's channel list and decrement slots 
        doctor.channelList.push(newChannel._id);
        doctor.slots -= 1;
        if (newChannel.paymentStatus === "paid") {
            doctor.paidChannelList.push(newChannel._id);
            createChannelInvoice(newChannel);
        }
        await doctor.save();
        res.status(201).json({ message: "Channel added successfully", newChannel });
    } catch (error) {
        res.status(500).json({ message: "Error creating channel", error: error.message });
    }
};

// "/api/channels", authorizeToken, viewChannels 
const viewChannels = async (req, res) => {
    try {
        const channels = await Channel.find(); 
        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ message: "Error fetching channels", error: error.message });
    }
}; 

// "/api/channels/:channelId", authorizeToken, viewChannelById 
const viewChannelById = async (req, res) => {
    try {
        const { id } = req.params; 
        const channel = await Channel.findById(id);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        res.status(200).json({ message: "Channel fetched successfully", channel });
    } catch (error) {
        res.status(400).json({ message: "Error fetching channel", error: error.message });
    }
};

// "/api/channels/:channelId", authorizeToken, updateChannelById
const updateChannelPaymentById = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { doctorId, paymentStatus } = req.body;

        // Find channel by ID
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        } 

        // Find doctor by ID 
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Update payment status 
        channel.paymentStatus = paymentStatus; 
        const updatedChannel = await channel.save();

        // Update doctor's paid channel list and create channel invoice
        if (updatedChannel.paymentStatus === "paid") {
            doctor.paidChannelList.push(updatedChannel._id);
            createChannelInvoice(updatedChannel);
        }
        await doctor.save();
        res.status(201).json({ message: "Channel updated successfully", updatedChannel });
    } catch (error) {
        res.status(500).json({ message: "Error updating channel", error: error.message });
    }
}; 

// "/api/channels/:channelId", authorizeToken, deleteChannelById
const deleteChannelPatientById = async (req, res) => {};

module.exports = {
    addChannel, 
    viewChannels, 
    viewChannelById, 
    updateChannelPaymentById,
}