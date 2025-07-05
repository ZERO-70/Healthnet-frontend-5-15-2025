import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SubscriptionPage from './pages/SubscriptionPage';

// Import loading component
import LoadingSpinner from './components/LoadingSpinner';

// Import HomePage component directly
import HomePage from './pages/HomePage';

// Import LiveChat component
import LiveChat from './components/LiveChat';

// Import Session Management
import { storage } from './services/storageAdapter';
import SessionConflictManager from './components/SessionConflictManager';
import SessionDebugger from './components/SessionDebugger';
import { enableGlobalStorageOverride } from './services/storageWrapper';

// Lazy load all portals
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const DoctorPortal = lazy(() => import('./pages/DoctorPortal'));
const StaffPortal = lazy(() => import('./pages/StaffPortal'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));

// Portal loading component
const PortalLoading = () => (
  <div className="portal-loading">
    <LoadingSpinner />
    <p>Loading portal...</p>
  </div>
);

// Improved Auth checker component
const AuthChecker = ({ children, allowedRole }) => {
  const navigate = useNavigate();
  const [showConflictManager, setShowConflictManager] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      console.log('AuthChecker: checking authentication...');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('AuthChecker: No auth token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const homeData = localStorage.getItem('homeData');
      if (!homeData) {
        console.log('AuthChecker: No home data found, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Check for session conflicts after successful auth
      const conflicts = storage.session.detectConflicts();
      if (conflicts.hasConflicts) {
        console.log('AuthChecker: Session conflicts detected:', conflicts);
        setShowConflictManager(true);
      }

      let userRole = '';
      
      // Try different methods to determine the user's role
      try {
        // Method 1: Try parsing JSON
        const parsedData = JSON.parse(homeData);
        console.log('AuthChecker: Successfully parsed homeData JSON', parsedData);
        
        if (parsedData.role) {
          userRole = parsedData.role;
          console.log('AuthChecker: Found role in parsed JSON:', userRole);
        } else if (parsedData.userRole) {
          userRole = parsedData.userRole;
          console.log('AuthChecker: Found userRole in parsed JSON:', userRole);
        } else if (parsedData.user && parsedData.user.role) {
          userRole = parsedData.user.role;
          console.log('AuthChecker: Found user.role in parsed JSON:', userRole);
        }
      } catch (e) {
        console.log('AuthChecker: Could not parse homeData as JSON, trying string matching. Error:', e.message);
        console.log('AuthChecker: Raw homeData for inspection:', homeData.length < 1000 ? homeData : homeData.substring(0, 500) + '...');
        
        // Method 2: Check for role strings if JSON parsing fails
        if (homeData.includes('"PATIENT"') || homeData.includes('PATIENT')) {
          userRole = 'PATIENT';
        } else if (homeData.includes('"DOCTOR"') || homeData.includes('DOCTOR')) {
          userRole = 'DOCTOR';
        } else if (homeData.includes('"STAFF"') || homeData.includes('STAFF')) {
          userRole = 'STAFF';
        } else if (homeData.includes('"ADMIN"') || homeData.includes('ADMIN')) {
          userRole = 'ADMIN';
        } else {
          // Method 3: Try case-insensitive string matching as last resort
          const lowerData = homeData.toLowerCase();
          if (lowerData.includes('patient')) {
            userRole = 'PATIENT';
          } else if (lowerData.includes('doctor')) {
            userRole = 'DOCTOR';
          } else if (lowerData.includes('staff')) {
            userRole = 'STAFF';
          } else if (lowerData.includes('admin')) {
            userRole = 'ADMIN';
          }
        }
        
        console.log('AuthChecker: Role determined via string matching:', userRole);
      }
      
      // If no role was determined or it doesn't match allowed role, redirect appropriately
      if (!userRole) {
        console.warn('AuthChecker: Could not determine user role, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log(`AuthChecker: User role: ${userRole}, Allowed role: ${allowedRole}`);
      
      // If allowedRole is null, any role is permitted to access this route
      if (allowedRole === null) {
        console.log('AuthChecker: allowedRole is null, allowing any authenticated user');
        // Continue with rendering children
      }
      // If roles don't match and allowedRole is not null, redirect to the correct portal
      else if (userRole !== allowedRole) {
        console.log(`AuthChecker: Role mismatch, redirecting to appropriate portal`);
        
        switch (userRole) {
          case 'PATIENT':
            navigate('/patient-portal');
            break;
          case 'DOCTOR':
            navigate('/doctor-portal');
            break;
          case 'STAFF':
            navigate('/staff-portal');
            break;
          case 'ADMIN':
            navigate('/admin-portal');
            break;
          default:
            navigate('/login');
        }
      } else {
        console.log('AuthChecker: Role match confirmed, staying on current page');
      }
    };
    
    checkAuth();
  }, [navigate, allowedRole]);

  const handleSessionSwitch = (sessionId) => {
    storage.session.switchTo(sessionId);
  };

  const handleConflictDismiss = () => {
    setShowConflictManager(false);
  };
  
  return (
    <>
      {children}
      {showConflictManager && (
        <SessionConflictManager 
          onSessionSwitch={handleSessionSwitch}
          onDismiss={handleConflictDismiss}
        />
      )}
    </>
  );
};

function App() {
  const [showGlobalConflicts, setShowGlobalConflicts] = useState(false);

  useEffect(() => {
    // Enable global localStorage override for automatic session scoping
    enableGlobalStorageOverride();
    
    // Check for conflicts on app startup
    const checkGlobalConflicts = () => {
      const conflicts = storage.session.detectConflicts();
      if (conflicts.hasConflicts) {
        console.log('App: Global session conflicts detected on startup');
        setShowGlobalConflicts(true);
      }
    };

    // Check after a brief delay to allow session manager to initialize
    const timer = setTimeout(checkGlobalConflicts, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGlobalSessionSwitch = (sessionId) => {
    storage.session.switchTo(sessionId);
  };

  const handleGlobalConflictDismiss = () => {
    setShowGlobalConflicts(false);
  };

  return (
    <Router>
      <Routes>
        {/* HomePage as the landing page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Login & Register Routes - Not lazy loaded */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Subscription Route */}
        <Route path="/subscription" element={
          <Suspense fallback={<PortalLoading />}>
            <AuthChecker allowedRole={null}>
              <SubscriptionPage />
            </AuthChecker>
          </Suspense>
        } />

        {/* Portal Routes - Lazy loaded with auth checking */}
        <Route path="/patient-portal" element={
          <Suspense fallback={<PortalLoading />}>
            <AuthChecker allowedRole="PATIENT">
              <PatientPortal />
            </AuthChecker>
          </Suspense>
        } />
        <Route path="/doctor-portal" element={
          <Suspense fallback={<PortalLoading />}>
            <AuthChecker allowedRole="DOCTOR">
              <DoctorPortal />
            </AuthChecker>
          </Suspense>
        } />
        <Route path="/staff-portal" element={
          <Suspense fallback={<PortalLoading />}>
            <AuthChecker allowedRole="STAFF">
              <StaffPortal />
            </AuthChecker>
          </Suspense>
        } />
        <Route path="/admin-portal" element={
          <Suspense fallback={<PortalLoading />}>
            <AuthChecker allowedRole="ADMIN">
              <AdminPortal />
            </AuthChecker>
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* LiveChat component - available on all pages */}
      <LiveChat />
      
      {/* Session Debugger - only in development */}
      {process.env.NODE_ENV === 'development' && <SessionDebugger />}
      
      {/* Global Session Conflict Manager */}
      {showGlobalConflicts && (
        <SessionConflictManager 
          onSessionSwitch={handleGlobalSessionSwitch}
          onDismiss={handleGlobalConflictDismiss}
        />
      )}
    </Router>
  );
}

export default App;
