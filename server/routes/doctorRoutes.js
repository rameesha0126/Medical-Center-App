const express = require("express"); 
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware.js");
const { addDoctor, viewDoctors, viewDoctorById, editDoctorById, deleteDoctorById, addChannelByDoctorId } = require("../controllers/doctorControllers.js");

const router = express.Router(); 

// Add doctor 
router.post("/", authenticateToken, authorizeRole("manager"), addDoctor);

// view doctors 
router.get("/", authenticateToken, viewDoctors); 
router.get("/:doctorId", authenticateToken, viewDoctorById); 

// edit doctors 
router.put("/:doctorId", authenticateToken, editDoctorById); 

// delete doctors 
router.put("/:doctorId", authenticateToken, deleteDoctorById); 

// add channels by doctor 
router.post("/:doctorId", authenticateToken, addChannelByDoctorId);

module.exports = router; 

// router.post("/api/doctors/", authenticateToken, authorizeRole("manager"), addDoctor); 
// router.get("/api/doctors/", authenticateToken, viewDoctors);
// router.put("/api/doctors/:doctorId", authenticateToken, editDoctor);
// router.delete("/api/doctors/:doctorId", authenticateToken, authorizeRole("manager"), deleteDoctor);
// router.get("/api/doctors/:doctorId/", authenticateToken, viewChannelsByDoctor);
// router.post("/api/doctors/:doctorId/", authenticateToken, addChannelByDoctor);
// router.put("/api/doctors/:doctorId/:channelId/", authenticateToken, editChannelByDoctor);
// router.delete("/api/doctors/:doctorId/", authenticateToken, deleteChannelByDoctor);