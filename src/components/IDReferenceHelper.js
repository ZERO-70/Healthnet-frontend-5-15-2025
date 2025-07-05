import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/api';
import '../styles/IDReference.css';

const IDReferenceHelper = ({ isVisible, onClose, onDataFetched }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('patients');
  const [dataFetched, setDataFetched] = useState(false); // Track if data has been sent to parent

  useEffect(() => {
    if (isVisible) {
      fetchData();
    }
  }, [isVisible]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch patient summaries from new endpoint
      console.log('Fetching patient summaries from:', `${API_BASE_URL}/patient/summaries`);
      const patientsResponse = await fetch(`${API_BASE_URL}/patient/summaries`, { headers });
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        console.log('Patient summaries response:', patientsData);
        // Sort patients by ID in ascending order
        const sortedPatients = patientsData.sort((a, b) => a.id - b.id);
        setPatients(sortedPatients);
      } else {
        console.error('Failed to fetch patient summaries:', patientsResponse.status, patientsResponse.statusText);
      }

      // Fetch doctor summaries from new endpoint
      console.log('Fetching doctor summaries from:', `${API_BASE_URL}/doctor/summaries`);
      const doctorsResponse = await fetch(`${API_BASE_URL}/doctor/summaries`, { headers });
      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        console.log('Doctor summaries response:', doctorsData);
        // Sort doctors by ID in ascending order
        const sortedDoctors = doctorsData.sort((a, b) => a.id - b.id);
        setDoctors(sortedDoctors);
      } else {
        console.error('Failed to fetch doctor summaries:', doctorsResponse.status, doctorsResponse.statusText);
      }

      // Fetch department summaries
      console.log('Fetching department summaries from:', `${API_BASE_URL}/department/summaries`);
      const departmentsResponse = await fetch(`${API_BASE_URL}/department/summaries`, { headers });
      if (departmentsResponse.ok) {
        const departmentsData = await departmentsResponse.json();
        console.log('Department summaries response:', departmentsData);
        // Sort departments by ID in ascending order
        const sortedDepartments = departmentsData.sort((a, b) => a.id - b.id);
        setDepartments(sortedDepartments);
      } else {
        console.error('Failed to fetch department summaries:', departmentsResponse.status, departmentsResponse.statusText);
      }

      // Fetch treatment summaries
      console.log('Fetching treatment summaries from:', `${API_BASE_URL}/treatement/summaries`);
      const treatmentsResponse = await fetch(`${API_BASE_URL}/treatement/summaries`, { headers });
      if (treatmentsResponse.ok) {
        const treatmentsData = await treatmentsResponse.json();
        console.log('Treatment summaries response:', treatmentsData);
        // Sort treatments by ID in ascending order
        const sortedTreatments = treatmentsData.sort((a, b) => a.id - b.id);
        setTreatments(sortedTreatments);
      } else {
        console.error('Failed to fetch treatment summaries:', treatmentsResponse.status, treatmentsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notify parent component when data is fetched
  useEffect(() => {
    if ((patients.length > 0 || doctors.length > 0 || departments.length > 0 || treatments.length > 0) && onDataFetched && !dataFetched) {
      onDataFetched({ patients, doctors, departments, treatments });
      setDataFetched(true);
    }
  }, [patients.length, doctors.length, departments.length, treatments.length, dataFetched]); // Only depend on the lengths and dataFetched flag

  if (!isVisible) return null;

  return (
    <div className="id-reference-overlay">
      <div className="id-reference-modal">
        <div className="id-reference-header">
          <h3>ID Reference Guide</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="id-reference-tabs">
          <button 
            className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            Patients
          </button>
          <button 
            className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctors
          </button>
          <button 
            className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`tab-button ${activeTab === 'treatments' ? 'active' : ''}`}
            onClick={() => setActiveTab('treatments')}
          >
            Treatments
          </button>
        </div>

        <div className="id-reference-content">
          {loading ? (
            <div className="loading-message">Loading...</div>
          ) : (
            <>
              {activeTab === 'patients' && (
                <div className="id-list">
                  <h4>Available Patient IDs:</h4>
                  {patients.length === 0 ? (
                    <p>No patients found</p>
                  ) : (
                    <div className="id-grid">
                      {patients.map(patient => (
                        <div key={patient.id} className="id-item">
                          <strong>ID: {patient.id}</strong>
                          <span>{patient.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'doctors' && (
                <div className="id-list">
                  <h4>Available Doctor IDs:</h4>
                  {doctors.length === 0 ? (
                    <p>No doctors found</p>
                  ) : (
                    <div className="id-grid">
                      {doctors.map(doctor => (
                        <div key={doctor.id} className="id-item">
                          <strong>ID: {doctor.id}</strong>
                          <span>{doctor.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'departments' && (
                <div className="id-list">
                  <h4>Available Department IDs:</h4>
                  {departments.length === 0 ? (
                    <p>No departments found</p>
                  ) : (
                    <div className="id-grid">
                      {departments.map(department => (
                        <div key={department.id} className="id-item">
                          <strong>ID: {department.id}</strong>
                          <span>{department.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'treatments' && (
                <div className="id-list">
                  <h4>Available Treatment IDs:</h4>
                  {treatments.length === 0 ? (
                    <p>No treatments found</p>
                  ) : (
                    <div className="id-grid">
                      {treatments.map(treatment => (
                        <div key={treatment.id} className="id-item">
                          <strong>ID: {treatment.id}</strong>
                          <span>{treatment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="id-reference-footer">
          <p><strong>Tip:</strong> You can type either the ID number or part of the name in the form fields above for suggestions.</p>
        </div>
      </div>
    </div>
  );
};

export default IDReferenceHelper;
