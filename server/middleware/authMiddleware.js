const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../models/tokenBlacklist');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.includes(token)) {
        return res.status(403).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        req.token = token; // Pass token for logout
        next();
    });
};

const authorizeRole = (role) => (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
};

module.exports = { authenticateToken, authorizeRole };
