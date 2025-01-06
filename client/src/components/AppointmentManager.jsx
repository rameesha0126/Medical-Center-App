import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api', 
});

// Attach token dynamically to each request 
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add an interceptor to handle responses 
axiosInstance.interceptors.response.use(
    (response) => {
        // If the response is successful, return the data
        return response;
    }, 
    (error) => {
        // Handle errors 
        if (error.response?.status === 401) {
            // Handle unauthorized access 
            alert("Session expired. Please log in again."); 
            localStorage.removeItem('token'); // Clear stored token 
            window.location.href = "/login"; // Redirect to the login page
        }
        return Promise.reject(error); // Propogate other errors
    }
); 

const AppointmentManager = () => {}; 

export default AppointmentManager;