import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Register.css';
import { API_BASE_URL } from '../constants/api';

function Register() {
    const [userType, setUserType] = useState(''); // To track if the user is a patient or doctor
    const [formData, setFormData] = useState({});
    const [imageBase64, setImageBase64] = useState(''); // To store Base64 encoded image
    const [imagePreview, setImagePreview] = useState(''); // For displaying image preview
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const [emailError, setEmailError] = useState(''); // Add email validation error state
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    // Get today's date in YYYY-MM-DD format to prevent future birthdate selection
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email input changes with validation
    const handleEmailChange = (e) => {
        const email = e.target.value;
        setUsername(email);
        
        // Clear previous email error
        setEmailError('');
        
        // Validate email if not empty
        if (email && !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle image upload and convert to Base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            const result = reader.result;
            setImagePreview(result); // Set the full data URL for preview
            setImageBase64(result.split(',')[1]); // Extract Base64 data
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    // Handle contact info changes with validation
    const handleContactChange = (e) => {
        const value = e.target.value;
        // Allow only numbers, spaces, hyphens, plus signs, and parentheses
        if (/^[\d\s\-\+\(\)]*$/.test(value)) {
            setFormData({
                ...formData,
                [e.target.name]: value,
            });
        }
    };

    // Comprehensive form validation
    const validateForm = () => {
        const errors = [];
        
        // Validate email
        if (!username || !validateEmail(username)) {
            errors.push('Please enter a valid email address');
        }
        
        // Validate password (minimum 6 characters)
        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        // Validate required fields based on user type
        const requiredFields = ['name', 'gender', 'age', 'birthdate', 'contact_info', 'address'];
        
        if (userType === 'PATIENT') {
            requiredFields.push('weight', 'height');
        } else if (userType === 'DOCTOR') {
            requiredFields.push('specialization');
        }
        
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                errors.push(`${fieldName} is required`);
            }
        }
        
        // Validate age (must be positive number)
        if (formData.age && (isNaN(formData.age) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 120)) {
            errors.push('Please enter a valid age (1-120)');
        }
        
        // Validate weight and height for patients
        if (userType === 'PATIENT') {
            if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 500)) {
                errors.push('Please enter a valid weight (1-500 kg)');
            }
            if (formData.height && (isNaN(formData.height) || parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 300)) {
                errors.push('Please enter a valid height (1-300 cm)');
            }
        }
        
        // Validate contact info (basic phone number check)
        if (formData.contact_info && !/^[\d\s\-\+\(\)]+$/.test(formData.contact_info)) {
            errors.push('Please enter a valid contact number');
        }
        
        // Validate birthdate (not in future)
        if (formData.birthdate) {
            const birthDate = new Date(formData.birthdate);
            const today = new Date();
            if (birthDate > today) {
                errors.push('Birthdate cannot be in the future');
            }
        }
        
        return errors;
    };

    // Handle submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrorMessage(validationErrors.join('. '));
            return;
        }
        
        setLoading(true); // Set loading to true when starting registration
        setErrorMessage(''); // Clear any previous error messages
        setResponseMessage(''); // Clear any previous response messages
        setEmailError(''); // Clear any email validation errors

        try {
            // Add image data to the formData object
            const updatedFormData = { ...formData, image: imageBase64, image_type: 'jpeg' };

            // Step 1: Send patient/doctor data
            const baseUrl = `${API_BASE_URL}`;
            const personEndpoint = userType === 'PATIENT' ? '/patient' : '/doctor';

            const personResponse = await fetch(`${baseUrl}${personEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });

            if (!personResponse.ok) {
                const errorResponse = await personResponse.text();
                throw new Error(`Failed to register ${userType.toLowerCase()}: ${errorResponse}`);
            }

            // Get personId from the response
            const personId = parseInt(await personResponse.text(), 10);
            console.log(`${userType} ID received:`, personId);

            // Step 2: Send authentication data
            const authPayload = {
                username,
                password,
                role: userType,
                personId,
            };

            const authResponse = await fetch(`${baseUrl}/user_authentication/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authPayload),
            });

            if (!authResponse.ok) {
                const errorResponse = await authResponse.text();
                throw new Error(`Failed to register user: ${errorResponse}`);
            }

            setResponseMessage(`Registration successful! You are now registered as a ${userType}.`);

            // Redirect to the login page after successful registration
            setTimeout(() => navigate('/'), 2000); // Redirect to login after 2 seconds
        } catch (error) {
            console.error(error.message);
            setErrorMessage(error.message);
        } finally {
            setLoading(false); // Set loading to false when registration completes or fails
        }
    };

    // Reset form and start over
    const handleReset = () => {
        setUserType('');
        setFormData({});
        setImageBase64('');
        setImagePreview('');
        setUsername('');
        setPassword('');
        setResponseMessage('');
        setErrorMessage('');
        setEmailError(''); // Reset email validation error
        setLoading(false); // Reset loading state as well
    };

    return (
        <div className="wrapper">
            {loading && <LoadingSpinner />} {/* Display LoadingSpinner when loading */}
            <div className="container">
                <h1 className="title">Create Your Account</h1>
                {!userType && (
                    <div className="userTypeSelection">
                        <p>Are you registering as a:</p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button onClick={() => setUserType('PATIENT')} className="button">
                                Patient
                            </button>
                            <button onClick={() => setUserType('DOCTOR')} className="button">
                                Doctor
                            </button>
                        </div>
                    </div>
                )}
                {userType && (
                    <form onSubmit={handleSubmit} className="form">
                        <h2>Register as a {userType}</h2>
                        <div className="required-fields-note">
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#666', 
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef'
                            }}>
                                <strong>Note:</strong> All fields marked with * are required. 
                                Please ensure all information is accurate before submitting.
                            </p>
                        </div>
                        
                        <div className="image-upload-container">
                            <div className="file-input-container">
                                <label className="file-input-label">
                                    <i className="fas fa-camera"></i>
                                    Choose Profile Photo
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        required
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                            {imagePreview && (
                                <img 
                                    src={imagePreview} 
                                    alt="Profile Preview" 
                                    className="upload-preview" 
                                />
                            )}
                        </div>

                        {userType === 'PATIENT' && (
                            <div className="form-grid">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    onChange={handleChange}
                                />
                                <select 
                                    name="gender"
                                    required
                                    onChange={handleChange}
                                    style={{
                                        height: '48px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        padding: '0 1rem',
                                        backgroundColor: 'var(--secondary-color)',
                                        boxShadow: 'var(--input-shadow)',
                                        color: 'var(--text-dark)'
                                    }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Age"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="date"
                                    name="birthdate"
                                    placeholder="Birthdate"
                                    max={getTodayDate()}
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="contact_info"
                                    placeholder="Contact Info"
                                    required
                                    onChange={handleContactChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="Weight (kg)"
                                    min="1"
                                    max="500"
                                    step="0.1"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="Height (cm)"
                                    min="1"
                                    max="300"
                                    step="0.1"
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {userType === 'DOCTOR' && (
                            <div className="form-grid">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    onChange={handleChange}
                                />
                                <select 
                                    name="gender"
                                    required
                                    onChange={handleChange}
                                    style={{
                                        height: '48px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        padding: '0 1rem',
                                        backgroundColor: 'var(--secondary-color)',
                                        boxShadow: 'var(--input-shadow)',
                                        color: 'var(--text-dark)'
                                    }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Age"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="date"
                                    name="birthdate"
                                    placeholder="Birthdate"
                                    max={getTodayDate()}
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="contact_info"
                                    placeholder="Contact Info"
                                    required
                                    onChange={handleContactChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="Specialization"
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <h3>Set up your credentials</h3>
                        <div className="email-input-container">
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={username}
                                onChange={handleEmailChange}
                                className={emailError ? 'input-error' : ''}
                                disabled={loading}
                            />
                            {emailError && <p className="email-error-message">{emailError}</p>}
                        </div>
                        <input
                            type="password"
                            placeholder="Password (minimum 6 characters)"
                            required
                            minLength="6"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        {password && password.length < 6 && (
                            <p style={{ 
                                color: '#e74c3c', 
                                fontSize: '14px', 
                                margin: '5px 0' 
                            }}>
                                Password must be at least 6 characters long
                            </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '10px' }}>
                            <button 
                                type="button" 
                                onClick={handleReset} 
                                className="button" 
                                style={{ flex: '1', background: 'linear-gradient(to right, #9ca3a3, #c6cccc)' }}
                                disabled={loading}
                            >
                                Reset
                            </button>
                            <button 
                                type="submit" 
                                className="button" 
                                style={{ flex: '2' }}
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                )}
                {responseMessage && <p className="successMessage">{responseMessage}</p>}
                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                
                <div className="login-link-container">
                    <Link to="/" className="login-link">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;