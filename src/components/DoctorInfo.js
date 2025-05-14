import React, { useEffect, useState } from 'react';
import { useLoading } from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiActivity } from 'react-icons/fi';
import '../styles/DoctorInfo.css'; // CSS for the DoctorInfo component

function DoctorInfo() {
    const [doctorData, setDoctorData] = useState({});
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

    // Separated fetch to wrap with loading
    const fetchDoctorInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/getmine', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`Error fetching doctor info: ${errorResponse}`);
            }

            const data = await response.json();
            console.log('Fetched doctor data:', data); // Debugging line
            setDoctorData(data);

            // Save the doctor ID to localStorage (if required in future features)
            if (data?.id) {
                localStorage.setItem('doctorId', data.id);
                console.log('Doctor ID saved to localStorage:', data.id);
            } else {
                console.warn('Doctor ID is missing in the fetched data.');
            }
        } catch (error) {
            console.error('Error fetching doctor info:', error);
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        withLoading(fetchDoctorInfo, e => setErrorMessage(e.message))();
    }, [withLoading]);

    if (loading) return <LoadingSpinner />;
    if (errorMessage) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{errorMessage}</p>
            <button className="retry-button" onClick={() => withLoading(fetchDoctorInfo)()}>
                Try Again
            </button>
        </div>
    );
    if (!doctorData || Object.keys(doctorData).length === 0) return <LoadingSpinner />;

    return (
        <motion.div 
            className="doctor-info-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="profile-header" variants={itemVariants}>
                <div className="profile-image-container">
                    {doctorData.image && doctorData.image_type ? (
                        <img
                            src={`data:${doctorData.image_type};base64,${doctorData.image}`}
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
                    <h2>{doctorData.name || 'Doctor Name'}</h2>
                    <p className="profile-subtitle">{doctorData.specialization || 'Specialist'}</p>
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
                                <span className="info-value">{doctorData.name || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiCalendar /></div>
                            <div className="info-content">
                                <span className="info-label">Age</span>
                                <span className="info-value">{doctorData.age || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiUser /></div>
                            <div className="info-content">
                                <span className="info-label">Gender</span>
                                <span className="info-value">{doctorData.gender || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiCalendar /></div>
                            <div className="info-content">
                                <span className="info-label">Birth Date</span>
                                <span className="info-value">{doctorData.birthdate || 'N/A'}</span>
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
                                <span className="info-value">{doctorData.contact_info || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiMail /></div>
                            <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{doctorData.email || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item full-width">
                            <div className="info-icon"><FiMapPin /></div>
                            <div className="info-content">
                                <span className="info-label">Address</span>
                                <span className="info-value">{doctorData.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="info-section" variants={itemVariants}>
                    <h3 className="section-title">Professional Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon"><FiActivity /></div>
                            <div className="info-content">
                                <span className="info-label">Specialization</span>
                                <span className="info-value">{doctorData.specialization || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon"><FiCalendar /></div>
                            <div className="info-content">
                                <span className="info-label">Experience</span>
                                <span className="info-value">{doctorData.experience || 'N/A'} years</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default DoctorInfo;
