import React, { useState } from 'react';
import '../styles/Login.css'; // Adjust the path based on your project structure
import { useNavigate } from 'react-router-dom'; // For redirection
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import { FaRegHospital } from 'react-icons/fa';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading to true
        setErrorMessage(''); // Clear any previous error messages

        // Debug the API URLs being used
        const apiBaseUrl = 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com';
        const loginUrl = `${apiBaseUrl}/user_authentication/login`;
        const homeUrl = `${apiBaseUrl}/home`;

        console.log('Using login URL:', loginUrl);
        console.log('Using home URL:', homeUrl);

        const payload = {
            username: username,
            password: password,
            role: 'PATIENT', // Revert to default role that previously worked
            personId: null,
        };

        try {
            // First API call: Login
            console.log('Attempting login with payload:', { ...payload, password: '***' });
            const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include' // Include cookies if any
            });

            // Log detailed response info for debugging
            console.log('Login response status:', loginResponse.status);
            console.log('Login response status text:', loginResponse.statusText);
            console.log('Login response headers:', [...loginResponse.headers.entries()]);

            if (!loginResponse.ok) {
                const errorResponse = await loginResponse.text();
                console.error('Login response not OK. Status:', loginResponse.status);
                console.error('Error response body:', errorResponse);
                throw new Error(`Login failed: ${errorResponse || loginResponse.statusText}`);
            }

            // Get the token from login response
            const token = await loginResponse.text();
            console.log('Token received:', token ? 'Yes (token hidden for security)' : 'No');

            if (!token || token.trim() === '') {
                throw new Error('No token received from server');
            }

            // Store the token in localStorage
            localStorage.setItem('authToken', token);
            // Store the username for later staff lookup
            localStorage.setItem('username', username);

            // Second API call: Access the /home endpoint
            console.log('Fetching home data with token');
            const homeResponse = await fetch(homeUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies if any
            });

            if (!homeResponse.ok) {
                const errorResponse = await homeResponse.text();
                console.error('Home response not OK:', homeResponse.status, errorResponse);
                throw new Error(`Failed to fetch home data: ${errorResponse || homeResponse.statusText}`);
            }

            // Process home response based on content type
            const contentType = homeResponse.headers.get('content-type') || '';
            let homeData;
            let homeJson = null;
            if (contentType.includes('application/json')) {
                homeJson = await homeResponse.json();
                homeData = JSON.stringify(homeJson);
                console.log('Home data parsed as JSON:', homeJson);
            } else {
                homeData = await homeResponse.text();
                console.log('Home Data received (text):', homeData);
                try {
                    homeJson = JSON.parse(homeData);
                    console.log('Home data string parsed as JSON:', homeJson);
                } catch (e) {
                    console.warn('Home data is not valid JSON:', e.message);
                }
            }
            localStorage.setItem('homeData', homeData);

            // Store relevant user ID for later use (e.g., StaffDashboard needs staffId)
            if (homeJson) {
                const staffId = homeJson.staff_id || homeJson.user?.staff_id || homeJson.user?.id;
                if (staffId) {
                    localStorage.setItem('staffId', staffId.toString());
                }
            }

            // Prepare string to check for role keywords
            const roleString = homeJson ? JSON.stringify(homeJson) : homeData;
            const hasPatient = roleString.includes('PATIENT');
            const hasDoctor = roleString.includes('DOCTOR');
            const hasStaff = roleString.includes('STAFF');
            const hasAdmin = roleString.includes('ADMIN');
            console.log('Role detection results:', { hasPatient, hasDoctor, hasStaff, hasAdmin });

            // Set user role for chat and other components
            let userRole = null;
            
            if (hasPatient) {
                userRole = 'patient';
                console.log('Redirecting to patient portal');
                
                // Extract patient ID from homeData
                let patientId = null;
                if (homeJson) {
                    patientId = homeJson.patient_id || 
                               homeJson.id || 
                               (homeJson.user && homeJson.user.patient_id);
                }
                
                if (patientId) {
                    console.log('Setting patient ID:', patientId);
                    localStorage.setItem('patientId', patientId.toString());
                } else {
                    console.warn('Patient ID not found in response');
                }
                
                navigate('/patient-portal');
            } else if (hasDoctor) {
                userRole = 'doctor';
                console.log('Redirecting to doctor portal');
                
                // Extract doctor ID from homeData
                let doctorId = null;
                if (homeJson) {
                    doctorId = homeJson.doctor_id || 
                              homeJson.id || 
                              (homeJson.user && homeJson.user.doctor_id);
                }
                
                if (doctorId) {
                    console.log('Setting doctor ID:', doctorId);
                    localStorage.setItem('doctorId', doctorId.toString());
                } else {
                    console.warn('Doctor ID not found in response');
                }
                
                navigate('/doctor-portal');
            } else if (hasStaff) {
                userRole = 'staff';
                console.log('Redirecting to staff portal');
                
                // Extract staff ID from homeData
                let staffId = null;
                if (homeJson) {
                    staffId = homeJson.staff_id || 
                             homeJson.id || 
                             (homeJson.user && (homeJson.user.staff_id || homeJson.user.id));
                }
                
                if (staffId) {
                    console.log('Setting staff ID:', staffId);
                    localStorage.setItem('staffId', staffId.toString());
                } else {
                    console.warn('Staff ID not found in response');
                }
                
                navigate('/staff-portal');
            } else if (hasAdmin) {
                userRole = 'admin';
                console.log('Redirecting to admin portal');
                
                // Extract admin ID from homeData
                let adminId = null;
                if (homeJson) {
                    adminId = homeJson.admin_id || 
                             homeJson.id || 
                             (homeJson.user && homeJson.user.admin_id);
                }
                
                if (adminId) {
                    console.log('Setting admin ID:', adminId);
                    localStorage.setItem('adminId', adminId.toString());
                } else {
                    console.warn('Admin ID not found in response');
                }
                
                navigate('/admin-portal');
            } else {
                console.error('Unable to determine user role');
                setErrorMessage('Login successful but unable to determine user role. Please try again or contact support.');
                navigate('/login');
            }
            
            // Store the role in localStorage
            if (userRole) {
                console.log('Setting user role:', userRole);
                localStorage.setItem('role', userRole);
            }
        } 
        catch (error) {
            console.error('Error during login process:', error);
            setErrorMessage('Login failed: ' + (error.message || 'Please check your username and password.'));
            // Clear any stored tokens/data if login fails
            localStorage.removeItem('authToken');
            localStorage.removeItem('homeData');
        } 
        finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring", 
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="login-wrapper">
            {loading && <LoadingSpinner />} {/* Display LoadingSpinner when loading */}
            
            <motion.div 
                className="login-container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="login-left-panel">
                    <motion.div 
                        className="login-branding"
                        variants={itemVariants}
                    >
                        <h1 className="brand-logo">
                            <FaRegHospital className="brand-icon" /> HealthNet
                        </h1>
                        <p className="brand-tagline">Your health, our priority</p>
                    </motion.div>
                    <motion.div 
                        className="login-illustration"
                        variants={itemVariants}
                    >
                        {/* Illustration will be set via CSS */}
                    </motion.div>
                </div>
                
                <div className="login-right-panel">
                    <div className="login-form-container">
                        <motion.h2 
                            className="login-title"
                            variants={itemVariants}
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p 
                            className="login-subtitle"
                            variants={itemVariants}
                        >
                            Sign in to your account
                        </motion.p>
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <motion.div 
                                className="input-container"
                                variants={itemVariants}
                            >
                                <label htmlFor="username" className="input-label">Username</label>
                                <div className="input-field-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="input-field"
                                        placeholder="Enter Email"
                                        disabled={loading}
                                    />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="input-container"
                                variants={itemVariants}
                            >
                                <div className="password-header">
                                    <label htmlFor="password" className="input-label">Password</label>
                                    <a href="#" className="forgot-password">Forgot password?</a>
                                </div>
                                <div className="input-field-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="input-field"
                                        placeholder="Enter password"
                                        disabled={loading}
                                    />
                                </div>
                            </motion.div>
                            
                            {errorMessage && (
                                <motion.p 
                                    className="error-message"
                                    variants={itemVariants}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errorMessage}
                                </motion.p>
                            )}
                            
                            <motion.div 
                                className="form-actions"
                                variants={itemVariants}
                            >
                                <button 
                                    type="submit" 
                                    className="login-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                    {!loading && <FiArrowRight className="button-icon" />}
                                </button>
                            </motion.div>
                        </form>
                        
                        <motion.div 
                            className="signup-prompt"
                            variants={itemVariants}
                        >
                            <p>Don't have an account? <a href="/register">Register</a></p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
