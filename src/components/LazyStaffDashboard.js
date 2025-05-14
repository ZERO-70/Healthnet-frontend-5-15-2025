import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

// Lazy load the StaffDashboard component
const StaffDashboard = lazy(() => import('./StaffDashboard'));

// Loading placeholder with the same styling as the dashboard
const DashboardLoadingPlaceholder = () => {
  return (
    <motion.div 
      className="staff-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Staff Dashboard</h1>
          <p className="subtitle">Analytics & Overview</p>
        </div>
      </div>
      
      {/* Placeholder for stats */}
      <div className="stats-container">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="stat-card placeholder-card">
            <div className="stat-icon placeholder-icon"></div>
            <div className="stat-details">
              <div className="placeholder-text"></div>
              <div className="placeholder-text-sm"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for charts grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card wide placeholder-card">
          <div className="card-header">
            <h2><FiBarChart2 /> Loading Charts...</h2>
          </div>
          <div className="chart-container">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component with Suspense fallback
const LazyStaffDashboard = () => {
  return (
    <Suspense fallback={<DashboardLoadingPlaceholder />}>
      <StaffDashboard />
    </Suspense>
  );
};

export default LazyStaffDashboard; 