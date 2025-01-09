const express = require("express");
const { createEmployee, viewEmployees } = require("../controllers/manager.js");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware.js");

const router = express.Router();

// CREATE Employee logins 
router.post("/", authenticateToken, authorizeRole, createEmployee); 

// READ Employee logins 
router.get("/", authenticateToken, authorizeRole, viewEmployees);

module.exports = router;