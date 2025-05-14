import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiFilePlus, FiPackage, FiUsers, FiCalendar, FiEdit, FiSearch, FiHome } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/StaffPortal.css';

// Lazy load all components
const LazyStaffDashboard = lazy(() => import('../components/LazyStaffDashboard'));
const LazyStaffInfo = lazy(() => import('../components/StaffInfo'));
const LazyManageMedicalRecords = lazy(() => import('../components/ManageMedicalRecords'));
const LazyManageInventory = lazy(() => import('../components/ManageInventory'));
const LazyFindPatients = lazy(() => import('../components/FindPatients'));
const LazySearchAppointments = lazy(() => import('../components/SearchAppointments'));
const LazyUpdateStaffProfile = lazy(() => import('../components/UpdateStaffProfile'));
const LazySearchDoctor = lazy(() => import('../components/SearchDoctor'));

function StaffPortal() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('homeData');
        localStorage.removeItem('staffId');
        navigate('/');
    };

    // Placeholder component for faster initial render
    const TabPlaceholder = () => {
        // Choose appropriate placeholder based on the active tab
        const getPlaceholderTitle = () => {
            switch (activeTab) {
                case 'Dashboard': return 'Dashboard';
                case 'StaffInfo': return 'Staff Information';
                case 'ManageMedicalRecords': return 'Medical Records';
                case 'ManageInventory': return 'Inventory Management';
                case 'FindPatients': return 'Patient Search';
                case 'SearchAppointments': return 'Appointment Search';
                case 'UpdateStaffProfile': return 'Profile Update';
                case 'SearchDoctor': return 'Doctor Search';
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
                return <LazyStaffDashboard />;
            case 'StaffInfo':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyStaffInfo />
                    </Suspense>
                );
            case 'ManageMedicalRecords':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyManageMedicalRecords />
                    </Suspense>
                );
            case 'ManageInventory':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyManageInventory />
                    </Suspense>
                );
            case 'FindPatients':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyFindPatients />
                    </Suspense>
                );
            case 'SearchAppointments':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazySearchAppointments />
                    </Suspense>
                );
            case 'UpdateStaffProfile':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyUpdateStaffProfile />
                    </Suspense>
                );
            case 'SearchDoctor':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazySearchDoctor />
                    </Suspense>
                );
            default:
                return <LazyStaffDashboard />;
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
            className="staff-portal"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="portal-header">
                <motion.div 
                    className="portal-title"
                    variants={itemVariants}
                >
                    <h1>Staff Portal</h1>
                    <p className="portal-subtitle">Manage patients, records, and more</p>
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
                    className={`tab-button ${activeTab === 'StaffInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('StaffInfo')}
                >
                    <FiUser className="tab-icon" /> Staff Info
                </button>
                <button
                    className={`tab-button ${activeTab === 'ManageMedicalRecords' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ManageMedicalRecords')}
                >
                    <FiFilePlus className="tab-icon" /> Medical Records
                </button>
                <button
                    className={`tab-button ${activeTab === 'ManageInventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ManageInventory')}
                >
                    <FiPackage className="tab-icon" /> Inventory
                </button>
                <button
                    className={`tab-button ${activeTab === 'FindPatients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('FindPatients')}
                >
                    <FiUsers className="tab-icon" /> Find Patients
                </button>
                <button
                    className={`tab-button ${activeTab === 'SearchAppointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('SearchAppointments')}
                >
                    <FiCalendar className="tab-icon" /> Appointments
                </button>
                <button
                    className={`tab-button ${activeTab === 'UpdateStaffProfile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('UpdateStaffProfile')}
                >
                    <FiEdit className="tab-icon" /> Update Profile
                </button>
                <button
                    className={`tab-button ${activeTab === 'SearchDoctor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('SearchDoctor')}
                >
                    <FiSearch className="tab-icon" /> Search Doctor
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

export default StaffPortal;
