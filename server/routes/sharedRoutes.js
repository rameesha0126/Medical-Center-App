const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Get all doctors 
router.get("/doctors", authenticateToken, async (req, res) => {
    try {
        const doctors = await Doctor.find(); 
        res.status(200).json(doctors);
    } catch (error) {
        res.status(400).json({ message: "Error fetching doctors", error: error.message });
    }
}); 

// Create a new appointment
router.post("/appointments", authenticateToken, async (req, res) => {
    try {
        const { patientName, doctorId } = req.body; 

        // Fetch the doctor details 
        const doctor = await Doctor.findById(doctorId); 
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Use doctor's nextDate and fee for the appointment
        const appointment = new Appointment({
            patientName, 
            doctor: doctorId, 
            appointmentDate: doctor.nextDate, 
            appointmentFee: doctor.fee,
            createdBy: req.user.username, // Captures the logged-in user's name
        });

        await appointment.save();

        res.status(201).json({ message: "Appointment created successfully", appointment });
    } catch (error) {
        res.status(400).json({ message: "Error creating appointment", error: error.message });
    }
});

// Get all appointments 
router.get("/appointments", authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("doctor", "name specialty fee") // Include doctor details 
            .sort({ appointmentDate: 1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(400).json({ message: "Error fetching appointments", error: error.message });
    }
}); 

// Update an appointment 
router.put("/appointments/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; 
        const updates = req.body;

        const appointment = await Appointment.findByIdAndUpdate(id, updates, { new: true })
            .populate("doctor", "name specialty fee");
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json({ message: "Appointment updated successfully", appointment });
    } catch (error) {
        res.status(400).json({ message: "Error updating appointment", error: error.message });
    }
}); 

// Delete an appointment 
router.delete("/appointments/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; 

        const appointment = await Appointment.findByIdAndDelete(id); 
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting appointment", error: error.message });
    }
});

module.exports = router;