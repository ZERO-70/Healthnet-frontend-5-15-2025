/**
 * SessionConflictManager Component
 * 
 * Displays warnings and provides options when multiple user sessions
 * are detected across different tabs.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiAlertTriangle, FiX, FiExternalLink, FiLogOut } from 'react-icons/fi';
import { useSessionStorage } from '../services/storageAdapter';
import '../styles/SessionConflictManager.css';

const SessionConflictManager = ({ onSessionSwitch, onDismiss }) => {
    const { conflicts, activeSessions } = useSessionStorage();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        // Show conflict manager if there are conflicts
        setIsVisible(conflicts.hasConflicts);
    }, [conflicts.hasConflicts]);

    const handleSwitchSession = (sessionId) => {
        if (onSessionSwitch) {
            onSessionSwitch(sessionId);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const getPortalDisplayName = (portal) => {
        const portalNames = {
            'patient-portal': 'Patient Portal',
            'doctor-portal': 'Doctor Portal',
            'staff-portal': 'Staff Portal',
            'admin-portal': 'Admin Portal'
        };
        return portalNames[portal] || portal;
    };

    const getRoleColor = (role) => {
        const colors = {
            'patient': '#4CAF50',
            'doctor': '#2196F3',
            'staff': '#FF9800',
            'admin': '#9C27B0'
        };
        return colors[role?.toLowerCase()] || '#757575';
    };

    if (!isVisible || !conflicts.hasConflicts) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="session-conflict-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="session-conflict-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="modal-header">
                        <div className="header-icon">
                            <FiUsers />
                        </div>
                        <div className="header-content">
                            <h2>Multiple Sessions Detected</h2>
                            <p>You have other active HealthNet sessions in different tabs</p>
                        </div>
                        <button 
                            className="close-button"
                            onClick={handleDismiss}
                        >
                            <FiX />
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="warning-section">
                            <FiAlertTriangle className="warning-icon" />
                            <p>
                                Multiple sessions can cause conflicts with your data and notifications. 
                                Consider switching to an existing session or logging out from other tabs.
                            </p>
                        </div>

                        <div className="sessions-list">
                            <h3>Active Sessions</h3>
                            
                            {/* Current Session */}
                            <div className="session-item current-session">
                                <div className="session-info">
                                    <div 
                                        className="session-indicator"
                                        style={{ backgroundColor: getRoleColor(conflicts.currentSession?.userRole) }}
                                    ></div>
                                    <div className="session-details">
                                        <div className="session-title">
                                            <strong>Current Tab</strong>
                                            <span className="session-portal">
                                                {getPortalDisplayName(conflicts.currentSession?.portal)}
                                            </span>
                                        </div>
                                        <div className="session-meta">
                                            <span className="session-role">
                                                {conflicts.currentSession?.userRole || 'Unknown'}
                                            </span>
                                            <span className="session-user">
                                                {conflicts.currentSession?.userName || 'User'}
                                            </span>
                                            <span className="session-time">
                                                {formatTimestamp(conflicts.currentSession?.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="session-actions">
                                    <span className="current-badge">Current</span>
                                </div>
                            </div>

                            {/* Other Sessions */}
                            {conflicts.otherSessions.map((session) => (
                                <div 
                                    key={session.sessionId} 
                                    className={`session-item ${selectedSession === session.sessionId ? 'selected' : ''}`}
                                    onClick={() => setSelectedSession(session.sessionId)}
                                >
                                    <div className="session-info">
                                        <div 
                                            className="session-indicator"
                                            style={{ backgroundColor: getRoleColor(session.userRole) }}
                                        ></div>
                                        <div className="session-details">
                                            <div className="session-title">
                                                <strong>Other Tab</strong>
                                                <span className="session-portal">
                                                    {getPortalDisplayName(session.portal)}
                                                </span>
                                            </div>
                                            <div className="session-meta">
                                                <span className="session-role">
                                                    {session.userRole || 'Unknown'}
                                                </span>
                                                <span className="session-user">
                                                    {session.userName || 'User'}
                                                </span>
                                                <span className="session-time">
                                                    {formatTimestamp(session.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="session-actions">
                                        <button
                                            className="switch-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSwitchSession(session.sessionId);
                                            }}
                                        >
                                            <FiExternalLink />
                                            Switch
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            className="dismiss-button"
                            onClick={handleDismiss}
                        >
                            Continue with Current Session
                        </button>
                        
                        <div className="footer-info">
                            <small>
                                Sessions are automatically isolated to prevent data conflicts. 
                                You can safely work in multiple tabs with different users.
                            </small>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionConflictManager;
