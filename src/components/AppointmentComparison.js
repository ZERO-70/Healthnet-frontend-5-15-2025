import React, { useState } from 'react';
import SearchAppointments from './SearchAppointments';
import SearchAppointmentsOptimized from './SearchAppointmentsOptimized';
import './AppointmentComparison.css';

function AppointmentComparison() {
    const [activeVersion, setActiveVersion] = useState('optimized');

    return (
        <div className="appointment-comparison">
            <div className="comparison-header">
                <h1>🚀 Appointment Loading Performance Comparison</h1>
                <p className="comparison-description">
                    Compare the loading performance between the original and optimized appointment fetching methods.
                </p>
                
                <div className="version-selector">
                    <button
                        className={`version-btn ${activeVersion === 'original' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('original')}
                    >
                        🐌 Original Version
                        <span className="version-details">Multiple API calls (1 + N + M)</span>
                    </button>
                    <button
                        className={`version-btn ${activeVersion === 'optimized' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('optimized')}
                    >
                        ⚡ Optimized Version
                        <span className="version-details">Single API call with JOINs</span>
                    </button>
                </div>

                <div className="performance-info">
                    <div className="info-card original">
                        <h3>🐌 Original Method</h3>
                        <ul>
                            <li>1 call to fetch appointments</li>
                            <li>N calls to fetch patient names</li>
                            <li>M calls to fetch doctor names</li>
                            <li>Total: 1 + N + M queries</li>
                            <li>Slow loading time</li>
                        </ul>
                    </div>
                    <div className="info-card optimized">
                        <h3>⚡ Optimized Method</h3>
                        <ul>
                            <li>1 call with JOINs to fetch all data</li>
                            <li>All patient names included</li>
                            <li>All doctor names included</li>
                            <li>Total: 1 query only</li>
                            <li>3-5x faster loading</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="comparison-content">
                {activeVersion === 'original' ? (
                    <div className="version-container">
                        <div className="version-header">
                            <h2>🐌 Original Version - Multiple API Calls</h2>
                            <p>This version makes separate API calls for each patient and doctor name</p>
                        </div>
                        <SearchAppointments />
                    </div>
                ) : (
                    <div className="version-container">
                        <div className="version-header">
                            <h2>⚡ Optimized Version - Single API Call</h2>
                            <p>This version fetches all data in one optimized database query</p>
                        </div>
                        <SearchAppointmentsOptimized />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentComparison;
