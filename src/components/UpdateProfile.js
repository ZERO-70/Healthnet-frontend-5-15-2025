import React, { useState, useEffect } from 'react';
import '../styles/UpdateProfile.css';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';
import { FiUser, FiPhone, FiMapPin, FiEdit, FiImage, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

function UpdateProfile() {
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const { loading, withLoading } = useLoading();
    const { loading: submitting, withLoading: withSubmitLoading } = useLoading();

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

    // Fetch current patient data
    useEffect(() => {
        const fetchPatientData = async () => {
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
                    throw new Error(`Error fetching patient data: ${errorResponse}`);
                }

                const data = await response.json();
                setFormData(data); // Pre-fill form fields with fetched data
                
                // If patient has an image, prepare preview
                if (data.image && data.image_type) {
                    setPreviewImage(`data:${data.image_type};base64,${data.image}`);
                }
            } catch (error) {
                console.error('Error fetching patient data:', error);
                setErrorMessage('Failed to fetch patient data.');
            }
        };

        withLoading(fetchPatientData)();
    }, [withLoading]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                setPreviewImage(result);
                setFormData({
                    ...formData,
                    image: result.split(',')[1], // Extract base64 string
                    image_type: file.type,
                });
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorResponse = await response.text();
                    throw new Error(`Failed to update profile: ${errorResponse}`);
                }

                setSuccessMessage('Profile updated successfully!');
                // Clear the success message after a few seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error updating profile:', error);
                setErrorMessage('Failed to update profile.');
                // Clear the error message after a few seconds
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);
            }
        };

        await withSubmitLoading(submitProfile)();
    };

    return (
        <div className="updateProfile">
            <h2 className="section-title">
                <FiEdit className="title-icon" />
                Update Profile
            </h2>
            
            {loading && <LoadingSpinner />}
            
            {!loading && (
                <motion.div
                    className="profile-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <form onSubmit={handleSubmit} className="updateForm">
                        <motion.div className="form-columns" variants={itemVariants}>
                            <div className="form-column">
                                <div className="profile-image-section">
                                    <div className="profile-image-container">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile Preview" className="profile-image" />
                                        ) : (
                                            <div className="profile-image-placeholder">
                                                <FiUser className="placeholder-icon" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="image-upload-container">
                                        <label htmlFor="profileImage" className="image-upload-label">
                                            <FiImage className="upload-icon" /> Choose Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            id="profileImage"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="image-upload-input"
                                        />
                                        {imageFile && <p className="fileName">Selected: {imageFile.name}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-column">
                                <motion.div className="form-group" variants={itemVariants}>
                                    <div className="input-icon-wrapper">
                                        <FiUser className="input-icon" />
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Full Name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </motion.div>
                                
                                <motion.div className="form-group" variants={itemVariants}>
                                    <div className="input-icon-wrapper">
                                        <FiPhone className="input-icon" />
                                        <input
                                            type="text"
                                            name="contact_info"
                                            id="contact_info"
                                            placeholder="Contact Info"
                                            value={formData.contact_info || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </motion.div>
                                
                                <motion.div className="form-group" variants={itemVariants}>
                                    <div className="input-icon-wrapper">
                                        <FiMapPin className="input-icon" />
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            placeholder="Address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                        
                        <motion.div className="form-row" variants={itemVariants}>
                            <div className="form-group half-width">
                                <label htmlFor="weight">Weight (kg)</label>
                                <input
                                    type="text"
                                    name="weight"
                                    id="weight"
                                    placeholder="Weight"
                                    value={formData.weight || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group half-width">
                                <label htmlFor="height">Height (cm)</label>
                                <input
                                    type="text"
                                    name="height"
                                    id="height"
                                    placeholder="Height"
                                    value={formData.height || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <button type="submit" className="submit-button" disabled={submitting}>
                                {submitting ? 'Updating...' : (
                                    <>
                                        <FiSave className="button-icon" /> Update Profile
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>
                    
                    {submitting && <div className="overlay-spinner"><LoadingSpinner /></div>}
                    
                    {successMessage && (
                        <motion.div 
                            className="message success-message"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {successMessage}
                        </motion.div>
                    )}
                    
                    {errorMessage && (
                        <motion.div 
                            className="message error-message"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

export default UpdateProfile;
