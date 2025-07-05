import React, { useState, useEffect } from 'react';
import '../styles/FindPatients.css';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';
import { API_BASE_URL } from '../constants/api';

function FindPatientsOptimized() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();
    const { loading: searchLoading, withLoading: withSearchLoading } = useLoading();

    const fetchPatientsOptimized = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/patient/with-details`, {
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
            console.log('Optimized patient data received:', data);
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setErrorMessage(error.message);
            setFilteredPatients([]);
        }
    };

    const fetchPatientByIdOptimized = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            // For single patient lookup, we can still use the optimized endpoint and filter client-side
            // or create a separate endpoint if needed, but for now let's use the regular endpoint
            const response = await fetch(`${API_BASE_URL}/patient/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Patient not found.');
            }

            const patient = await response.json();
            // Transform regular patient to match optimized structure for consistency
            const transformedPatient = {
                patient_id: patient.id,
                name: patient.name,
                gender: patient.gender,
                age: patient.age,
                contact_info: patient.contact_info,
                address: patient.address,
                weight: patient.weight,
                height: patient.height,
                // Default values for additional fields
                total_appointments: 0,
                pending_appointments: 0,
                approved_appointments: 0,
                total_medical_records: 0,
                last_appointment_date: null,
                last_record_date: null,
                last_diagnosis: null
            };
            setFilteredPatients([transformedPatient]);
        } catch (error) {
            console.error('Error fetching patient by ID:', error);
            setErrorMessage(error.message);
            setFilteredPatients([]);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        // Filter by name dynamically while typing
        if (isNaN(term)) {
            const filtered = patients.filter((patient) =>
                patient.name?.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredPatients(filtered);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // If a number is entered, fetch the specific patient by ID
            if (!isNaN(searchTerm) && searchTerm.trim() !== '') {
                withSearchLoading(fetchPatientByIdOptimized)(searchTerm.trim());
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    useEffect(() => {
        withLoading(fetchPatientsOptimized)();
    }, [withLoading]);

    return (
        <div className="findPatient">
            <h2 className="findPatientTitle">Find Patient (Optimized)</h2>
            <p className="optimization-info">
                <strong>⚡ Performance Optimized:</strong> Loading all patient data in a single query for faster performance.
            </p>
            
            <input
                type="text"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                className="searchBar"
                disabled={loading || searchLoading}
            />
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            
            {(loading || searchLoading) && <LoadingSpinner />}
            
            {!loading && !searchLoading && (
                <div className="patientGrid">
                    {filteredPatients.length === 0 ? (
                        <p className="noResults">No patients found</p>
                    ) : (
                        filteredPatients.map((patient) => (
                            <div key={patient.patient_id} className="patientCard enhanced">
                                <div className="patient-header">
                                    <h3>Patient ID: {patient.patient_id}</h3>
                                    <span className="patient-status">
                                        {patient.pending_appointments > 0 ? 'Has Pending' : 'Active'}
                                    </span>
                                </div>
                                
                                <div className="patient-basic-info">
                                    <p><strong>Name:</strong> {patient.name}</p>
                                    <p><strong>Age:</strong> {patient.age}</p>
                                    <p><strong>Gender:</strong> {patient.gender}</p>
                                    <p><strong>Weight:</strong> {patient.weight}</p>
                                    <p><strong>Height:</strong> {patient.height}</p>
                                    <p><strong>Contact Info:</strong> {patient.contact_info}</p>
                                    {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
                                </div>

                                <div className="patient-stats">
                                    <div className="stat-group">
                                        <h4>Appointments</h4>
                                        <div className="stats-row">
                                            <span className="stat-item">
                                                <strong>Total:</strong> {patient.total_appointments || 0}
                                            </span>
                                            <span className="stat-item pending">
                                                <strong>Pending:</strong> {patient.pending_appointments || 0}
                                            </span>
                                            <span className="stat-item approved">
                                                <strong>Approved:</strong> {patient.approved_appointments || 0}
                                            </span>
                                        </div>
                                        {patient.last_appointment_date && (
                                            <p><strong>Last Appointment:</strong> {formatDate(patient.last_appointment_date)}</p>
                                        )}
                                    </div>

                                    <div className="stat-group">
                                        <h4>Medical Records</h4>
                                        <p><strong>Total Records:</strong> {patient.total_medical_records || 0}</p>
                                        {patient.last_record_date && (
                                            <p><strong>Last Record:</strong> {formatDate(patient.last_record_date)}</p>
                                        )}
                                        {patient.last_diagnosis && (
                                            <p><strong>Last Diagnosis:</strong> {patient.last_diagnosis}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional info if available */}
                                {(patient.emergency_contact || patient.allergies || patient.existing_conditions) && (
                                    <div className="patient-additional-info">
                                        <h4>Additional Information</h4>
                                        {patient.emergency_contact && (
                                            <p><strong>Emergency Contact:</strong> {patient.emergency_contact}</p>
                                        )}
                                        {patient.allergies && (
                                            <p><strong>Allergies:</strong> {patient.allergies}</p>
                                        )}
                                        {patient.existing_conditions && (
                                            <p><strong>Existing Conditions:</strong> {patient.existing_conditions}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default FindPatientsOptimized;
