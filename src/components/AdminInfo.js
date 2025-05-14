import React, { useEffect, useState } from 'react';
import { useLoading } from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';
import '../styles/AdminInfo.css'; // CSS for AdminInfo component

/**
 * AdminInfo fetches and displays the current admin's profile information.
 *
 * Fetches data from the /getmine endpoint using the stored auth token.
 * Shows a loading message, error message, or the admin's info.
 *
 * Usage:
 *   <AdminInfo />
 *
 * Styles: AdminInfo.css
 */
function AdminInfo() {
    const [adminData, setAdminData] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();

    // fetch function separated to wrap with loading
    const fetchAdminInfo = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication token is missing. Please log in again.');
        const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/persons/getmine`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorResponse = await response.text();
            throw new Error(`Error fetching admin info: ${errorResponse}`);
        }
        const data = await response.json();
        setAdminData(data);
        if (data.id) localStorage.setItem('adminId', data.id);
    };

    useEffect(() => {
        withLoading(fetchAdminInfo, e => setErrorMessage(e.message))();
    }, [withLoading]);

    if (loading) return <LoadingSpinner />;
    if (errorMessage) return <p className="errorMessage">{errorMessage}</p>;
    if (!adminData || Object.keys(adminData).length === 0) return <LoadingSpinner />;

    return (
        <div className="adminInfo">
            <h2 className="infoTitle">Your Information</h2>
            <div className="imageContainer">
                {adminData.image && adminData.image_type ? (
                    <img
                        src={`data:${adminData.image_type};base64,${adminData.image}`}
                        alt="Admin"
                        className="profileImage"
                    />
                ) : (
                    <div className="placeholderCircle">
                        <p className="placeholderText">No Image</p>
                    </div>
                )}
            </div>
            <div className="infoGrid">
                <div className="infoItem">
                    <strong>Name:</strong> {adminData.name || 'N/A'}
                </div>
                <div className="infoItem">
                    <strong>Age:</strong> {adminData.age || 'N/A'}
                </div>
                <div className="infoItem">
                    <strong>Gender:</strong> {adminData.gender || 'N/A'}
                </div>
                <div className="infoItem">
                    <strong>Birthdate:</strong> {adminData.birthdate || 'N/A'}
                </div>
                <div className="infoItem">
                    <strong>Contact Info:</strong> {adminData.contact_info || 'N/A'}
                </div>
                <div className="infoItem">
                    <strong>Address:</strong> {adminData.address || 'N/A'}
                </div>
            </div>
        </div>
    );
}

export default AdminInfo;
