const Channel = require("../models/Channel");
const Doctor = require("../models/Doctor");
const { createChannelInvoice } = require("../utils/createChannelInvoice");

// "/api/doctors", authenticateToken, authorizeRole("manager"), addDoctor 
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

// "/api/doctors", authenticateToken, viewDoctors 
const viewDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(400).json({ message: "Error fetching doctors", error: error.message });
    }
};

// "/api/doctors/:doctorId", authenticateToken, viewDoctorById 
const viewDoctorById = async (req, res) => {
    try {
        const { id } = req.params; 
        const doctor = await Doctor.findById(id).populate("channelList");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json({ message: "Doctor fetched successfully", doctor });
    } catch (error) {
        res.status(400).json({ message: "Error fetching doctor", error: error.message });
    }
}; 

// "/api/doctors/:doctorId", authenticateToken, editDoctorById
const editDoctorById = async (req, res) => {
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

// "/api/doctors/:doctorId", authenticateToken, authorizeRole("manager"), deleteDoctorById
const deleteDoctorById = async (req, res) => {
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

// "/api/doctors/:doctorId", authenticateToken, addChannelByDoctorId 
const addChannelByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params; 
        const { patientName, contactNo, paymentStatus } = req.body;

        // Validate required fields 
        if (!patientName || !contactNo) {
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
}

// "/api/doctors/:doctorId/completeChannel", authenticateToken, completeChannel 
const completeChannel = async (req, res) =>{
    try {
        const { doctorId } = req.params; 
        const { nextDate } = req.body; // new nextDate from user input

        // validate nextDate
        if (!nextDate) {
            return res.status(400).json({ message: "nextDate is required" });
        }

        // find the doctor by ID
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // calculate the total payment 
        const totalPayment = doctor.paidChannelList.length * doctor.fee; 

        // Log the calculated payment
        console.log(`Total Payment for Doctor ${doctor.name}: $${totalPayment}`);

        // Update the doctor: clear channelList and set the new nextDate 
        doctor.channelList = [];
        doctor.paidChannelList = [];
        doctor.nextDate = new Date(nextDate); 

        await doctor.save(); 

        res.status(200).json({
            message: "Channels completed successfully", 
            totalPayment, 
            updatedDoctor: {
                name: doctor.name, 
                specialty: doctor.specialty, 
                nextDate: doctor.nextDate,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error completing channel", error: error.message });
    }
};

module.exports = {
    addDoctor, 
    viewDoctors, 
    viewDoctorById, 
    editDoctorById, 
    deleteDoctorById, 
    addChannelByDoctorId,
    completeChannel,
};