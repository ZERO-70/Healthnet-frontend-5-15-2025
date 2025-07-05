/**
 * Multi-Tab Session Testing Component
 * 
 * This component provides debugging information and manual testing tools
 * for the multi-tab session management system.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiInfo, FiRefreshCw, FiTrash2, FiEye } from 'react-icons/fi';
import { useSessionStorage } from '../services/storageAdapter';
import '../styles/SessionDebugger.css';

const SessionDebugger = () => {
    const { storage, sessionInfo, activeSessions, conflicts } = useSessionStorage();
    const [debugInfo, setDebugInfo] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        // Update debug info every 2 seconds
        const interval = setInterval(() => {
            setDebugInfo(storage.session.getInfo());
        }, 2000);

        return () => clearInterval(interval);
    }, [storage]);

    const handleRefresh = () => {
        setDebugInfo(storage.session.getInfo());
    };

    const handleClearSession = () => {
        setShowConfirmDialog(true);
    };

    const confirmClearSession = () => {
        storage.session.logout();
        setShowConfirmDialog(false);
        window.location.reload();
    };

    const cancelClearSession = () => {
        setShowConfirmDialog(false);
    };

    const handleViewStorage = () => {
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            allKeys.push({
                key,
                value: localStorage.getItem(key)
            });
        }
        console.table(allKeys);
        alert('Storage contents logged to console. Check Developer Tools > Console');
    };

    if (!isVisible) {
        return (
            <button 
                className="debug-toggle-btn"
                onClick={() => setIsVisible(true)}
                title="Open Session Debugger"
            >
                <FiUsers />
            </button>
        );
    }

    return (
        <motion.div
            className="session-debugger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <div className="debugger-header">
                <h3>Session Debugger</h3>
                <button 
                    className="close-btn"
                    onClick={() => setIsVisible(false)}
                >
                    ×
                </button>
            </div>

            <div className="debugger-content">
                {/* Current Session Info */}
                <div className="debug-section">
                    <h4><FiInfo /> Current Session</h4>
                    <div className="debug-item">
                        <strong>Session ID:</strong> {sessionInfo.sessionId}
                    </div>
                    <div className="debug-item">
                        <strong>Authenticated:</strong> {sessionInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
                    </div>
                    <div className="debug-item">
                        <strong>Role:</strong> {sessionInfo.role || 'None'}
                    </div>
                    <div className="debug-item">
                        <strong>Token:</strong> {sessionInfo.token ? '✅ Present' : '❌ Missing'}
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="debug-section">
                    <h4><FiUsers /> Active Sessions ({activeSessions.length})</h4>
                    {activeSessions.map((session, index) => (
                        <div 
                            key={session.sessionId} 
                            className={`session-debug-item ${session.isCurrentSession ? 'current' : ''}`}
                        >
                            <div className="session-debug-header">
                                <strong>{session.isCurrentSession ? 'Current Tab' : `Tab ${index + 1}`}</strong>
                                <span className="session-role">{session.userRole}</span>
                            </div>
                            <div className="session-debug-details">
                                <small>User: {session.userName || 'Unknown'}</small>
                                <small>Portal: {session.portal}</small>
                                <small>Time: {new Date(session.timestamp).toLocaleTimeString()}</small>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Conflicts */}
                {conflicts.hasConflicts && (
                    <div className="debug-section warning">
                        <h4>⚠️ Conflicts Detected</h4>
                        <p>{conflicts.conflictMessage}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="debug-actions">
                    <button onClick={handleRefresh} className="debug-btn">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button onClick={handleViewStorage} className="debug-btn">
                        <FiEye /> View Storage
                    </button>
                    <button onClick={handleClearSession} className="debug-btn danger">
                        <FiTrash2 /> Clear Session
                    </button>
                </div>

                {/* Instructions */}
                <div className="debug-section instructions">
                    <h4>Testing Instructions</h4>
                    <ol>
                        <li>Open this page in multiple tabs</li>
                        <li>Log in with different users in each tab</li>
                        <li>Check that sessions remain isolated</li>
                        <li>Test logout in one tab (shouldn't affect others)</li>
                        <li>Verify session conflict detection works</li>
                    </ol>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirm-overlay">
                    <div className="confirm-dialog">
                        <h4>Confirm Session Clear</h4>
                        <p>Clear current session? This will log you out and reload the page.</p>
                        <div className="confirm-actions">
                            <button onClick={cancelClearSession} className="debug-btn">
                                Cancel
                            </button>
                            <button onClick={confirmClearSession} className="debug-btn danger">
                                Clear Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SessionDebugger;
