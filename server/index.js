const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const sharedRoutes = require("./routes/sharedRoutes");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/shared', sharedRoutes); // Routes accessible by both Admin and Employe

// Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();