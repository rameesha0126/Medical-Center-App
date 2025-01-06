import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api'
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

const DoctorManager = () => {
    const [doctors, setDoctors] = useState([]); 
    const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "", fee: "", nextDate: "" });
    const [editingId, setEditingId] = useState(null);
    const [editDoctor, setEditDoctor] = useState({ name: "", specialty: "", fee: "", nextDate: "" });
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState("");

    // Fetch employees from the database 
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get("/doctors");
                setDoctors(response.data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
                setError("Failed to load employees. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Handle input changes for adding new doctors 
    const handleNewDoctorChange = (e) => {
        const { name, value } = e.target;
        setNewDoctor({ ...newDoctor, [name]: value });
    };

    // Handle input changes for editing doctors 
    const handleEditDoctorChange = (e) => {
        const { name, value } = e.target;
        setEditDoctor({ ...editDoctor, [name]: value });
    }; 

    // Add a new doctor to the database 
    const addDoctor = async () => {
        if (!newDoctor.name || !newDoctor.specialty || !newDoctor.fee || !newDoctor.nextDate) {
            setError("All fields are required."); 
            return;
        } 
        setLoading(true);
        try {
            const response = await axiosInstance.post("/doctors", newDoctor);
            setDoctors([...doctors, response.data.doctor]);
            setNewDoctor({ name: "", specialty: "", fee: "", nextDate: "" });
        } catch (error) {
            console.error("Error adding doctor:", error);
            setError("Failed to add doctor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Enable editing for a specific doctor 
    const startEditing = (id) => {
        const doctorToEdit = doctors.find((doc) => doc.id === id);
        setEditingId(id);
        setEditDoctor({ ...doctorToEdit });
    };

    // Save changes to a doctor in the database 
    const saveEdit = async () => {
        setLoading(true);
        try {
            await axiosInstance.put(`/doctors/${editingId}`, editDoctor);
            setDoctors(
                doctors.map((doc) => 
                    doc.id === editingId ? { ...doc, ...editDoctor } : doc
                )
            );
            setEditingId(null);
            setEditDoctor({ name: "", specialty: "", fee: "", nextDate: "" });
        } catch (error) {
            console.error("Error updating doctor:", error);
            setError("Failed to update doctor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Delete a doctor from the database 
    const deleteDoctor = async (id) => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/doctors/${id}`);
            setDoctors(doctors.filter((doc) => doc.id !== id));
        } catch (error) {
            console.error("Error deleting doctor:", error);
            setError("Failed to delete doctor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Doctor Manager</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}

            {/* Doctors List */}
            <ul className="mb-4">
                {doctors.map((doc) => (
                    <li
                        key={doc.id} 
                        className="flex items-center justify-between mb-2 border p-2 rounded"
                    >
                        {editingId === doc.id ? (
                            <>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={editDoctor.name} 
                                    onChange={handleEditDoctorChange} 
                                    placeholder="Name" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <input 
                                    type="text" 
                                    name="specialty" 
                                    value={editDoctor.specialty} 
                                    onChange={handleEditDoctorChange} 
                                    placeholder="Specialty" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <input 
                                    type="number" 
                                    name="fee" 
                                    value={editDoctor.fee} 
                                    onChange={handleEditDoctorChange} 
                                    placeholder="Fee" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <input 
                                    type="date" 
                                    name="nextDate" 
                                    value={editDoctor.nextDate} 
                                    onChange={handleEditDoctorChange} 
                                    placeholder="Next Date" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <button 
                                    onClick={saveEdit} 
                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <span>{doc.name}</span>
                                <span>{doc.specialty}</span>
                                <span>{doc.fee}</span>
                                <span>{doc.nextDate}</span>
                                <button
                                    onClick={() => startEditing(doc.id)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => deleteDoctor(doc.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add Doctor Form */}
            <div className="border p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Add New Doctor</h2>
                <input 
                    type="text" 
                    name="name" 
                    value={newDoctor.name} 
                    onChange={handleNewDoctorChange} 
                    placeholder="Name" 
                    className="border p-1 mr-2 rounded"
                />
                <input 
                    type="text" 
                    name="specialty" 
                    value={newDoctor.specialty} 
                    onChange={handleNewDoctorChange} 
                    placeholder="Specialty" 
                    className="border p-1 mr-2 rounded"
                />
                <input 
                    type="number" 
                    name="fee" 
                    value={newDoctor.fee} 
                    onChange={handleNewDoctorChange} 
                    placeholder="Fee" 
                    className="border p-1 mr-2 rounded"
                />
                <input 
                    type="date" 
                    name="nextDate" 
                    value={newDoctor.nextDate} 
                    onChange={handleNewDoctorChange} 
                    placeholder="Next Date" 
                    className="border p-1 mr-2 rounded"
                />
                <button 
                    onClick={addDoctor} 
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                    Add Doctor
                </button>
            </div>
        </div>
    );
}; 

export default DoctorManager;