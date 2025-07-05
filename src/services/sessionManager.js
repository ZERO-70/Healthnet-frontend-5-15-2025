/**
 * Multi-Tab Session Manager for HealthNet
 * 
 * This service manages isolated user sessions across multiple browser tabs,
 * allowing different users to be logged in simultaneously in different tabs.
 * 
 * Set DISABLE_SESSION_MANAGER=true in environment or add to constants to disable
 */

// Configuration - set this to true to disable session management entirely
const DISABLE_SESSION_MANAGER = false; // Change to true to disable

class SessionManager {
    constructor() {
        this.disabled = DISABLE_SESSION_MANAGER;
        
        if (this.disabled) {
            console.log('SessionManager disabled - using standard localStorage');
            this.setupStandardStorage();
            return;
        }
        
        this.sessionId = this.getOrCreateSessionId();
        this.originalLocalStorage = window.localStorage;
        this.setupStorageProxy();
        
        console.log(`SessionManager initialized with sessionId: ${this.sessionId}`);
    }

    /**
     * Setup standard localStorage when session manager is disabled
     */
    setupStandardStorage() {
        this.scopedStorage = window.localStorage;
    }

    /**
     * Generate or retrieve the session ID for this tab
     */
    getOrCreateSessionId() {
        if (this.disabled) return null;
        
        // First check if we already have a session ID in sessionStorage (tab-specific)
        let sessionId = sessionStorage.getItem('healthnet_session_id');
        
        if (!sessionId) {
            // Generate a new unique session ID
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('healthnet_session_id', sessionId);
            console.log(`Created new session: ${sessionId}`);
        } else {
            console.log(`Using existing session: ${sessionId}`);
        }
        
        return sessionId;
    }

    /**
     * Create scoped storage key
     */
    getScopedKey(key) {
        if (this.disabled) return key;
        
        // Don't scope certain keys that should be shared across all tabs
        const globalKeys = [
            'healthnet_session_registry',
            'healthnet_global_settings'
        ];
        
        if (globalKeys.includes(key)) {
            return key;
        }
        
        // All other keys are scoped to the session for true isolation
        return `${this.sessionId}:${key}`;
    }

    /**
     * Setup localStorage proxy to automatically scope keys
     */
    setupStorageProxy() {
        if (this.disabled) return;
        
        const self = this;
        
        // Create a proxy for localStorage
        this.scopedStorage = {
            getItem: function(key) {
                const scopedKey = self.getScopedKey(key);
                const value = self.originalLocalStorage.getItem(scopedKey);
                // Disabled verbose logging for performance
                // console.log(`[Session ${self.sessionId}] GET ${key} -> ${scopedKey} = ${value ? 'found' : 'null'}`);
                return value;
            },
            
            setItem: function(key, value) {
                const scopedKey = self.getScopedKey(key);
                // Disabled verbose logging for performance  
                // console.log(`[Session ${self.sessionId}] SET ${key} -> ${scopedKey}`);
                return self.originalLocalStorage.setItem(scopedKey, value);
            },
            
            removeItem: function(key) {
                const scopedKey = self.getScopedKey(key);
                // Disabled verbose logging for performance
                // console.log(`[Session ${self.sessionId}] REMOVE ${key} -> ${scopedKey}`);
                return self.originalLocalStorage.removeItem(scopedKey);
            },
            
            clear: function() {
                // Only clear items for this session
                // Disabled verbose logging for performance
                // console.log(`[Session ${self.sessionId}] CLEAR session data`);
                self.clearSessionData();
            },
            
            key: function(index) {
                return self.originalLocalStorage.key(index);
            },
            
            get length() {
                return self.originalLocalStorage.length;
            }
        };
    }

    /**
     * Clear only this session's data from localStorage
     */
    clearSessionData() {
        const keysToRemove = [];
        
        for (let i = 0; i < this.originalLocalStorage.length; i++) {
            const key = this.originalLocalStorage.key(i);
            if (key && key.startsWith(`${this.sessionId}:`)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            this.originalLocalStorage.removeItem(key);
        });
        
        // Also clear the session ID from sessionStorage
        sessionStorage.removeItem('healthnet_session_id');
    }

    /**
     * Get the scoped localStorage interface
     */
    getStorage() {
        return this.scopedStorage;
    }

