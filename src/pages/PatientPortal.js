import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiCalendar, FiEdit, FiUserPlus, FiFileText, FiHome } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { checkAndAddSuggestions } from '../services/notificationService';
import '../styles/PatientPortal.css';

// Lazy load all components
const LazyPatientDashboard = lazy(() => import('../components/PatientDashboard'));
const LazyPatientInfo = lazy(() => import('../components/PatientInfo'));
const LazyAvailableDoctors = lazy(() => import('../components/AvailableDoctors'));
const LazyUpdateProfile = lazy(() => import('../components/UpdateProfile'));
const LazyPatientAppointments = lazy(() => import('../components/PatientAppointments'));
const LazyPatientMedicalRecords = lazy(() => import('../components/PatientMedicalRecords'));

function PatientPortal() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }

        // Fetch patient information
        const fetchPatientInfo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient/getmine', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch patient information');
                }

                const patientData = await response.json();
                
                // Save patient ID to localStorage for use in other components
                if (patientData && patientData.patient_id) {
                    localStorage.setItem('patientId', patientData.patient_id);
                    localStorage.setItem('userRole', 'PATIENT');
                    // Set lowercase role for chat functionality
                    localStorage.setItem('role', 'patient');
                    console.log('Patient ID saved to localStorage:', patientData.patient_id);
                    console.log('Role set to "patient" for chat functionality');
                }
                
                // Check for and add new suggestions
                try {
                    // Removed patientId parameter as it's no longer needed - using JWT token for identification
                    await checkAndAddSuggestions();
                } catch (err) {
                    console.error('Error checking for suggestions:', err);
                    // Don't let suggestion errors block the main flow
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching patient info:', error);
                setIsLoading(false);
            }
        };

        fetchPatientInfo();
        
        // Listen for custom tab change events from child components
        const handleTabChange = (event) => {
            if (event.detail && event.detail.tab) {
                setActiveTab(event.detail.tab);
            }
        };
        
        window.addEventListener('changeTab', handleTabChange);
        
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('changeTab', handleTabChange);
        };
    }, [navigate]);

    const handleLogout = () => {
        // Clear all auth and user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('homeData');
        localStorage.removeItem('patientId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('role'); // Clear the role for LiveChat
        
        // Navigate to homepage
        navigate('/');
    };

    // Placeholder component for faster initial render
    const TabPlaceholder = () => {
        // Choose appropriate placeholder based on the active tab
        const getPlaceholderTitle = () => {
            switch (activeTab) {
                case 'Dashboard': return 'Patient Dashboard';
                case 'PatientInfo': return 'Patient Information';
                case 'AvailableDoctors': return 'Available Doctors';
                case 'UpdateProfile': return 'Update Profile';
                case 'Appointments': return 'Your Appointments';
                case 'MedicalRecords': return 'Medical Records';
                default: return 'Loading...';
            }
        };

        return (
            <div className="tab-placeholder">
                <h2>{getPlaceholderTitle()}</h2>
                <div className="placeholder-content">
                    <LoadingSpinner />
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyPatientDashboard />
                    </Suspense>
                );
            case 'PatientInfo':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyPatientInfo />
                    </Suspense>
                );
            case 'AvailableDoctors':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyAvailableDoctors />
                    </Suspense>
                );
            case 'UpdateProfile':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyUpdateProfile />
                    </Suspense>
                );
            case 'Appointments':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyPatientAppointments />
                    </Suspense>
                );
            case 'MedicalRecords':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyPatientMedicalRecords />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyPatientDashboard />
                    </Suspense>
                );
        }
    };

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

    return (
        <motion.div 
            className="patient-portal"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="portal-header">
                <motion.div 
                    className="portal-title"
                    variants={itemVariants}
                >
                    <h1>Patient Portal</h1>
                    <p className="portal-subtitle">Manage your healthcare with ease</p>
                </motion.div>
                <motion.button 
                    className="logout-button"
                    onClick={handleLogout}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FiLogOut className="button-icon" /> Logout
                </motion.button>
            </div>

            <motion.div 
                className="tab-navigation"
                variants={itemVariants}
            >
                <button
                    className={`tab-button ${activeTab === 'Dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Dashboard')}
                >
                    <FiHome className="tab-icon" /> Dashboard
                </button>
                <button
                    className={`tab-button ${activeTab === 'PatientInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PatientInfo')}
                >
                    <FiUser className="tab-icon" /> My Info
                </button>
                <button
                    className={`tab-button ${activeTab === 'Appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Appointments')}
                >
                    <FiCalendar className="tab-icon" /> My Appointments
                </button>
                <button
                    className={`tab-button ${activeTab === 'MedicalRecords' ? 'active' : ''}`}
                    onClick={() => setActiveTab('MedicalRecords')}
                >
                    <FiFileText className="tab-icon" /> Medical Records
                </button>
                <button
                    className={`tab-button ${activeTab === 'AvailableDoctors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('AvailableDoctors')}
                >
                    <FiUserPlus className="tab-icon" /> Find Doctors
                </button>
                <button
                    className={`tab-button ${activeTab === 'UpdateProfile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('UpdateProfile')}
                >
                    <FiEdit className="tab-icon" /> Update Profile
                </button>
            </motion.div>

            <motion.div 
                className="tab-content"
                variants={itemVariants}
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {renderTabContent()}
            </motion.div>
        </motion.div>
    );
}

export default PatientPortal;
