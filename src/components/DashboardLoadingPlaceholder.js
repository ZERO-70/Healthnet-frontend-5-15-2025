import React from 'react';
import { motion } from 'framer-motion';
import '../styles/DashboardLoadingPlaceholder.css';

/**
 * Enhanced loading placeholder for dashboard components
 * Shows a visually attractive loading state that matches the dashboard layout
 */
const DashboardLoadingPlaceholder = ({ title = 'Dashboard' }) => {
  return (
    <div className="dashboard-loading-placeholder">
      <div className="dashboard-loading-header">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <div className="loading-status">
          <motion.div 
            className="pulse"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Loading your data...
          </motion.span>
        </div>
      </div>
      
      <div className="dashboard-loading-content">
        {/* Top row cards */}
        <div className="loading-cards-row">
          {[1, 2, 3].map((item) => (
            <motion.div 
              key={item}
              className="loading-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * item }}
            >
              <div className="loading-card-header">
                <div className="loading-icon"></div>
                <div className="loading-title"></div>
              </div>
              <div className="loading-card-content">
                <div className="loading-line"></div>
                <div className="loading-line"></div>
                <div className="loading-line short"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Main content area */}
        <motion.div 
          className="loading-main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="loading-section">
            <div className="loading-section-header">
              <div className="loading-section-title"></div>
            </div>
            <div className="loading-list">
              {[1, 2, 3].map((item) => (
                <motion.div 
                  key={item}
                  className="loading-list-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (0.1 * item) }}
                >
                  <div className="loading-item-icon"></div>
                  <div className="loading-item-content">
                    <div className="loading-item-title"></div>
                    <div className="loading-item-subtitle"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="loading-section">
            <div className="loading-section-header">
              <div className="loading-section-title"></div>
            </div>
            <div className="loading-chart-area">
              <div className="loading-chart"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardLoadingPlaceholder; 