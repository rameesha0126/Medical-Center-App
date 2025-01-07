import React, { useState, useEffect } from "react"; 
import jwtDecode from "jwt-decode";
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

const AppointmentManager = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(""); 
    const [patientName, setPatientName] = useState(""); 
    const [loggedInUser, setLoggedInUser] = useState(""); 
    const [isEditing, setIsEditing] = useState(false); 
    const [editAppointmentId, setEditAppointmentId] = useState(null); 

    // Fetch doctors and appointments on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const doctorResponse = await axiosInstance.get("/doctors");
                const appointmentResponse = await axiosInstance.get("/appointments");
                setDoctors(doctorResponse.data);
                setAppointments(appointmentResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    }, []);

    // Handle adding appointments 
    const handleAddAppointment = async () => {
        if (!patientName || !selectedDoctor) {
            alert("Please provide all required fields.");
            return;
        }

        const doctor = doctors.find((doc) => doc._id === selectedDoctor);
        if (!doctor) {
            alert("Doctor not found.");
            return;
        }

        const newAppointment = {
            patientName, 
            doctorId: doctor._id,
        };

        try {
            const response = await axiosInstance.post("/appointments", newAppointment);
            setAppointments([...appointments, response.data.appointment]);
            setPatientName("");
            setSelectedDoctor("");
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    // Handle Editing 
    const handleEdit = (id) => {
        const appointmentToEdit = appointments.find((appt) => appt._id === id);
        if (appointmentToEdit) {
            setIsEditing(true);
            setEditAppointmentId(id);
            setPatientName(appointmentToEdit.patientName);
            setSelectedDoctor(appointmentToEdit.doctor._id);
        }
    };

    // Update Appointment 
    const handleUpdateAppointment = async () => {
        if (!patientName || !selectedDoctor) {
            alert("Please provide all required fields.");
            return;
        }

        const updatedAppointment = {
            patientName, 
            doctorId: selectedDoctor,
        };

        try {
            const response = await axiosInstance.put(
                `/appointments/${editAppointmentId}`, 
                updatedAppointment
            );
            setAppointments(
                appointments.map((appt) => 
                    appt._id === editAppointmentId ? response.data.appointment : appt
                )
            );
            setIsEditing(false); 
            setEditAppointmentId(null);
            setPatientName(""); 
            setSelectedDoctor("");
        } catch (error) {
            console.error("Error updating appointment:", error);
        }
    };

    // Handle Deleting 
    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/appointments/${id}`);
            setAppointments(appointments.filter((appt) => appt._id !== id));
        } catch (error) {
            console.error("Error deleting appointment:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Appointment Manager</h1>

            {/* Appointment List */}
            <ul className="mb-4">
                {appointments.map((appt) => (
                    <li key={appt._id} className="border p-2 mb-2 rounded">
                        <p>Patient Name: {appt.patientName}</p>
                        <p>Doctor: {appt.doctor.name} ({appt.doctor.specialty})</p>
                        <p>Appointment Date: {appt.appointmentDate}</p>
                        <p>Fee: {appt.appointmentFee}</p>
                        <p>Created By: {appt.createdBy}</p>
                        <button
                            onClick={() => handleEdit(appt._id)} 
                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(appt._id)} 
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add Appointment Form */}
            <div className="border p-4 rounded mb-4">
                <h2 className="text-lg font-semibold mb-2">Add New Appointment</h2>
                <input 
                    type="text" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)} 
                    placeholder="Patient Name" 
                    className="border p-1 mr-2 rounded"
                />
                <select
                    value={selectedDoctor} 
                    onChange={(e) => setSelectedDoctor(e.target.value)} 
                    className="border p-1 mr-2 rounded"
                >
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                            {doc.name} {doc.specialty}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAddAppointment} 
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Appointment
                </button>
            </div>
        </div>
    );
}; 

export default AppointmentManager;