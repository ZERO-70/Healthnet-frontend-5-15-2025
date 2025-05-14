import React, { memo } from 'react';
import ReactDOM from 'react-dom';
import '../styles/LoadingSpinner.css'; // Updated style path

/**
 * LoadingSpinner displays a centered loading spinner overlay.
 *
 * Usage:
 *   <LoadingSpinner />
 */
const LoadingSpinner = () => {
  const overlay = (
    <div className="spinner-container">
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(overlay, document.body);
};

// Using memo to prevent unnecessary re-renders
export default memo(LoadingSpinner);
