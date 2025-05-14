import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
    const [userType, setUserType] = useState(''); // To track if the user is a patient or doctor
    const [formData, setFormData] = useState({});
    const [imageBase64, setImageBase64] = useState(''); // To store Base64 encoded image
    const [imagePreview, setImagePreview] = useState(''); // For displaying image preview
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate for redirection

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

    // Handle submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Add image data to the formData object
            const updatedFormData = { ...formData, image: imageBase64, image_type: 'jpeg' };

            // Step 1: Send patient/doctor data
            const baseUrl = 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com';
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
    };

    return (
        <div className="wrapper">
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
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="contact_info"
                                    placeholder="Contact Info"
                                    required
                                    onChange={handleChange}
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
                                    name="weight"
                                    placeholder="Weight (kg)"
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="height"
                                    placeholder="Height (cm)"
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
                                    required
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="contact_info"
                                    placeholder="Contact Info"
                                    required
                                    onChange={handleChange}
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
                        <input
                            type="text"
                            placeholder="Username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '10px' }}>
                            <button type="button" onClick={handleReset} className="button" style={{ flex: '1', background: 'linear-gradient(to right, #9ca3a3, #c6cccc)' }}>
                                Reset
                            </button>
                            <button type="submit" className="button" style={{ flex: '2' }}>
                                Complete Registration
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