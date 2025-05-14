import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiClipboard, FiCalendar, FiEdit, FiUsers, FiActivity, FiPlusCircle, FiHome } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/DoctorPortal.css';

// Lazy load all components
const LazyDoctorDashboard = lazy(() => import('../components/DoctorDashboard'));
const LazyDoctorInfo = lazy(() => import('../components/DoctorInfo'));
const LazyManageAppointments = lazy(() => import('../components/ManageAppointments'));
const LazyUpdateProfile = lazy(() => import('../components/UpdateDoctorProfile'));
const LazyManageAvailability = lazy(() => import('../components/ManageAvailability'));
const LazySearchPatients = lazy(() => import('../components/SearchPatients'));
const LazyAddTreatment = lazy(() => import('../components/AddTreatment'));

function DoctorPortal() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('homeData');
        localStorage.removeItem('doctorId');
        navigate('/');
    };

    // Placeholder component for faster initial render
    const TabPlaceholder = () => {
        // Choose appropriate placeholder based on the active tab
        const getPlaceholderTitle = () => {
            switch (activeTab) {
                case 'Dashboard': return 'Doctor Dashboard';
                case 'DoctorInfo': return 'Doctor Information';
                case 'ManageAppointments': return 'Manage Appointments';
                case 'UpdateProfile': return 'Update Profile';
                case 'ManageAvailability': return 'Manage Availability';
                case 'SearchPatients': return 'Search Patients';
                case 'AddTreatment': return 'Add Treatment';
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
                        <LazyDoctorDashboard />
                    </Suspense>
                );
            case 'DoctorInfo':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyDoctorInfo />
                    </Suspense>
                );
            case 'ManageAppointments':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyManageAppointments />
                    </Suspense>
                );
            case 'UpdateProfile':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyUpdateProfile />
                    </Suspense>
                );
            case 'ManageAvailability':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyManageAvailability />
                    </Suspense>
                );
            case 'SearchPatients':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazySearchPatients />
                    </Suspense>
                );
            case 'AddTreatment':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyAddTreatment />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyDoctorDashboard />
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
            className="doctor-portal"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="portal-header">
                <motion.div 
                    className="portal-title"
                    variants={itemVariants}
                >
                    <h1>Doctor Portal</h1>
                    <p className="portal-subtitle">Manage appointments, patients, and treatments</p>
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
                    className={`tab-button ${activeTab === 'DoctorInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DoctorInfo')}
                >
                    <FiUser className="tab-icon" /> Doctor Info
                </button>
                <button
                    className={`tab-button ${activeTab === 'ManageAppointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ManageAppointments')}
                >
                    <FiCalendar className="tab-icon" /> Appointments
                </button>
                <button
                    className={`tab-button ${activeTab === 'SearchPatients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('SearchPatients')}
                >
                    <FiUsers className="tab-icon" /> Patients
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

export default DoctorPortal;
