import React, { lazy, Suspense } from 'react';
import '../styles/PatientDashboard.css';

// Lazy loaded dashboard components with custom loading fallbacks
const DashboardHeader = lazy(() => import('./dashboard/DashboardHeader'));
const DashboardStatCards = lazy(() => import('./dashboard/DashboardStatCards'));
const AppointmentsList = lazy(() => import('./dashboard/AppointmentsList'));
const MedicalAdviceCard = lazy(() => import('./dashboard/MedicalAdviceCard'));
const HealthMetrics = lazy(() => import('./dashboard/HealthMetrics'));

/**
 * LazyPatientDashboard - A version of PatientDashboard that uses code splitting and lazy loading
 * Each component loads independently with its own loading indicator
 */
const LazyPatientDashboard = () => {
    // Each component will handle its own data loading and error states
    // This allows the main page structure to render immediately
    
    return (
        <div className="patient-dashboard">
            {/* Dashboard Header - loads independently */}
            <Suspense fallback={
                <div className="component-loading header-loading">
                    <div className="component-loading-text">Loading your profile...</div>
                </div>
            }>
                <DashboardHeader />
            </Suspense>

            {/* Dashboard Stats - loads independently */}
            <Suspense fallback={
                <div className="component-loading stats-loading">
                    <div className="component-loading-text">Loading summary statistics...</div>
                </div>
            }>
                <DashboardStatCards />
            </Suspense>

            {/* Main content area - loads each card independently */}
            <div className="dashboard-main-content">
                {/* Left Column */}
                <div className="dashboard-column">
                    {/* Appointments section - loads independently */}
                    <Suspense fallback={
                        <div className="component-loading card-loading">
                            <div className="component-loading-text">Loading your appointments...</div>
                        </div>
                    }>
                        <AppointmentsList />
                    </Suspense>
                    
                    {/* Medical Advice section - loads independently */}
                    <Suspense fallback={
                        <div className="component-loading card-loading">
                            <div className="component-loading-text">Loading medical advice...</div>
                        </div>
                    }>
                        <MedicalAdviceCard />
                    </Suspense>
                </div>
                
                {/* Right Column */}
                <div className="dashboard-column">
                    {/* Health Metrics section - loads independently */}
                    <Suspense fallback={
                        <div className="component-loading card-loading tall">
                            <div className="component-loading-text">Loading your health data...</div>
                        </div>
                    }>
                        <HealthMetrics />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default LazyPatientDashboard; 