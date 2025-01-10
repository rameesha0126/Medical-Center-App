const express = require("express"); 
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware.js");
const { addChannel, editChannel, viewChannels, viewDoctors } = require("../controllers/shared.js");
const { addDoctor, deleteDoctor } = require("../controllers/manager.js");

const router = express.Router(); 

// READ
router.get("/", authenticateToken, viewDoctors); 
router.get("/:doctorId/channels", authenticateToken, viewChannels);

// CREATE 
router.post("/", authenticateToken, authorizeRole('manager'), addDoctor);
router.post("/:doctorId/channels", authenticateToken, addChannel); 

// UPDATE
router.put("/:doctorId/channels/:channelId", authenticateToken, editChannel); 

// DELETE 
router.delete("/:doctorId", authenticateToken, authorizeRole('manager'), deleteDoctor);

module.exports = router;