import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SubscriptionPage.css';
import { FiX } from 'react-icons/fi';

const API_BASE_URL = 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com';

const SubscriptionPage = () => {
    const [currentSubscription, setCurrentSubscription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentSubscription();
        determineUserRole();
    }, []);

    const determineUserRole = () => {
        try {
            const homeData = localStorage.getItem('homeData');
            if (!homeData) return;
            
            // Try to parse JSON first
            try {
                const parsedData = JSON.parse(homeData);
                if (parsedData.role) {
                    setUserRole(parsedData.role);
                } else if (parsedData.userRole) {
                    setUserRole(parsedData.userRole);
                } else if (parsedData.user && parsedData.user.role) {
                    setUserRole(parsedData.user.role);
                }
            } catch (e) {
                // Fallback to string matching if JSON parsing fails
                if (homeData.includes('PATIENT')) {
                    setUserRole('PATIENT');
                } else if (homeData.includes('DOCTOR')) {
                    setUserRole('DOCTOR');
                } else if (homeData.includes('STAFF')) {
                    setUserRole('STAFF');
                } else if (homeData.includes('ADMIN')) {
                    setUserRole('ADMIN');
                }
            }
        } catch (err) {
            console.error('Error determining user role:', err);
        }
    };

    const fetchCurrentSubscription = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/user_authentication/subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCurrentSubscription(response.data.subscription);
        } catch (err) {
            setError('Failed to fetch current subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (plan) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_BASE_URL}/user_authentication/subscription`, 
                { subscription: plan },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCurrentSubscription(plan);
            alert('Subscription updated successfully!');
        } catch (err) {
            setError('Failed to update subscription');
        }
    };

    const handleClose = () => {
        // Navigate back to the appropriate portal based on user role
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
                navigate('/');
                break;
        }
    };

    if (loading) {
        return <div className="subscription-loading">Loading...</div>;
    }

    return (
        <div className="subscription-container">
            <button className="close-subscription-button" onClick={handleClose}>
                <FiX size={24} />
            </button>
            <h1>Choose Your Plan</h1>
            {error && <div className="error-message">{error}</div>}
            
            <div className="current-plan-display">
                <h2>Current Plan</h2>
                <div className="current-plan-details">
                    <span className={`plan-badge ${currentSubscription.toLowerCase()}`}>
                        {currentSubscription || 'No Active Plan'}
                    </span>
                </div>
            </div>
            
            <div className="plans-container">
                <div className="plan-card">
                    <h2>Default Plan</h2>
                    <div className="plan-features">
                        <ul>
                            <li>Basic chat functionality</li>
                            <li>Standard support</li>
                            <li>Regular updates</li>
                        </ul>
                    </div>
                    <button 
                        className={`plan-button ${currentSubscription === 'DEFAULT' ? 'current-plan' : ''}`}
                        onClick={() => handleUpgrade('DEFAULT')}
                        disabled={currentSubscription === 'DEFAULT'}
                    >
                        {currentSubscription === 'DEFAULT' ? 'Current Plan' : 'Select Plan'}
                    </button>
                </div>

                <div className="plan-card premium">
                    <h2>Plus Plan</h2>
                    <div className="plan-features">
                        <ul>
                            <li>Advanced chat features</li>
                            <li>Priority support</li>
                            <li>Early access to new features</li>
                            <li>Enhanced security</li>
                        </ul>
                    </div>
                    <button 
                        className={`plan-button ${currentSubscription === 'PLUS' ? 'current-plan' : ''}`}
                        onClick={() => handleUpgrade('PLUS')}
                        disabled={currentSubscription === 'PLUS'}
                    >
                        {currentSubscription === 'PLUS' ? 'Current Plan' : 'Upgrade to Plus'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage; 