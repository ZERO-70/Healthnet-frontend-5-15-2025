/**
 * Storage Adapter for Multi-Tab Session Support
 * 
 * This module provides a drop-in replacement for localStorage that automatically
 * scopes storage operations to the current session/tab.
 */

import { scopedLocalStorage, SessionService } from './sessionManager';

/**
 * Scoped storage interface that mimics localStorage but with session isolation
 */
export const storage = {
    // Core localStorage methods with session scoping
    getItem: (key) => scopedLocalStorage.getItem(key),
    setItem: (key, value) => scopedLocalStorage.setItem(key, value),
    removeItem: (key) => scopedLocalStorage.removeItem(key),
    clear: () => scopedLocalStorage.clear(),
    
    // Enhanced methods for authentication
    auth: {
        /**
         * Set authentication data for current session
         */
        setAuth: (authData) => {
            const { token, homeData, role, userInfo } = authData;
            
            if (token) storage.setItem('authToken', token);
            if (homeData) storage.setItem('homeData', homeData);
            if (role) storage.setItem('role', role);
            
            // Store user-specific IDs based on role
            if (userInfo) {
                if (userInfo.patientId) storage.setItem('patientId', userInfo.patientId.toString());
                if (userInfo.doctorId) storage.setItem('doctorId', userInfo.doctorId.toString());
                if (userInfo.staffId) storage.setItem('staffId', userInfo.staffId.toString());
                if (userInfo.adminId) storage.setItem('adminId', userInfo.adminId.toString());
                if (userInfo.username) storage.setItem('username', userInfo.username);
            }
            
            // Register this session with user info
            SessionService.registerSession({
                role: role,
                username: userInfo?.username,
                name: userInfo?.name,
                portal: getPortalFromRole(role),
                ...userInfo
            });
            
            console.log(`Authentication data set for session ${SessionService.getSessionId()}`);
        },
        
        /**
         * Get all authentication data for current session
         */
        getAuth: () => {
            return {
                token: storage.getItem('authToken'),
                homeData: storage.getItem('homeData'),
                role: storage.getItem('role'),
                patientId: storage.getItem('patientId'),
                doctorId: storage.getItem('doctorId'),
                staffId: storage.getItem('staffId'),
                adminId: storage.getItem('adminId'),
                username: storage.getItem('username')
            };
        },
        
        /**
         * Clear authentication data for current session
         */
        clearAuth: () => {
            const authKeys = [
                'authToken', 'homeData', 'role', 'patientId', 
                'doctorId', 'staffId', 'adminId', 'username', 'userRole'
            ];
            
            authKeys.forEach(key => storage.removeItem(key));
            SessionService.unregisterSession();
            
            console.log(`Authentication data cleared for session ${SessionService.getSessionId()}`);
        },
        
        /**
         * Check if user is authenticated in current session
         */
        isAuthenticated: () => {
            const token = storage.getItem('authToken');
            const homeData = storage.getItem('homeData');
            return !!(token && homeData);
        }
    },
    
    // Session-specific utilities
    session: {
        /**
         * Get current session information
         */
        getInfo: () => ({
            sessionId: SessionService.getSessionId(),
            isAuthenticated: storage.auth.isAuthenticated(),
            ...storage.auth.getAuth()
        }),
        
        /**
         * Get all active sessions
         */
        getActiveSessions: () => SessionService.getActiveSessions(),
        
        /**
         * Detect conflicts with other sessions
         */
        detectConflicts: () => SessionService.detectConflicts(),
        
        /**
         * Clear current session and logout
         */
        logout: () => {
            storage.auth.clearAuth();
            // Additional cleanup can be added here
        },
        
        /**
         * Switch to different session
         */
        switchTo: (sessionId) => SessionService.switchToSession(sessionId)
    }
};

/**
 * Helper function to determine portal from role
 */
function getPortalFromRole(role) {
    if (!role) return null;
    
    const roleMap = {
        'patient': 'patient-portal',
        'doctor': 'doctor-portal', 
        'staff': 'staff-portal',
        'admin': 'admin-portal'
    };
    
    return roleMap[role.toLowerCase()] || null;
}

/**
 * Legacy localStorage wrapper for gradual migration
 * This allows existing code to work while we migrate to the new system
 */
export const createStorageWrapper = () => {
    return {
        getItem: storage.getItem,
        setItem: storage.setItem,
        removeItem: storage.removeItem,
        clear: storage.clear
    };
};

/**
 * Hook for React components to use scoped storage
 */
export const useSessionStorage = () => {
    return {
        storage,
        sessionInfo: storage.session.getInfo(),
        activeSessions: storage.session.getActiveSessions(),
        conflicts: storage.session.detectConflicts()
    };
};

export default storage;
