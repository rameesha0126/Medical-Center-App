const express = require("express"); 
const { login, logout } = require("../controllers/shared.js");
const { authenticateToken } = require("../middleware/authMiddleware.js");

const router = express.Router(); 

router.post(":/login", login);
router.post(":/logout", authenticateToken, logout); 

module.exports = router;