    /**
     * Register this session in the global registry
     */
    registerSession(userInfo) {
        const registry = this.getSessionRegistry();
        const sessionData = {
            sessionId: this.sessionId,
            userInfo: userInfo,
            timestamp: Date.now(),
            tabId: this.getTabId()
        };
        
        registry[this.sessionId] = sessionData;
        this.originalLocalStorage.setItem('healthnet_session_registry', JSON.stringify(registry));
        
        console.log('Session registered:', sessionData);
    }

    /**
     * Unregister this session
     */
    unregisterSession() {
        const registry = this.getSessionRegistry();
        delete registry[this.sessionId];
        this.originalLocalStorage.setItem('healthnet_session_registry', JSON.stringify(registry));
        
        console.log(`Session ${this.sessionId} unregistered`);
    }

    /**
     * Get all active sessions
     */
    getSessionRegistry() {
        const registryJson = this.originalLocalStorage.getItem('healthnet_session_registry');
        return registryJson ? JSON.parse(registryJson) : {};
    }

    /**
     * Get all active sessions for display
     */
    getActiveSessions() {
        const registry = this.getSessionRegistry();
        return Object.values(registry).map(session => ({
            sessionId: session.sessionId,
            userRole: session.userInfo?.role,
            userName: session.userInfo?.name || session.userInfo?.username,
            portal: session.userInfo?.portal,
            timestamp: session.timestamp,
            isCurrentSession: session.sessionId === this.sessionId
        }));
    }

    /**
     * Generate a tab ID for this browser tab
     */
    getTabId() {
        let tabId = sessionStorage.getItem('healthnet_tab_id');
        if (!tabId) {
            tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            sessionStorage.setItem('healthnet_tab_id', tabId);
        }
        return tabId;
    }

    /**
     * Check for session conflicts and provide resolution options
     */
    detectSessionConflicts() {
        const activeSessions = this.getActiveSessions();
        const currentSession = activeSessions.find(s => s.isCurrentSession);
        const otherSessions = activeSessions.filter(s => !s.isCurrentSession);
        
        if (otherSessions.length > 0) {
            return {
                hasConflicts: true,
                currentSession,
                otherSessions,
                conflictMessage: `You have ${otherSessions.length} other active session(s) in different tabs.`
            };
        }
        
        return { hasConflicts: false };
    }

    /**
     * Switch to a different session (close current and redirect)
     */
    switchToSession(targetSessionId) {
        // This would typically involve closing the current session and
        // redirecting to the target session's portal
        console.log(`Switching from ${this.sessionId} to ${targetSessionId}`);
        
        // Clear current session
        this.clearSessionData();
        
        // Set the new session ID
        sessionStorage.setItem('healthnet_session_id', targetSessionId);
        
        // Reload the page to reinitialize with new session
        window.location.reload();
    }

    /**
     * Get session info for debugging
     */
    getDebugInfo() {
        return {
            sessionId: this.sessionId,
            tabId: this.getTabId(),
            activeSessions: this.getActiveSessions(),
            sessionKeys: this.getSessionKeys()
        };
    }

    /**
     * Get all keys for current session
     */
    getSessionKeys() {
        const keys = [];
        for (let i = 0; i < this.originalLocalStorage.length; i++) {
            const key = this.originalLocalStorage.key(i);
            if (key && key.startsWith(`${this.sessionId}:`)) {
                keys.push(key);
            }
        }
        return keys;
    }
}

// Create and export singleton instance
const sessionManager = new SessionManager();

// Export the scoped localStorage interface
export const scopedLocalStorage = sessionManager.getStorage();

// Export session management functions
export const SessionService = {
    getSessionId: () => sessionManager.sessionId,
    registerSession: (userInfo) => sessionManager.registerSession(userInfo),
    unregisterSession: () => sessionManager.unregisterSession(),
    getActiveSessions: () => sessionManager.getActiveSessions(),
    detectConflicts: () => sessionManager.detectSessionConflicts(),
    switchToSession: (sessionId) => sessionManager.switchToSession(sessionId),
    clearSession: () => sessionManager.clearSessionData(),
    getDebugInfo: () => sessionManager.getDebugInfo()
};

export default sessionManager;
