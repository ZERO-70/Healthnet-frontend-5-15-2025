import React, { useState, useEffect } from 'react';
import '../styles/ManageAvailability.css'; // Link to the CSS file
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';

function ManageAvailability() {
    const [availability, setAvailability] = useState({});
    const [isNotFound, setIsNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();
    const { loading: saving, withLoading: withSaveLoading } = useLoading();

    useEffect(() => {
        // Fetch current availability
        const fetchAvailability = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                console.log('Fetching availability data...');

                const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/avalibility/getmine', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log(`GET request status: ${response.status}`);

                if (response.status === 404) {
                    setIsNotFound(true);
                    console.warn('No availability found (404).');
                    return; // Prevent further execution
                }

                if (!response.ok) {
                    throw new Error(`Error fetching availability. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Fetched availability data:', data);
                setAvailability(data || {});
            } catch (error) {
                console.error('Error fetching availability:', error.message);
                setErrorMessage('Failed to fetch availability.');
            }
        };

        withLoading(fetchAvailability)();
    }, [withLoading]);

    const handleChange = (day, field, value) => {
        const lowercaseDay = day.toLowerCase(); // Convert day to lowercase for consistent keys
        setAvailability((prev) => {
            const updatedAvailability = {
                ...prev,
                [`${lowercaseDay}_${field}`]: value, // Use lowercase keys
            };
            return updatedAvailability;
        });
    };

    const handleSave = async () => {
        const saveAvailability = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const doctorId = localStorage.getItem('doctorId'); // Retrieve doctorId with the correct key
                console.log('Token being sent:', token);
                console.log('Doctor ID being sent:', doctorId);

                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                if (!doctorId) {
                    throw new Error('Doctor ID is missing. Please ensure you are logged in as a doctor.');
                }

                const url = isNotFound
                    ? 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com/avalibility'
                    : 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com/avalibility';

                const method = isNotFound ? 'POST' : 'PUT';

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };
                console.log('Request headers:', headers);

                // Ensure all days and fields are included in the request body
                const completeAvailability = { doctor_id: doctorId }; // Include doctorId in the payload
                const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

                days.forEach((day) => {
                    completeAvailability[`${day}_startTime`] = availability?.[`${day}_startTime`] || '';
                    completeAvailability[`${day}_endTime`] = availability?.[`${day}_endTime`] || '';
                });

                console.log(`Sending ${method} request to: ${url}`);
                console.log('Request body:', completeAvailability);

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(completeAvailability),
                });

                console.log(`${method} request status: ${response.status}`);

                if (!response.ok) {
                    throw new Error(`Failed to save availability. Status: ${response.status}`);
                }

                setSuccessMessage(isNotFound ? 'Availability added successfully!' : 'Availability updated successfully!');
                setIsNotFound(false); // Reset not found after saving
                
                // Clear the success message after a few seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error saving availability:', error.message);
                setErrorMessage('Failed to save availability.');
                
                // Clear the error message after a few seconds
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);
            }
        };
        
        await withSaveLoading(saveAvailability)();
    };

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return (
        <div className="manage-availability">
            {loading && <LoadingSpinner />}
            
            {!loading && (
                <>
                    <h2>{isNotFound ? 'Add Availability' : 'Update Availability'}</h2>
                    <form onSubmit={(e) => e.preventDefault()} className="availability-form">
                        {days.map((day) => (
                            <div key={day} className="day-row">
                                <h3>{day}</h3>
                                <label>
                                    Start Time:
                                    <input
                                        type="time"
                                        value={availability?.[`${day.toLowerCase()}_startTime`] || ''}
                                        onChange={(e) => handleChange(day, 'startTime', e.target.value)}
                                    />
                                </label>
                                <label>
                                    End Time:
                                    <input
                                        type="time"
                                        value={availability?.[`${day.toLowerCase()}_endTime`] || ''}
                                        onChange={(e) => handleChange(day, 'endTime', e.target.value)}
                                    />
                                </label>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleSave} 
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (isNotFound ? 'Add Availability' : 'Update Availability')}
                        </button>
                    </form>
                    {saving && <LoadingSpinner />}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </>
            )}
        </div>
    );
}

export default ManageAvailability;
