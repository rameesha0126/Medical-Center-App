const express = require("express"); 
const { authenticateToken } = require("../middleware/authMiddleware");
const { addChannel, viewChannels, viewChannelById, updateChannelPaymentById } = require("../controllers/channelControllers");
const { completeChannel } = require("../controllers/doctorControllers");


const router = express.Router();

// GET channels 
router.get("/", authenticateToken, viewChannels);
router.get("/:channelId", authenticateToken, viewChannelById);

// Add channel
router.post("/", authenticateToken, addChannel);

// Update channel
router.put("/:channelId", authenticateToken, updateChannelPaymentById);

// complete channel 
router.post("/:doctorId", authenticateToken, completeChannel);

module.exports = router;