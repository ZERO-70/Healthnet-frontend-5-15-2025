import React, { useState, useEffect } from 'react';
import '../styles/AddTreatment.css';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';

/**
 * AddTreatment allows doctors to add, view, and delete their treatments.
 *
 * Fetches departments and treatments on mount. Handles add/delete actions.
 * Uses LoadingSpinner for async operations.
 *
 * Usage:
 *   <AddTreatment />
 *
 * Styles: AddTreatment.css
 */
function AddTreatment() {
    const [treatmentName, setTreatmentName] = useState('');
    const [departmentId, setDepartmentId] = useState(''); // For selected department
    const [departments, setDepartments] = useState([]); // List of departments
    const [treatments, setTreatments] = useState([]); // Store treatments owned by the doctor
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { loading, withLoading } = useLoading(); // Use the loading hook for fetching
    const { loading: addingLoading, withLoading: withAddLoading } = useLoading(); // For add operations
    const { loading: deletingLoading, withLoading: withDeleteLoading } = useLoading(); // For delete operations

    // Fetch departments and treatments on component mount
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchAllDepartments(),
                fetchDoctorTreatments()
            ]);
        };

        withLoading(fetchData)();
    }, [withLoading]);

    const fetchAllDepartments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch departments.');
            }

            const data = await response.json();
            console.log('Fetched Departments:', data); // Debug log for departments
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setErrorMessage('Failed to fetch departments.');
        }
    };

    const fetchDoctorTreatments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const doctorId = localStorage.getItem('doctorId'); // Fetch doctor ID from local storage
            if (!token || !doctorId) {
                throw new Error('Authentication token or doctor ID is missing. Please log in again.');
            }

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/treatement', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch treatments.');
            }

            const data = await response.json();
            console.log('Fetched Treatments:', data); // Print fetched treatments to the console

            // Filter treatments based on doctor ID
            const doctorTreatments = data.filter((treatment) => treatment.doctor_id.toString() === doctorId);
            console.log('Filtered Treatments for Current Doctor:', doctorTreatments); // Debug log for filtered treatments

            setTreatments(doctorTreatments);
        } catch (error) {
            console.error('Error fetching treatments:', error);
            setErrorMessage('Failed to fetch treatments.');
        }
    };

    const handleAddTreatment = async () => {
        const addTreatment = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const doctorId = localStorage.getItem('doctorId'); // Fetch doctor ID from local storage
                if (!token || !doctorId) {
                    throw new Error('Authentication token or doctor ID is missing. Please log in again.');
                }

                const treatmentData = {
                    name: treatmentName,
                    department_id: parseInt(departmentId, 10),
                    doctor_id: parseInt(doctorId, 10),
                };

                console.log('Sending Treatment Data:', treatmentData); // Log treatment data to the console

                const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/treatement', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(treatmentData),
                });

                if (!response.ok) {
                    throw new Error('Failed to add treatment.');
                }

                setSuccessMessage('Treatment added successfully!');
                setErrorMessage('');
                setTreatmentName('');
                setDepartmentId('');

                // Refresh treatments list after adding a new treatment
                await fetchDoctorTreatments();
                
                // Clear success message after a few seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error adding treatment:', error);
                setErrorMessage('Failed to add treatment.');
                setSuccessMessage('');
                
                // Clear error message after a few seconds
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);
            }
        };
        
        await withAddLoading(addTreatment)();
    };

    const handleDeleteTreatment = async (treatmentId) => {
        const deleteTreatment = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/treatement/${treatmentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete treatment.');
                }

                setSuccessMessage('Treatment deleted successfully!');
                setErrorMessage('');

                // Refresh treatments list after deleting a treatment
                await fetchDoctorTreatments();
                
                // Clear success message after a few seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error deleting treatment:', error);
                setErrorMessage('Failed to delete treatment.');
                setSuccessMessage('');
                
                // Clear error message after a few seconds
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);
            }
        };
        
        await withDeleteLoading(deleteTreatment)();
    };

    return (
        <div className="add-treatment">
            {loading && <LoadingSpinner />}
            
            {!loading && (
                <>
                    <h2>Add Treatment</h2>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label>
                            Treatment Name:
                            <input
                                type="text"
                                value={treatmentName}
                                onChange={(e) => setTreatmentName(e.target.value)}
                                required
                                disabled={addingLoading}
                            />
                        </label>
                        <label>
                            Department:
                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                required
                                disabled={addingLoading}
                            >
                                <option value="" disabled>
                                    Select a Department
                                </option>
                                {departments.map((department) => (
                                    <option key={department.department_id} value={department.department_id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button 
                            type="button" 
                            onClick={handleAddTreatment} 
                            disabled={addingLoading}
                        >
                            {addingLoading ? 'Adding...' : 'Add Treatment'}
                        </button>
                    </form>
                    
                    {addingLoading && <LoadingSpinner />}

                    <h2>Your Treatments</h2>
                    <div className="treatment-list">
                        {treatments.length > 0 ? (
                            treatments.map((treatment) => (
                                <div key={treatment.treatement_id} className="treatment-card">
                                    <h3>{treatment.name}</h3>
                                    <p>Department ID: {treatment.department_id}</p>
                                    <p>Doctor ID: {treatment.doctor_id}</p>
                                    <p>Treatment ID: {treatment.treatement_id}</p>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteTreatment(treatment.treatement_id)}
                                        disabled={deletingLoading}
                                    >
                                        {deletingLoading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No treatments found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AddTreatment;
