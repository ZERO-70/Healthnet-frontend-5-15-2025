import React, { useState, useEffect } from 'react';
import '../styles/StaffDepartmentManagement.css';
import LoadingSpinner from './LoadingSpinner';

function StaffDepartmentManagement() {
    const [activeTab, setActiveTab] = useState('staff'); // Default tab is "staff"
    const [staffList, setStaffList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStaff, setUpdateStaff] = useState(null);
    const [updateDepartment, setUpdateDepartment] = useState(null);
    const [doctorList, setDoctorList] = useState([]); // For doctors
    const [patientList, setPatientList] = useState([]); // For patients
    const [loading, setLoading] = useState(false);

    const [newStaff, setNewStaff] = useState({
        name: '',
        proffession: '',
        contact_info: '',
        gender: '',
        age: '',
        birthdate: '',
        address: '',
        image: '',
        image_type: '',
        username: '',
        password: '',
    });
    const [newDepartment, setNewDepartment] = useState({ name: '' });

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
        fetchDoctors();
        fetchPatients();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch staff data');
            }

            const data = await response.json();
            setStaffList(data);
        } catch (error) {
            setErrorMessage('Error fetching staff data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch department data');
            }

            const data = await response.json();
            setDepartmentList(data);
        } catch (error) {
            setErrorMessage('Error fetching department data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch doctor data');
            const data = await response.json();
            setDoctorList(data);
        } catch (error) {
            setErrorMessage('Error fetching doctor data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }
            
            console.log('Fetching patients data...');
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Patient API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to fetch patient data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('Patients data fetched successfully:', data.length, 'patients');
            setPatientList(data);
            setErrorMessage(''); // Clear any previous error messages on success
        } catch (error) {
            console.error('Error in fetchPatients:', error);
            setErrorMessage('Error fetching patient data: ' + error.message);
            setPatientList([]); // Set empty array to avoid rendering issues
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (type, id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            if (type === 'staff' || type === 'doctor' || type === 'patient') {
                console.log(`Deleting authentication for ${type} ID: ${id}`);
                // Delete user authentication first using ID
                await deleteAuthentication(id);
                console.log(`Authentication deleted for ${type} ID: ${id}`);
            }

            const endpointMap = {
                staff: `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff/${id}`,
                department: `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department/${id}`,
                doctor: `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/${id}`,
                patient: `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient/${id}`,
            };

            const endpoint = endpointMap[type];
            console.log(`Attempting to delete ${type} with ID: ${id} using endpoint: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete ${type}. Response status: ${response.status}`);
            }

            console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} with ID: ${id} deleted successfully`);

            // Refresh the appropriate list
            if (type === 'staff') fetchStaff();
            if (type === 'department') fetchDepartments();
            if (type === 'doctor') fetchDoctors();
            if (type === 'patient') fetchPatients();
        } catch (error) {
            console.error(`Error deleting ${type} with ID: ${id}`, error.message);
            setErrorMessage(`Error deleting ${type}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setNewStaff((prev) => ({
                ...prev,
                image: reader.result.split(',')[1], // Extract base64 string
                image_type: file.type, // Store the file type
            }));
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const addStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const staffPayload = { ...newStaff };

            // Send the staff data to the server and get the response as a plain text number
            const staffResponse = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffPayload),
            });

            if (!staffResponse.ok) {
                throw new Error('Failed to add staff');
            }

            const staffId = await staffResponse.text(); // Parse the response as plain text
            console.log('Staff added successfully, ID:', staffId);

            // Save the staff ID to localStorage
            localStorage.setItem('staffId', staffId);

            // Call addAuthentication with the username, password, and staff ID
            await addAuthentication(newStaff.username, newStaff.password, staffId);

            resetStaffModal();
            fetchStaff();
        } catch (error) {
            console.error('Error adding staff:', error.message);
            setErrorMessage('Error adding staff: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addDepartment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDepartment),
            });

            if (!response.ok) {
                throw new Error('Failed to add department');
            }

            resetDepartmentModal();
            fetchDepartments();
        } catch (error) {
            setErrorMessage('Error adding department: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStaffDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            console.log(newStaff);
            const response = await fetch(
                `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newStaff),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update staff');
            }

            resetStaffModal();
            fetchStaff();
        } catch (error) {
            setErrorMessage('Error updating staff: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateDepartmentDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department/${updateDepartment.department_id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newDepartment),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update department');
            }

            resetDepartmentModal();
            fetchDepartments();
        } catch (error) {
            setErrorMessage('Error updating department: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStaffCards = () => {
        return staffList.map((staff) => (
            <div className="inventoryCard" key={staff.id}>
                <h3>{staff.name}</h3>
                <p>Profession: {staff.proffession}</p>
                <p>Contact Info: {staff.contact_info}</p>
                <div className="recordActions">
                    <button
                        className="updateButton"
                        onClick={() => {
                            setUpdateStaff(staff);
                            setNewStaff({ ...staff });
                            setIsUpdating(true);
                            setShowStaffModal(true);
                        }}
                    >
                        Update
                    </button>
                    <button className="deleteButton" onClick={() => deleteItem('staff', staff.id)}>
                        Delete
                    </button>
                </div>
            </div>
        ));
    };

    const renderDepartmentCards = () => {
        return departmentList.map((department) => (
            <div className="inventoryCard" key={department.department_id}>
                <h3>{department.name}</h3>
                <div className="recordActions">
                    <button
                        className="updateButton"
                        onClick={() => {
                            setUpdateDepartment(department);
                            setNewDepartment({ name: department.name });
                            setIsUpdating(true);
                            setShowDepartmentModal(true);
                        }}
                    >
                        Update
                    </button>
                    <button className="deleteButton" onClick={() => deleteItem('department', department.department_id)}>
                        Delete
                    </button>
                </div>
            </div>
        ));
    };

    const renderDoctorCards = () =>
        doctorList.map((doctor) => (
            <div className="inventoryCard" key={doctor.id}>
                <h3>{doctor.name}</h3>
                <p>Specialization: {doctor.specialization}</p>
                <p>Contact Info: {doctor.contact_info}</p>
                <div className="recordActions">
                    <button
                        className="deleteButton"
                        onClick={() => deleteItem('doctor', doctor.id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));

    const renderPatientCards = () =>
        patientList.map((patient) => (
            <div className="inventoryCard" key={patient.id}>
                <h3>{patient.name}</h3>
                <p>Age: {patient.age}</p>
                <p>Contact Info: {patient.contact_info}</p>
                <div className="recordActions">
                    <button
                        className="deleteButton"
                        onClick={() => deleteItem('patient', patient.id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));

    const resetStaffModal = () => {
        setShowStaffModal(false);
        setIsUpdating(false);
        setUpdateStaff(null);
        setNewStaff({
            name: '',
            proffession: '',
            contact_info: '',
            gender: '',
            age: '',
            birthdate: '',
            address: '',
            image: '',
            image_type: '',
            username: '',
            password: '',
        });
    };

    const resetDepartmentModal = () => {
        setShowDepartmentModal(false);
        setIsUpdating(false);
        setUpdateDepartment(null);
        setNewDepartment({ name: '' });
    };

    const addAuthentication = async (username, password, personId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken'); // Retrieve the auth token
            const authPayload = {
                username,
                password,
                role: 'STAFF', // Assuming role is fixed for staff
                personId: parseInt(personId), // Convert personId to a number for safety
            };

            console.log('Authentication Payload:', authPayload); // Debug payload

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/user_authentication/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authPayload),
            });

            if (!response.ok) {
                throw new Error('Failed to register user authentication');
            }

            console.log('User authentication registered successfully');
        } catch (error) {
            console.error('Error adding user authentication:', error.message);
            throw error; // Stop further execution if authentication fails
        } finally {
            setLoading(false);
        }
    };

    const deleteAuthentication = async (id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            console.log(`Sending DELETE request to delete authentication for ID: ${id}`);

            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/user_authentication/personwith/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete authentication for ID: ${id}. Response status: ${response.status}`);
            }

            console.log(`User authentication for ID: ${id} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting authentication for ID: ${id}`, error.message);
            throw error; // Re-throw to stop further execution in `deleteItem`
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manageInventory">
            {loading && <LoadingSpinner />}
            <h1 className="inventoryTitle">Management</h1>
            <div className="actionButtons">
                <button className="createButton" onClick={() => setShowStaffModal(true)}>
                    Add Staff
                </button>
                <button className="createButton" onClick={() => setShowDepartmentModal(true)}>
                    Add Department
                </button>
            </div>
            <div className="tabs">
                <button
                    className={`tabButton ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    Show Staff
                </button>
                <button
                    className={`tabButton ${activeTab === 'department' ? 'active' : ''}`}
                    onClick={() => setActiveTab('department')}
                >
                    Show Departments
                </button>
                <button
                    className={`tabButton ${activeTab === 'doctor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('doctor')}
                >
                    Show Doctors
                </button>
                <button
                    className={`tabButton ${activeTab === 'patient' ? 'active' : ''}`}
                    onClick={() => setActiveTab('patient')}
                >
                    Show Patients
                </button>
            </div>
            <div className="inventoryList">
                {activeTab === 'staff' && renderStaffCards()}
                {activeTab === 'department' && renderDepartmentCards()}
                {activeTab === 'doctor' && renderDoctorCards()}
                {activeTab === 'patient' && renderPatientCards()}
            </div>

            {errorMessage && <p className="errorMessage">{errorMessage}</p>}

            {/* Add/Update Staff Modal */}
            {showStaffModal && (
                <div className="modal">
                    <div className="modalContent">
                        <h2>{isUpdating ? 'Update Staff' : 'Add New Staff'}</h2>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Profession"
                            value={newStaff.proffession}
                            onChange={(e) => setNewStaff({ ...newStaff, proffession: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Contact Info"
                            value={newStaff.contact_info}
                            onChange={(e) => setNewStaff({ ...newStaff, contact_info: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Gender"
                            value={newStaff.gender}
                            onChange={(e) => setNewStaff({ ...newStaff, gender: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            value={newStaff.age}
                            onChange={(e) => setNewStaff({ ...newStaff, age: e.target.value })}
                        />
                        <input
                            type="date"
                            placeholder="Birthdate"
                            value={newStaff.birthdate}
                            onChange={(e) => setNewStaff({ ...newStaff, birthdate: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={newStaff.address}
                            onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                        />
                        <input type="file" onChange={handleImageUpload} />
                        {/* New input fields for username and password */}
                        <input
                            type="text"
                            placeholder="Username"
                            value={newStaff.username}
                            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        />
                        <button
                            className="saveButton"
                            onClick={isUpdating ? updateStaffDetails : addStaff}
                        >
                            {isUpdating ? 'Update' : 'Save'}
                        </button>
                        <button className="cancelButton" onClick={resetStaffModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Update Department Modal */}
            {showDepartmentModal && (
                <div className="modal">
                    <div className="modalContent">
                        <h2>{isUpdating ? 'Update Department' : 'Add New Department'}</h2>
                        <input
                            type="text"
                            placeholder="Department Name"
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                        />
                        <button
                            className="saveButton"
                            onClick={isUpdating ? updateDepartmentDetails : addDepartment}
                        >
                            {isUpdating ? 'Update' : 'Save'}
                        </button>
                        <button className="cancelButton" onClick={resetDepartmentModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffDepartmentManagement;
