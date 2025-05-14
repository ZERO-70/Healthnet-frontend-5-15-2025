import React, { useEffect, useState } from 'react';
import { useLoading } from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiPhone, FiMapPin, FiBriefcase, FiInfo } from 'react-icons/fi';
import '../styles/StaffInfo.css';

function StaffInfo() {
    const [staffData, setStaffData] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();

    const fetchStaffInfo = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication token is missing. Please log in again.');
        const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff/getmine', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorResponse = await response.text();
            throw new Error(`Error fetching staff info: ${errorResponse}`);
        }
        const data = await response.json();
        setStaffData(data);
        if (data?.id) localStorage.setItem('staffId', data.id);
    };

    useEffect(() => {
        withLoading(fetchStaffInfo, e => setErrorMessage(e.message))();
    }, [withLoading]);

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
                stiffness: 100,
                damping: 12
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (errorMessage) return (
        <motion.div 
            className="error-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <p className="error-message">{errorMessage}</p>
        </motion.div>
    );
    if (!staffData || Object.keys(staffData).length === 0) return <LoadingSpinner />;

    return (
        <motion.div 
            className="staff-info-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div className="staff-header" variants={itemVariants}>
                <h2>Staff Profile</h2>
                <p className="staff-subtitle">Your personal and professional information</p>
            </motion.div>

            <motion.div className="staff-profile-section" variants={itemVariants}>
                <div className="profile-image-container">
                    {staffData.image && staffData.image_type ? (
                        <img
                            src={`data:${staffData.image_type};base64,${staffData.image}`}
                            alt="Staff"
                            className="profile-image"
                        />
                    ) : (
                        <div className="profile-image-placeholder">
                            <FiUser className="placeholder-icon" />
                        </div>
                    )}
                </div>
                <div className="staff-name">
                    <h3>{staffData.name || 'Staff Member'}</h3>
                    <p className="staff-profession">{staffData.proffession || 'Healthcare Professional'}</p>
                </div>
            </motion.div>

            <motion.div className="staff-info-grid" variants={itemVariants}>
                <motion.div 
                    className="info-card"
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="info-icon">
                        <FiCalendar />
                    </div>
                    <div className="info-content">
                        <h4>Age & Birthdate</h4>
                        <p>{staffData.age || 'N/A'} years old</p>
                        <p>{staffData.birthdate || 'Not specified'}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="info-card"
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="info-icon">
                        <FiUser />
                    </div>
                    <div className="info-content">
                        <h4>Personal Details</h4>
                        <p>Gender: {staffData.gender || 'Not specified'}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="info-card"
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="info-icon">
                        <FiPhone />
                    </div>
                    <div className="info-content">
                        <h4>Contact Information</h4>
                        <p>{staffData.contact_info || 'Not provided'}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="info-card"
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="info-icon">
                        <FiMapPin />
                    </div>
                    <div className="info-content">
                        <h4>Address</h4>
                        <p>{staffData.address || 'Not provided'}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="info-card"
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="info-icon">
                        <FiBriefcase />
                    </div>
                    <div className="info-content">
                        <h4>Professional Role</h4>
                        <p>{staffData.proffession || 'Not specified'}</p>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

export default StaffInfo;
