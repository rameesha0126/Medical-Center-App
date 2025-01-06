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

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]); 
    const [newEmployee, setNewEmployee] = useState({ name: "", username: "", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [editEmployee, setEditEmployee] = useState({ name: "", username: "", password: "" });
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState("");

    // Fetch employees from the database 
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get("/employees");
                setEmployees(response.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
                setError("Failed to load employees. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // Handle input changes for adding new employees 
    const handleNewEmployeeChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({ ...newEmployee, [name]: value });
    };

    // Handle input changes for editing employees 
    const handleEditEmployeeChange = (e) => {
        const { name, value } = e.target;
        setEditEmployee({ ...editEmployee, [name]: value });
    }; 

    // Add a new employee to the database 
    const addEmployee = async () => {
        if (!newEmployee.name || !newEmployee.username || !newEmployee.password) {
            setError("All fields are required.");
            return;
        } 
        setLoading(true);
        try {
            const response = await axiosInstance.post("/employees", newEmployee);
            setEmployees([...employees, response.data]);
            setNewEmployee({ name: "", username: "", password: "" });
        } catch (error) {
            console.error("Error adding employee:", error);
            setError("Failed to add employee. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Enable editing for a specific employee 
    const startEditing = (id) => {
        const employeeToEdit = employees.find((emp) => emp.id === id);
        setEditingId(id);
        setEditEmployee({ ...employeeToEdit });
    };

    // Save changes to an employee in the database 
    const saveEdit = async () => {
        setLoading(true);
        try {
            await axiosInstance.put(`/employees/${editingId}`, editEmployee);
            setEmployees(
                employees.map((emp) => 
                    emp.id === editingId ? { ...emp, ...editEmployee } : emp
                )
            );
            setEditingId(null);
            setEditEmployee({ name: "", username: "", password: "" });
        } catch (error) {
            console.error("Error updating employee:", error);
            setError("Failed to update employee. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Delete an employee from the database 
    const deleteEmployee = async (id) => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/employees/${id}`);
            setEmployees(employees.filter((emp) => emp.id !== id));
        } catch (error) {
            console.error("Error deleting employee:", error);
            setError("Failed to delete employee. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Employee Manager</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Loading...</p>}

            {/* Employee List */}
            <ul className="mb-4">
                {employees.map((emp) => (
                    <li
                        key={emp.id} 
                        className="flex items-center justify-between mb-2 border p-2 rounded"
                    >
                        {editingId === emp.id ? (
                            <>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={editEmployee.name} 
                                    onChange={handleEditEmployeeChange} 
                                    placeholder="Name" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={editEmployee.username} 
                                    onChange={handleEditEmployeeChange} 
                                    placeholder="Username" 
                                    className="border p-1 mr-2 rounded"
                                />
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={editEmployee.password} 
                                    onChange={handleEditEmployeeChange} 
                                    placeholder="Password" 
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
                                <span>{emp.name}</span>
                                <span>{emp.username}</span>
                                <span>{emp.password}</span>
                                <button
                                    onClick={() => startEditing(emp.id)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => deleteEmployee(emp.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add Employee Form */}
            <div className="border p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Add New Employee</h2>
                <input 
                    type="text" 
                    name="name" 
                    value={newEmployee.name} 
                    onChange={handleNewEmployeeChange} 
                    placeholder="Name" 
                    className="border p-1 mr-2 rounded"
                />
                <input 
                    type="text" 
                    name="username" 
                    value={newEmployee.username} 
                    onChange={handleNewEmployeeChange} 
                    placeholder="Username" 
                    className="border p-1 mr-2 rounded"
                />
                <input 
                    type="password" 
                    name="password" 
                    value={newEmployee.password} 
                    onChange={handleNewEmployeeChange} 
                    placeholder="Password" 
                    className="border p-1 mr-2 rounded"
                />
                <button 
                    onClick={addEmployee} 
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                    Add Employee
                </button>
            </div>
        </div>
    );
}; 

export default EmployeeManager;