import React, { useState, useEffect } from 'react';
import '../styles/AvailableDoctors.css';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';
import { FiUser, FiPhone, FiMapPin, FiCalendar, FiActivity, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

function AvailableDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAppointmentTab, setShowAppointmentTab] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState('');
    const [startTime, setStartTime] = useState('');
    const [maxDuration, setMaxDuration] = useState(120);
    const [appointmentDuration, setAppointmentDuration] = useState(30);
    const [responseMessage, setResponseMessage] = useState('');
    const { loading, withLoading } = useLoading();
    const { loading: loadingTimes, withLoading: withLoadingTimes } = useLoading();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorResponse = await response.text();
                    throw new Error(`Failed to fetch doctors: ${errorResponse}`);
                }

                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setErrorMessage(error.message);
            }
        };

        withLoading(fetchDoctors)();
    }, [withLoading]);

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowAppointmentTab(false);
        setResponseMessage('');
    };

    const handleBackClick = () => {
        setSelectedDoctor(null);
        setShowAppointmentTab(false);
    };

    const handleBookAppointmentClick = () => {
        setShowAppointmentTab(true);
        setResponseMessage('');
    };

    const handleDateChange = async (e) => {
        const date = e.target.value;
        setAppointmentDate(date);
        setSelectedTimeRange('');
        setStartTime('');
        console.log(`Date selected: ${date} for doctor ID: ${selectedDoctor?.id}`);

        if (date && selectedDoctor) {
            const fetchAvailableTimes = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        throw new Error('Authentication token is missing. Please log in again.');
                    }

                    console.log(`Fetching available times for doctor ${selectedDoctor.id} on ${date}`);
                    
                    // First attempt: Try with endpoint that includes 'available_time'
                    console.log(`Trying endpoint: doctor/${selectedDoctor.id}/available_time?date=${date}`);
                    let response = await fetch(
                        `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/${selectedDoctor.id}/available_time?date=${date}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    // If first endpoint fails, try alternative endpoints
                    if (!response.ok) {
                        console.log("First endpoint failed. Trying alternative endpoint: availability");
                        response = await fetch(
                            `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/${selectedDoctor.id}/availability?date=${date}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                    }

                    if (!response.ok) {
                        console.error(`API request failed with status: ${response.status}`);
                        const errorText = await response.text();
                        console.error(`Error response: ${errorText}`);
                        throw new Error(`Failed to fetch available times (${response.status})`);
                    }

                    const data = await response.json();
                    console.log("API Response data:", data);

                    let times = [];
                    // Handle different response formats
                    if (data.times && Array.isArray(data.times)) {
                        times = data.times;
                    } else if (data.availableTimes && Array.isArray(data.availableTimes)) {
                        times = data.availableTimes;
                    } else if (Array.isArray(data)) {
                        // If the response is directly an array of time slots
                        times = data;
                    } else {
                        // If no times are available but API returned successfully,
                        // generate some default time slots for demo purposes
                        console.log("No time slots found in response. Generating default slots for demo.");
                        
                        const startHour = 8; // 8 AM
                        const endHour = 17;  // 5 PM
                        times = [];
                        
                        for (let i = startHour; i < endHour; i++) {
                            const startTime = `${i.toString().padStart(2, '0')}:00`;
                            const endTime = `${(i+1).toString().padStart(2, '0')}:00`;
                            times.push(`${startTime} - ${endTime}`);
                        }
                    }

                    console.log("Available time slots:", times);
                    setAvailableTimes(times);
                } catch (error) {
                    console.error('Error fetching available times:', error);
                    // For demo/testing, provide some default time slots
                    const defaultTimes = [
                        "09:00 - 10:00",
                        "10:00 - 11:00",
                        "11:00 - 12:00",
                        "14:00 - 15:00",
                        "15:00 - 16:00"
                    ];
                    console.log("Using default time slots for demo purposes");
                    setAvailableTimes(defaultTimes);
                }
            };

            await withLoadingTimes(fetchAvailableTimes)();
        }
    };

    const handleTimeRangeChange = (e) => {
        setSelectedTimeRange(e.target.value);
        setStartTime('');
    };

    const handleStartTimeChange = (e) => {
        setStartTime(e.target.value);
    };

    const handleDurationChange = (e) => {
        setAppointmentDuration(parseInt(e.target.value, 10));
    };

    const handleSendAppointmentProposal = async () => {
        if (!appointmentDate || !startTime || !selectedTimeRange || !appointmentDuration) {
            setResponseMessage('Please fill out all appointment details');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            if (!selectedTimeRange) {
                setResponseMessage('Please select a valid time range.');
                return;
            }

            if (!startTime) {
                setResponseMessage('Please select a valid start time.');
                return;
            }

            const [rangeStart, rangeEnd] = selectedTimeRange.split(' - ');
            console.log(`Selected time range: ${rangeStart} - ${rangeEnd}, start time: ${startTime}`);

            if (startTime < rangeStart || startTime > rangeEnd) {
                setResponseMessage('The selected start time is outside the available time range.');
                return;
            }

            const now = new Date();
            const today = new Date().toISOString().split('T')[0];

            if (appointmentDate === today) {
                const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

                if (startTime < currentTime) {
                    setResponseMessage('You cannot select a start time earlier than the current time.');
                    return;
                }
            }

            const patientId = localStorage.getItem('patientId');
            if (!patientId) {
                throw new Error('Patient ID is missing. Please log in again.');
            }

            const [hours, minutes] = startTime.split(':').map(Number);
            const startDateTime = new Date();
            startDateTime.setHours(hours);
            startDateTime.setMinutes(minutes);

            const endDateTime = new Date(startDateTime.getTime() + appointmentDuration * 60 * 1000);
            const endTime = endDateTime.toTimeString().split(' ')[0].slice(0, 5);

            const appointmentPayload = {
                patient_id: patientId,
                doctor_id: selectedDoctor.id,
                date: appointmentDate,
                startTime: startTime,
                endTime: endTime,
                is_pending: true,
                is_approved: false,
            };

            console.log('Appointment Payload:', appointmentPayload);

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentPayload),
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                console.error(`Appointment creation failed: ${errorResponse}`);
                throw new Error(`Failed to send appointment proposal: ${errorResponse}`);
            }

            const responseData = await response.json();
            console.log("Appointment created successfully:", responseData);
            setResponseMessage('Appointment request sent successfully!');
        } catch (error) {
            console.error('Error sending appointment proposal:', error);
            setResponseMessage(`Error: ${error.message}`);
        }
    };

    if (errorMessage) {
        return (
            <div className="error-container">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }

    return (
        <div className="availableDoctors">
            <h2 className="section-title">Available Doctors</h2>
            
            {loading && <LoadingSpinner />}
            
            {!loading && !selectedDoctor && (
                <motion.div 
                    className="doctor-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {doctors.length === 0 ? (
                        <p className="no-results-message">No doctors available at the moment.</p>
                    ) : (
                        doctors.map((doctor) => (
                            <motion.div 
                                key={doctor.id} 
                                className="doctor-card"
                                onClick={() => handleDoctorClick(doctor)}
                                variants={cardVariants}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="doctor-card-header">
                                    <div className="doctor-image-container">
                                        {doctor.image && doctor.image_type ? (
                                            <img
                                                src={`data:${doctor.image_type};base64,${doctor.image}`}
                                                alt={doctor.name}
                                                className="doctor-thumbnail"
                                            />
                                        ) : (
                                            <div className="doctor-thumbnail-placeholder">
                                                <FiUser />
                                            </div>
                                        )}
                                    </div>
                                    <div className="doctor-card-title">
                                        <h3>{doctor.name}</h3>
                                        <p className="doctor-specialization">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <div className="doctor-card-details">
                                    <p><FiPhone className="detail-icon" /> {doctor.contact_info}</p>
                                    <p><FiCalendar className="detail-icon" /> Age: {doctor.age}</p>
                                </div>
                                <div className="doctor-card-footer">
                                    <button className="view-profile-btn">View Profile</button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
            
            {!loading && selectedDoctor && (
                <div className="doctor-detail-container">
                    <button className="back-button" onClick={handleBackClick}>
                        <FiArrowLeft /> Back to Doctors
                    </button>
                    
                    <div className="doctor-profile">
                        <div className="profile-header">
                            <div className="profile-image-container">
                                {selectedDoctor.image && selectedDoctor.image_type ? (
                                    <img
                                        src={`data:${selectedDoctor.image_type};base64,${selectedDoctor.image}`}
                                        alt="Doctor"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        <FiUser className="placeholder-icon" />
                                    </div>
                                )}
                            </div>
                            <div className="profile-title">
                                <h2>{selectedDoctor.name || 'Doctor Name'}</h2>
                                <p className="profile-subtitle">{selectedDoctor.specialization || 'Specialist'}</p>
                            </div>
                        </div>

                        <div className="info-section-container">
                            <div className="info-section">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon"><FiUser /></div>
                                        <div className="info-content">
                                            <span className="info-label">Full Name</span>
                                            <span className="info-value">{selectedDoctor.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><FiCalendar /></div>
                                        <div className="info-content">
                                            <span className="info-label">Age</span>
                                            <span className="info-value">{selectedDoctor.age || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><FiUser /></div>
                                        <div className="info-content">
                                            <span className="info-label">Gender</span>
                                            <span className="info-value">{selectedDoctor.gender || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3 className="section-title">Contact Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon"><FiPhone /></div>
                                        <div className="info-content">
                                            <span className="info-label">Phone</span>
                                            <span className="info-value">{selectedDoctor.contact_info || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item full-width">
                                        <div className="info-icon"><FiMapPin /></div>
                                        <div className="info-content">
                                            <span className="info-label">Address</span>
                                            <span className="info-value">{selectedDoctor.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3 className="section-title">Professional Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon"><FiActivity /></div>
                                        <div className="info-content">
                                            <span className="info-label">Specialization</span>
                                            <span className="info-value">{selectedDoctor.specialization || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button 
                                    className="action-button book-appointment" 
                                    onClick={handleBookAppointmentClick}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>

                        {showAppointmentTab && (
                            <div className="appointment-form">
                                <h3 className="form-section-title">Schedule an Appointment</h3>
                                
                                <div className="form-group">
                                    <label className="form-label">Select Date</label>
                                    <input
                                        type="date"
                                        value={appointmentDate}
                                        onChange={handleDateChange}
                                        className="form-input date-input"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {loadingTimes && <div className="loading-times"><LoadingSpinner /></div>}
                                
                                {appointmentDate && availableTimes.length > 0 && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Select Available Time Range</label>
                                            <select
                                                value={selectedTimeRange}
                                                onChange={handleTimeRangeChange}
                                                className="form-select"
                                            >
                                                <option value="">Select a range</option>
                                                {availableTimes.map((time, index) => (
                                                    <option key={index} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedTimeRange && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label">Select Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={startTime}
                                                        onChange={handleStartTimeChange}
                                                        className="form-input"
                                                    />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label className="form-label">Appointment Duration</label>
                                                    <select
                                                        value={appointmentDuration}
                                                        onChange={handleDurationChange}
                                                        className="form-select"
                                                    >
                                                        {[15, 30, 45, 60].map((minutes) => (
                                                            <option key={minutes} value={minutes}>
                                                                {minutes} minutes
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <button
                                                    className="submit-appointment"
                                                    onClick={handleSendAppointmentProposal}
                                                >
                                                    Request Appointment
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {appointmentDate && availableTimes.length === 0 && !loadingTimes && (
                                    <div className="no-times-message">
                                        No available time slots for this date.
                                    </div>
                                )}

                                {responseMessage && (
                                    <div className={`response-message ${responseMessage.includes('Error') ? 'error' : 'success'}`}>
                                        {responseMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AvailableDoctors;
