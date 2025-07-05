import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/api';
import '../styles/IDReference.css';

const IDReferenceHelper = ({ isVisible, onClose, onDataFetched }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notify parent component when data is fetched
  useEffect(() => {
    if ((patients.length > 0 || doctors.length > 0) && onDataFetched && !dataFetched) {
      onDataFetched({ patients, doctors });
      setDataFetched(true);
    }
  }, [patients.length, doctors.length, dataFetched]); // Only depend on the lengths and dataFetched flag

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
