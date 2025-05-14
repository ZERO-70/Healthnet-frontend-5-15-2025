import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiUsers, FiBarChart2, FiEdit, FiBriefcase, FiSettings, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationIcon from '../components/NotificationIcon';
import '../styles/AdminPortal.css';

// Lazy load all components
const LazyAdminInfo = lazy(() => import('../components/AdminInfo'));
const LazyStaffDepartmentManagement = lazy(() => import('../components/StaffDepartmentManagement'));
const LazyAnalytics = lazy(() => import('../components/Analytics'));
const LazyProfileUpdate = lazy(() => import('../components/ProfileUpdate'));

function AdminPortal() {
    const [activeTab, setActiveTab] = useState('AdminInfo');
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all stored authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('homeData');
        localStorage.removeItem('adminId');
        
        // Redirect to login page
        navigate('/');
    };

    // Placeholder component for faster initial render
    const TabPlaceholder = () => {
        // Choose appropriate placeholder based on the active tab
        const getPlaceholderTitle = () => {
            switch (activeTab) {
                case 'AdminInfo': return 'Admin Information';
                case 'StaffDepartmentManagement': return 'Staff & Department Management';
                case 'Analytics': return 'System Analytics';
                case 'ProfileUpdate': return 'Profile Update';
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
            case 'AdminInfo':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyAdminInfo />
                    </Suspense>
                );
            case 'StaffDepartmentManagement':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyStaffDepartmentManagement />
                    </Suspense>
                );
            case 'Analytics':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyAnalytics />
                    </Suspense>
                );
            case 'ProfileUpdate':
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyProfileUpdate />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<TabPlaceholder />}>
                        <LazyAdminInfo />
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
            className="adminPortal"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="portalHeader">
                <motion.div 
                    className="portal-title"
                    variants={itemVariants}
                >
                    <h1 className="portalTitle">Admin Portal</h1>
                    <p className="portal-subtitle">System administration and management</p>
                </motion.div>
                
                <motion.div 
                    className="header-right-elements"
                    variants={itemVariants}
                >
                    <NotificationIcon />
                    <motion.button 
                        className="logoutButton"
                        onClick={handleLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiLogOut className="button-icon" /> Logout
                    </motion.button>
                </motion.div>
            </div>

            <motion.div 
                className="portalNav"
                variants={itemVariants}
            >
                <button
                    className={`tab-button ${activeTab === 'AdminInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('AdminInfo')}
                >
                    <FiUser className="tab-icon" /> Admin Info
                </button>
                <button
                    className={`tab-button ${activeTab === 'StaffDepartmentManagement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('StaffDepartmentManagement')}
                >
                    <FiUsers className="tab-icon" /> Management
                </button>
                <button
                    className={`tab-button ${activeTab === 'Analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Analytics')}
                >
                    <FiBarChart2 className="tab-icon" /> Analytics
                </button>
                <button
                    className={`tab-button ${activeTab === 'ProfileUpdate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ProfileUpdate')}
                >
                    <FiSettings className="tab-icon" /> Profile Update
                </button>
            </motion.div>

            <motion.div 
                className="portalContent"
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

export default AdminPortal;
