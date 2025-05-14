import React, { useEffect, useState } from 'react';
import { useLoading } from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiActivity, FiHeart, FiDroplet, FiAlertCircle, FiShield } from 'react-icons/fi';
import '../styles/PatientInfo.css';

function PatientInfo() {
    const [patientData, setPatientData] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 12
            }
        }
    };

    // Function to handle navigation to Update Profile tab
    const handleUpdateClick = () => {
        // Update the activeTab in parent component (PatientPortal)
        const event = new CustomEvent('changeTab', { detail: { tab: 'UpdateProfile' } });
        window.dispatchEvent(event);
    };

    // Fetch patient information
    const fetchPatientInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient/getmine', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`Error fetching patient info: ${errorResponse}`);
            }

            const data = await response.json();
            console.log('Fetched patient data:', data); // Debugging line
            setPatientData(data);

            // Save the patient ID to localStorage if needed for other components
            if (data?.id) {
                localStorage.setItem('patientId', data.id);
                console.log('Patient ID saved to localStorage:', data.id);
            } else {
                console.warn('Patient ID is missing in the fetched data.');
            }
        } catch (error) {
            console.error('Error fetching patient info:', error);
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        withLoading(fetchPatientInfo, e => setErrorMessage(e.message))();
    }, [withLoading]);

    // Helper function to safely get a property value
    const getProperty = (obj, propertyNames, defaultValue = '') => {
        if (!obj) return defaultValue;
        for (const prop of propertyNames) {
            if (obj[prop] !== undefined && obj[prop] !== null && obj[prop] !== "") {
                return obj[prop];
            }
        }
        return defaultValue;
    };

    if (loading) return <LoadingSpinner />;
    if (errorMessage) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{errorMessage}</p>
            <button className="retry-button" onClick={() => withLoading(fetchPatientInfo)()}>
                Try Again
            </button>
        </div>
    );
    if (!patientData || Object.keys(patientData).length === 0) return <LoadingSpinner />;

    return (
        <motion.div 
            className="patient-info-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="profile-header" variants={itemVariants}>
                <div className="profile-image-container">
                    {patientData.image && patientData.image_type ? (
                        <img
                            src={`data:${patientData.image_type};base64,${patientData.image}`}
                            alt="Patient"
                            className="profile-image"
                        />
                    ) : (
                        <div className="profile-image-placeholder">
                            <FiUser className="placeholder-icon" />
                        </div>
                    )}
                </div>
                <div className="profile-title">
                    <h2>{patientData.name || 'Patient Name'}</h2>
                    <p className="profile-subtitle">Patient ID: {patientData.id || 'N/A'}</p>
                </div>
            </motion.div>

            <div className="info-section-container">
                <motion.div className="info-section" variants={itemVariants}>
                    <h3 className="section-title">Personal Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon"><FiUser /></div>
                            <div className="info-content">
                                <span className="info-label">Full Name</span>
                                <span className="info-value">{patientData.name || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiCalendar /></div>
                            <div className="info-content">
                                <span className="info-label">Date of Birth</span>
                                <span className="info-value">{patientData.birthdate || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiUser /></div>
                            <div className="info-content">
                                <span className="info-label">Gender</span>
                                <span className="info-value">{patientData.gender || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiCalendar /></div>
                            <div className="info-content">
                                <span className="info-label">Age</span>
                                <span className="info-value">{patientData.age || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="info-section" variants={itemVariants}>
                    <h3 className="section-title">Contact Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon"><FiPhone /></div>
                            <div className="info-content">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{patientData.contact_info || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiMail /></div>
                            <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{patientData.email || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item full-width">
                            <div className="info-icon"><FiMapPin /></div>
                            <div className="info-content">
                                <span className="info-label">Address</span>
                                <span className="info-value">{patientData.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="info-section" variants={itemVariants}>
                    <h3 className="section-title">Medical Information</h3>
                    <div className="info-grid">
                        {getProperty(patientData, ['blood_type']) && (
                            <div className="info-item">
                                <div className="info-icon"><FiDroplet /></div>
                                <div className="info-content">
                                    <span className="info-label">Blood Type</span>
                                    <span className="info-value">{patientData.blood_type}</span>
                                </div>
                            </div>
                        )}

                        {getProperty(patientData, ['height', 'weight']) && (
                            <div className="info-item">
                                <div className="info-icon"><FiActivity /></div>
                                <div className="info-content">
                                    <span className="info-label">Physical</span>
                                    <span className="info-value">
                                        {patientData.height && `Height: ${patientData.height}`}
                                        {patientData.height && patientData.weight && ', '}
                                        {patientData.weight && `Weight: ${patientData.weight}`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {getProperty(patientData, ['allergies']) && (
                            <div className="info-item">
                                <div className="info-icon"><FiAlertCircle /></div>
                                <div className="info-content">
                                    <span className="info-label">Allergies</span>
                                    <span className="info-value">{patientData.allergies}</span>
                                </div>
                            </div>
                        )}
                        
                        {getProperty(patientData, ['existing_conditions']) && (
                            <div className="info-item">
                                <div className="info-icon"><FiActivity /></div>
                                <div className="info-content">
                                    <span className="info-label">Existing Conditions</span>
                                    <span className="info-value">{patientData.existing_conditions}</span>
                                </div>
                            </div>
                        )}
                        
                        {getProperty(patientData, ['emergency_contact']) && (
                            <div className="info-item">
                                <div className="info-icon"><FiShield /></div>
                                <div className="info-content">
                                    <span className="info-label">Emergency Contact</span>
                                    <span className="info-value">{patientData.emergency_contact}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {getProperty(patientData, ['medical_history']) && (
                    <motion.div className="info-section" variants={itemVariants}>
                        <h3 className="section-title">Medical History</h3>
                        <div className="medical-history">
                            <p>{patientData.medical_history}</p>
                        </div>
                    </motion.div>
                )}

                <motion.div className="info-actions" variants={itemVariants}>
                    <button className="action-button update" onClick={handleUpdateClick}>Update Information</button>
                    <button className="action-button print">Print Summary</button>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default PatientInfo;
