import React, { useState, useEffect } from 'react';
import '../styles/PatientMedicalRecords.css';
import LoadingSpinner from './LoadingSpinner';
import MedicalRecordDetail from './MedicalRecordDetail';
import { useLoading } from '../hooks/useLoading';

function PatientMedicalRecords() {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [allMedicalRecords, setAllMedicalRecords] = useState([]); // Store all medical records
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { loading, withLoading } = useLoading();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Get user role from local storage
        const role = localStorage.getItem('userRole') || '';
        setUserRole(role);
        
        // Fetch medical records without relying on patient ID
        withLoading(fetchMedicalRecords)();
    }, [withLoading]); // Added withLoading to the dependency array

    const fetchMedicalRecords = async (start = null, end = null) => {
        try {
            setErrorMessage('');
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            // Use the patient records endpoint (getmine) which will use JWT token for identification
            let baseUrl = 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/patient/records';
            
            // Add date range parameters if specified
            const queryParams = [];
            if (start && end) {
                queryParams.push(`startDate=${start}`);
                queryParams.push(`endDate=${end}`);
            }
            
            const fullUrl = queryParams.length > 0 ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;
            
            console.log('Fetching medical records from:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                console.error('API Error Response:', errorResponse);
                throw new Error(`Failed to fetch medical records: ${errorResponse}`);
            }

            const data = await response.json();
            // Print the medical records to the console as requested
            console.log('Medical records data received:', data);
            
            // Sort records by date (most recent first)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.recordDate || b.record_date || b.date || 0) - new Date(a.recordDate || a.record_date || a.date || 0));
                setMedicalRecords(data);
                setAllMedicalRecords(data); // Store all records
            } else {
                console.error('Expected array but got:', typeof data);
                setMedicalRecords([]);
                setAllMedicalRecords([]); // Clear all records
                setErrorMessage('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
            setErrorMessage(error.message);
        }
    };

    const handleRecordClick = (record) => {
        console.log('Selected record details:', record);
        setSelectedRecord(record);
    };

    const handleCloseDetail = () => {
        setSelectedRecord(null);
    };

    const handleDateFilter = () => {
        if (startDate && endDate) {
            const filteredRecords = allMedicalRecords.filter(record => {
                const recordDate = new Date(record.recordDate || record.record_date || record.date);
                return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
            });
            setMedicalRecords(filteredRecords);
        }
    };

    const resetDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setMedicalRecords(allMedicalRecords); // Reset to all records
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (errorMessage) {
        return (
            <div className="medicalRecords">
                <h2 className="recordsTitle">Medical Records</h2>
                <p className="errorMessage">{errorMessage}</p>
                <button 
                    className="resetButton" 
                    onClick={() => {
                        withLoading(fetchMedicalRecords)();
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="medicalRecords">
            {loading && <LoadingSpinner />}
            
            {!loading && (
                <>
                    <h2 className="recordsTitle">Medical Records</h2>
                    
                    {/* Date filter controls */}
                    <div className="dateFilters">
                        <label>
                            From:
                            <input 
                                type="date" 
                                className="dateInput"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </label>
                        <label>
                            To:
                            <input 
                                type="date" 
                                className="dateInput"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </label>
                        <button className="filterButton" onClick={handleDateFilter}>Filter</button>
                        <button className="resetButton" onClick={resetDateFilter}>Reset</button>
                    </div>
                    
                    {/* Records list */}
                    {medicalRecords.length === 0 ? (
                        <p className="loadingMessage">No medical records found.</p>
                    ) : (
                        <div className="recordsList">
                            {medicalRecords.map((record) => (
                                <div 
                                    key={record.recordId || record.record_id} 
                                    className="recordCard"
                                    onClick={() => handleRecordClick(record)}
                                >
                                    <p><strong>Date:</strong> {formatDate(record.recordDate || record.record_date || record.date)}</p>
                                    <p><strong>Title:</strong> {record.title || 'N/A'}</p>
                                    <p><strong>Type:</strong> {record.recordType || record.record_type || 'N/A'}</p>
                                    <p><strong>Diagnosis:</strong> {record.diagnosis || 'None'}</p>
                                    {(record.bloodPressure || record.blood_pressure) && 
                                        <p><strong>Blood Pressure:</strong> {record.bloodPressure || record.blood_pressure}</p>
                                    }
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Record detail view using the reusable component */}
                    {selectedRecord && (
                        <MedicalRecordDetail 
                            record={selectedRecord}
                            userRole={userRole}
                            onClose={handleCloseDetail}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default PatientMedicalRecords;
