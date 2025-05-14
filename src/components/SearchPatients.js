import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/SearchPatients.css';
import '../styles/PatientMedicalRecords.css'; // Import patient medical records styles
import LoadingSpinner from './LoadingSpinner';
import MedicalRecordDetail from './MedicalRecordDetail';
import { useLoading } from '../hooks/useLoading';

function SearchPatients() {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [viewingRecords, setViewingRecords] = useState(false);
    const { loading, withLoading } = useLoading();
    const { loading: recordsLoading, withLoading: withRecordsLoading } = useLoading();

    useEffect(() => {
        // Fetch patients on page load
        fetchAllPatients();
    }, []); // Empty dependency array ensures it runs only once

    useEffect(() => {
        // Filter patients whenever the search query changes
        if (searchQuery) {
            const filtered = patients.filter((patient) =>
                patient.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients); // Reset to all patients if search query is empty
        }
    }, [searchQuery, patients]); // Runs whenever searchQuery or patients changes

    // Scroll to top and disable background scroll when modal is open
    useEffect(() => {
        if (viewingRecords) {
            window.scrollTo(0, 0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [viewingRecords]);

    const fetchAllPatients = async () => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch patients.');
                }

                const data = await response.json();
                setPatients(data);
                setFilteredPatients(data); // Initialize filtered patients
            } catch (error) {
                console.error('Error fetching patients:', error);
                setErrorMessage('Failed to fetch patients.');
            }
        };
        
        withLoading(fetchPatients)();
    };

    const fetchMedicalRecords = async (patientId, patientName) => {
        const getMedicalRecords = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                console.log('Fetching medical records for patient ID:', patientId);
                // Include the patient ID in the URL path to access specific patient records
                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${patientId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch medical records.');
                }

                const data = await response.json();
                console.log('Received medical records data:', data);
                
                // Additional debug logging to understand the data structure
                console.log('Data type:', typeof data);
                console.log('Is array?', Array.isArray(data));
                if (Array.isArray(data)) {
                    console.log('Array length:', data.length);
                    console.log('Sample first record:', data[0]);
                } else if (typeof data === 'object') {
                    console.log('Object keys:', Object.keys(data));
                    // Check if the data might be nested under a property
                    const possibleArrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
                    console.log('Possible array properties:', possibleArrayProps);
                }
                
                // Ensure data is treated as an array, or extract it from the response if it's nested
                let recordsArray = [];
                if (Array.isArray(data)) {
                    recordsArray = data;
                } else if (typeof data === 'object') {
                    // Check if records might be nested under a property
                    for (const key in data) {
                        if (Array.isArray(data[key]) && data[key].length > 0) {
                            recordsArray = data[key];
                            break;
                        }
                    }
                    // If we didn't find an array, but the object itself has expected record properties
                    // it might be a single record, so wrap it
                    if (recordsArray.length === 0 && (data.id || data.record_id || data.recordId)) {
                        recordsArray = [data];
                    }
                }
                
                console.log('Processed records array:', recordsArray);
                
                // Check if recordsArray is empty after processing
                if (!recordsArray || recordsArray.length === 0) {
                    console.log('No medical records found for this patient');
                    setMedicalRecords([]);
                    setSelectedPatient(patientName);
                    setViewingRecords(true);
                    return;
                }
                
                // Normalize the data to ensure consistent property names
                const normalizedRecords = recordsArray.map(record => ({
                    // Standard fields with normalized names
                    recordId: record.recordId || record.record_id || record.id,
                    patientId: record.patientId || record.patient_id,
                    doctorId: record.doctorId || record.doctor_id,
                    departmentId: record.departmentId || record.department_id,
                    treatmentId: record.treatmentId || record.treatement_id,
                    recordType: record.recordType || record.record_type || record.type,
                    title: record.title,
                    diagnosis: record.diagnosis,
                    notes: record.notes,
                    createdAt: record.createdAt || record.created_at,
                    updatedAt: record.updatedAt || record.updated_at,
                    recordDate: record.recordDate || record.record_date || record.date,
                    
                    // Vital signs
                    bloodPressure: record.bloodPressure || record.bloodpressure || record.blood_pressure,
                    heartRate: record.heartRate || record.heart_rate,
                    respiratoryRate: record.respiratoryRate || record.respiratory_rate,
                    temperature: record.temperature,
                    oxygenSaturation: record.oxygenSaturation || record.oxygen_saturation,
                    height: record.height,
                    weight: record.weight,
                    
                    // Arrays
                    attachments: record.attachments || [],
                    labResults: record.labResults || record.lab_results || []
                }));
                
                console.log('Normalized records:', normalizedRecords);
                setMedicalRecords(normalizedRecords);
                setSelectedPatient(patientName); // Set the patient's name for the modal title
                setViewingRecords(true); // Open the modal
            } catch (error) {
                console.error('Error fetching medical records:', error);
                setErrorMessage('Failed to fetch medical records.');
            }
        };
        
        await withRecordsLoading(getMedicalRecords)();
    };

    const closeModal = () => {
        setViewingRecords(false); // Close the modal
        setMedicalRecords([]); // Clear the records
        setSelectedPatient(null); // Clear the selected patient
        setSelectedRecord(null); // Clear the selected record
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="search-patients">
            <h2>Search Patients</h2>
            <input
                type="text"
                placeholder="Enter patient name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                disabled={loading}
            />

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {loading && <LoadingSpinner />}

            {!loading && (
                <div className="patients-list">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <div key={patient.id} className="patient-card">
                                <h3>{patient.name}</h3>
                                <p key={`id-${patient.id}`}>ID: {patient.id}</p>
                                <p key={`age-${patient.id}`}>Age: {patient.age}</p>
                                <p key={`contact-${patient.id}`}>Contact: {patient.contact_info}</p>
                                <button
                                    onClick={() => fetchMedicalRecords(patient.id, patient.name)}
                                    className="view-records-button"
                                    disabled={recordsLoading}
                                >
                                    {recordsLoading ? 'Loading...' : 'View Medical Records'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No patients found.</p>
                    )}
                </div>
            )}

            {/* Modal portal for displaying medical records */}
            {viewingRecords && ReactDOM.createPortal(
                <div className="sp-modal-overlay" onClick={closeModal}>
                    <div className="sp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="sp-close-button" onClick={closeModal}>&times;</span>
                        <h2 className="sp-modal-title">Medical Records: {selectedPatient}</h2>
                        
                        {recordsLoading && <LoadingSpinner />}
                        
                        {!recordsLoading && (
                            <div className="medicalRecords">
                                {selectedRecord ? (
                                    <MedicalRecordDetail 
                                        record={selectedRecord}
                                        userRole="DOCTOR"
                                        onClose={() => setSelectedRecord(null)}
                                    />
                                ) : (
                                    <>
                                        {/* Records list */}
                                        {medicalRecords.length === 0 ? (
                                            <p className="loadingMessage">No medical records found for this patient.</p>
                                        ) : (
                                            <div className="recordsList">
                                                {medicalRecords.map((record) => (
                                                    <div 
                                                        key={record.recordId || record.record_id} 
                                                        className="recordCard"
                                                        onClick={() => setSelectedRecord(record)}
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default SearchPatients;
