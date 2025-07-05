import React, { useState, useCallback } from 'react';
import LabResultsTable from './LabResultsTable';
import AttachmentManager from './AttachmentManager';
import AuditTrailViewer from './AuditTrailViewer';
import IDReferenceHelper from './IDReferenceHelper';
import '../styles/MedicalRecordForm.css';
import '../styles/MedicalRecordFormEnhancements.css';
import { API_BASE_URL } from '../constants/api';
const MedicalRecordForm = ({
  record = {},
  userRole = '',
  onCancel,
  onSave,
  cachedPatients = [],
  cachedDoctors = [],
  cachedDepartments = [],
  cachedTreatments = [],
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [treatmentSuggestions, setTreatmentSuggestions] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false);
  const [showTreatmentSuggestions, setShowTreatmentSuggestions] = useState(false);
  const [showIDReference, setShowIDReference] = useState(false);
  const [cachedData, setCachedData] = useState({ patients: [], doctors: [], departments: [], treatments: [] });

  // Function to validate patient ID using cached data
  const validatePatientId = (patientId) => {
    if (!patientId || patientId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, patientId: '' }));
      return;
    }

    // Use cached data for validation if available
    const dataToUse = cachedPatients.length > 0 ? cachedPatients : cachedData.patients;
    
    if (dataToUse.length > 0) {
      const patient = dataToUse.find(p => p.id.toString() === patientId.toString());
      if (patient) {
        setValidationErrors(prev => ({ ...prev, patientId: '' }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          patientId: `Patient ID ${patientId} does not exist. Please check the available IDs using "View Available IDs".` 
        }));
      }
    } else {
      // Fallback to API call if no cached data
      validatePatientIdAPI(patientId);
    }
  };

  // Function to validate doctor ID using cached data
  const validateDoctorId = (doctorId) => {
    if (!doctorId || doctorId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, doctorId: '' }));
      return;
    }

    // Use cached data for validation if available
    const dataToUse = cachedDoctors.length > 0 ? cachedDoctors : cachedData.doctors;
    
    if (dataToUse.length > 0) {
      const doctor = dataToUse.find(d => d.id.toString() === doctorId.toString());
      if (doctor) {
        setValidationErrors(prev => ({ ...prev, doctorId: '' }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          doctorId: `Doctor ID ${doctorId} does not exist. Please check the available IDs using "View Available IDs".` 
        }));
      }
    } else {
      // Fallback to API call if no cached data
      validateDoctorIdAPI(doctorId);
    }
  };

  // Function to validate department ID using cached data
  const validateDepartmentId = (departmentId) => {
    if (!departmentId || departmentId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, departmentId: '' }));
      return;
    }

    // Use cached data for validation if available
    const dataToUse = cachedDepartments.length > 0 ? cachedDepartments : cachedData.departments;
    
    if (dataToUse.length > 0) {
      const department = dataToUse.find(d => d.id.toString() === departmentId.toString());
      if (department) {
        setValidationErrors(prev => ({ ...prev, departmentId: '' }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          departmentId: `Department ID ${departmentId} does not exist. Please check the available IDs using "View Available IDs".` 
        }));
      }
    } else {
      // Fallback to API call if no cached data
      validateDepartmentIdAPI(departmentId);
    }
  };

  // Function to validate treatment ID using cached data
  const validateTreatmentId = (treatmentId) => {
    if (!treatmentId || treatmentId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, treatmentId: '' }));
      return;
    }

    // Use cached data for validation if available
    const dataToUse = cachedTreatments.length > 0 ? cachedTreatments : cachedData.treatments;
    
    if (dataToUse.length > 0) {
      const treatment = dataToUse.find(t => t.id.toString() === treatmentId.toString());
      if (treatment) {
        setValidationErrors(prev => ({ ...prev, treatmentId: '' }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          treatmentId: `Treatment ID ${treatmentId} does not exist. Please check the available IDs using "View Available IDs".` 
        }));
      }
    } else {
      // Fallback to API call if no cached data
      validateTreatmentIdAPI(treatmentId);
    }
  };

  // Fallback API validation functions (only used when cached data is not available)
  const validatePatientIdAPI = async (patientId) => {
    if (!patientId || patientId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, patientId: '' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, patientId: '' }));
      } else if (response.status === 404) {
        setValidationErrors(prev => ({ 
          ...prev, 
          patientId: `Patient ID ${patientId} does not exist. Please verify the ID.` 
        }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          patientId: 'Unable to verify Patient ID.' 
        }));
      }
    } catch (error) {
      console.error('Error validating patient ID:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        patientId: 'Unable to verify Patient ID.' 
      }));
    }
  };

  // Fallback API validation for doctor ID
  const validateDoctorIdAPI = async (doctorId) => {
    if (!doctorId || doctorId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, doctorId: '' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, doctorId: '' }));
      } else if (response.status === 404) {
        setValidationErrors(prev => ({ 
          ...prev, 
          doctorId: `Doctor ID ${doctorId} does not exist. Please verify the ID.` 
        }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          doctorId: 'Unable to verify Doctor ID.' 
        }));
      }
    } catch (error) {
      console.error('Error validating doctor ID:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        doctorId: 'Unable to verify Doctor ID.' 
      }));
    }
  };

  // Fallback API validation for department ID
  const validateDepartmentIdAPI = async (departmentId) => {
    if (!departmentId || departmentId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, departmentId: '' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/department/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, departmentId: '' }));
      } else if (response.status === 404) {
        setValidationErrors(prev => ({ 
          ...prev, 
          departmentId: `Department ID ${departmentId} does not exist. Please verify the ID.` 
        }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          departmentId: 'Unable to verify Department ID.' 
        }));
      }
    } catch (error) {
      console.error('Error validating department ID:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        departmentId: 'Unable to verify Department ID.' 
      }));
    }
  };

  // Fallback API validation for treatment ID
  const validateTreatmentIdAPI = async (treatmentId) => {
    if (!treatmentId || treatmentId.trim() === '') {
      setValidationErrors(prev => ({ ...prev, treatmentId: '' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/treatement/${treatmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, treatmentId: '' }));
      } else if (response.status === 404) {
        setValidationErrors(prev => ({ 
          ...prev, 
          treatmentId: `Treatment ID ${treatmentId} does not exist. Please verify the ID.` 
        }));
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          treatmentId: 'Unable to verify Treatment ID.' 
        }));
      }
    } catch (error) {
      console.error('Error validating treatment ID:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        treatmentId: 'Unable to verify Treatment ID.' 
      }));
    }
  };

  // Function to search for patients using cached data when available
  const searchPatients = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPatientSuggestions([]);
      setShowPatientSuggestions(false);
      return;
    }

    // Use cached data for search if available
    const dataToUse = cachedPatients.length > 0 ? cachedPatients : cachedData.patients;
    
    if (dataToUse.length > 0) {
      const filtered = dataToUse
        .filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toString().includes(searchTerm)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setPatientSuggestions(filtered);
      setShowPatientSuggestions(filtered.length > 0);
    } else {
      // Fallback to API search
      searchPatientsAPI(searchTerm);
    }
  };

  // Fallback API search for patients
  const searchPatientsAPI = async (searchTerm) => {

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/patient`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const patients = await response.json();
        const filtered = patients
          .filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toString().includes(searchTerm)
          )
          .slice(0, 5); // Limit to 5 suggestions
        setPatientSuggestions(filtered);
        setShowPatientSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // Function to search for doctors using cached data when available
  const searchDoctors = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setDoctorSuggestions([]);
      setShowDoctorSuggestions(false);
      return;
    }

    // Use cached data for search if available
    const dataToUse = cachedDoctors.length > 0 ? cachedDoctors : cachedData.doctors;
    
    if (dataToUse.length > 0) {
      const filtered = dataToUse
        .filter(d => 
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.id.toString().includes(searchTerm)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setDoctorSuggestions(filtered);
      setShowDoctorSuggestions(filtered.length > 0);
    } else {
      // Fallback to API search
      searchDoctorsAPI(searchTerm);
    }
  };

  // Fallback API search for doctors
  const searchDoctorsAPI = async (searchTerm) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const doctors = await response.json();
        const filtered = doctors
          .filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.id.toString().includes(searchTerm)
          )
          .slice(0, 5); // Limit to 5 suggestions
        setDoctorSuggestions(filtered);
        setShowDoctorSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
    }
  };  // Function to extract lab results from record object
  const extractLabResults = (recordObj) => {
    if (!recordObj) return [];
    
    // Try standard property name first
    if (recordObj.labResults && Array.isArray(recordObj.labResults)) {
      return recordObj.labResults;
    }
    
    // Try alternative property names that might contain lab results
    const possibleLabResultKeys = ['labResults', 'lab_results', 'labs', 'testResults', 'tests'];
    
    for (const key of possibleLabResultKeys) {
      if (recordObj[key] && Array.isArray(recordObj[key])) {
        console.log(`Found lab results in '${key}' property:`, recordObj[key]);
        return recordObj[key];
      }
    }
    
    // Check if it's directly in the record object (especially if it's a nested prop in a different API format)
    for (const key in recordObj) {
      if (Array.isArray(recordObj[key]) && recordObj[key].length > 0) {
        const firstItem = recordObj[key][0];
        // If it looks like a lab result (has test name or value properties)
        if (firstItem && (firstItem.testName || firstItem.testValue || firstItem.resultId)) {
          console.log(`Found potential lab results in '${key}' property:`, recordObj[key]);
          return recordObj[key];
        }
      }
    }
    
    console.log('No lab results found in record object');
    return [];
  };

  // Initialize form state with record data, ensuring we properly handle lab results
  const [form, setForm] = useState({
    recordId: record.recordId || '',
    patientId: record.patientId || '',
    doctorId: record.doctorId || '',
    departmentId: record.departmentId || '',
    treatmentId: record.treatmentId || '',
    recordType: record.recordType || '',
    title: record.title || '',
    diagnosis: record.diagnosis || '',
    notes: record.notes || '',
    recordDate: record.recordDate || '',
    // vital signs
    bloodPressure: record.bloodPressure || '',
    heartRate: record.heartRate || '',
    respiratoryRate: record.respiratoryRate || '',
    temperature: record.temperature || '',
    oxygenSaturation: record.oxygenSaturation || '',
    height: record.height || '',
    weight: record.weight || '',
    // attachments & lab results
    attachments: record.attachments || [],
    // Make sure we capture lab results from the record with our helper function
    labResults: extractLabResults(record),
  });
  
  // Log the lab results for debugging and update form if record props change
  React.useEffect(() => {
    console.log('Record received in MedicalRecordForm:', record);
    
    // Update form when record changes (this handles the async loading of the complete record)
    if (record) {
      setForm(prevForm => ({
        ...prevForm,
        recordId: record.recordId || prevForm.recordId,
        patientId: record.patientId || prevForm.patientId,
        doctorId: record.doctorId || prevForm.doctorId,
        departmentId: record.departmentId || prevForm.departmentId,
        treatmentId: record.treatmentId || prevForm.treatmentId,
        recordType: record.recordType || prevForm.recordType,
        title: record.title || prevForm.title,
        diagnosis: record.diagnosis || prevForm.diagnosis,
        notes: record.notes || prevForm.notes,
        recordDate: record.recordDate || prevForm.recordDate,
        bloodPressure: record.bloodPressure || prevForm.bloodPressure,
        heartRate: record.heartRate || prevForm.heartRate,
        respiratoryRate: record.respiratoryRate || prevForm.respiratoryRate,
        temperature: record.temperature || prevForm.temperature,
        oxygenSaturation: record.oxygenSaturation || prevForm.oxygenSaturation,
        height: record.height || prevForm.height,
        weight: record.weight || prevForm.weight,
        attachments: record.attachments || prevForm.attachments,
        labResults: extractLabResults(record).length > 0 ? extractLabResults(record) : prevForm.labResults,
      }));
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for patient and doctor IDs
    if (name === 'patientId') {
      // Debounce validation
      setTimeout(() => validatePatientId(value), 500);
      searchPatients(value);
    } else if (name === 'doctorId') {
      // Debounce validation
      setTimeout(() => validateDoctorId(value), 500);
      searchDoctors(value);
    } else if (name === 'departmentId') {
      // Debounce validation
      setTimeout(() => validateDepartmentId(value), 500);
      searchDepartments(value);
    } else if (name === 'treatmentId') {
      // Debounce validation
      setTimeout(() => validateTreatmentId(value), 500);
      searchTreatments(value);
    }
  };  const handleSave = (e) => {
    e.preventDefault();
    // Ensure the form data is properly formatted before submitting
    const formattedForm = { ...form };
    
    // Convert any numeric strings to actual numbers
    ['heartRate', 'respiratoryRate', 'temperature', 'oxygenSaturation', 'height', 'weight'].forEach(field => {
      if (formattedForm[field] === '') {
        formattedForm[field] = null;
      } else if (formattedForm[field] !== null && formattedForm[field] !== undefined) {
        formattedForm[field] = Number(formattedForm[field]);
      }
    });
    
    // Make sure lab results have numeric IDs to satisfy Java Long type requirement
    if (formattedForm.labResults && Array.isArray(formattedForm.labResults)) {
      formattedForm.labResults = formattedForm.labResults.map(result => {
        // Clone the result to avoid modifying the original
        const processedResult = { ...result };
        
        // Ensure resultId is a number (if string, convert; if missing, generate negative number)
        if (typeof processedResult.resultId === 'string' && processedResult.resultId.startsWith('temp-')) {
          // Convert temporary string ID to negative number
          processedResult.resultId = -Math.floor(Math.random() * 1000000);
        } else if (processedResult.resultId === undefined || processedResult.resultId === null) {
          processedResult.resultId = -Math.floor(Math.random() * 1000000);
        }
        
        return processedResult;
      });
      
      console.log('[DEBUG] Formatted lab results before saving:', formattedForm.labResults);
    }
    
    // Ensure attachments have a fileSize property to satisfy Java backend requirements
    if (formattedForm.attachments && Array.isArray(formattedForm.attachments)) {
      formattedForm.attachments = formattedForm.attachments.map(attachment => {
        // If the attachment doesn't have fileSize, add it
        if (attachment.fileSize === undefined || attachment.fileSize === null) {
          const updatedAttachment = { ...attachment };
          
          // If it has a tempFile (local file object), use its size
          if (updatedAttachment.tempFile && updatedAttachment.tempFile.size) {
            updatedAttachment.fileSize = updatedAttachment.tempFile.size;
          } else {
            // Otherwise use a default size
            updatedAttachment.fileSize = 1024; // Default to 1KB
          }
          
          console.log('[DEBUG] Added fileSize to attachment:', updatedAttachment.fileName, updatedAttachment.fileSize);
          return updatedAttachment;
        }
        return attachment;
      });
      
      console.log('[DEBUG] Formatted attachments before saving:', formattedForm.attachments);
    }
    
    console.log('[DEBUG] Saving medical record with lab results:', formattedForm.labResults);
    console.log('[DEBUG] Saving medical record with attachments:', formattedForm.attachments);
    console.log('[DEBUG] Complete form data being saved:', formattedForm);
    
    onSave(formattedForm);
  };

  // Memoized callback to prevent infinite re-renders
  const handleDataFetched = useCallback((data) => {
    setCachedData(data);
  }, []);

  // Function to search for departments using cached data when available
  const searchDepartments = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setDepartmentSuggestions([]);
      setShowDepartmentSuggestions(false);
      return;
    }

    // Use cached data for search if available
    const dataToUse = cachedDepartments.length > 0 ? cachedDepartments : cachedData.departments;
    
    if (dataToUse.length > 0) {
      const filtered = dataToUse
        .filter(d => 
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.id.toString().includes(searchTerm)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setDepartmentSuggestions(filtered);
      setShowDepartmentSuggestions(filtered.length > 0);
    } else {
      // Fallback to API search
      searchDepartmentsAPI(searchTerm);
    }
  };

  // Fallback API search for departments
  const searchDepartmentsAPI = async (searchTerm) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/department`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const departments = await response.json();
        const filtered = departments
          .filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.department_id.toString().includes(searchTerm)
          )
          .slice(0, 5); // Limit to 5 suggestions
        setDepartmentSuggestions(filtered);
        setShowDepartmentSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching departments:', error);
    }
  };

  // Function to search for treatments using cached data when available
  const searchTreatments = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTreatmentSuggestions([]);
      setShowTreatmentSuggestions(false);
      return;
    }

    // Use cached data for search if available
    const dataToUse = cachedTreatments.length > 0 ? cachedTreatments : cachedData.treatments;
    
    if (dataToUse.length > 0) {
      const filtered = dataToUse
        .filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toString().includes(searchTerm)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setTreatmentSuggestions(filtered);
      setShowTreatmentSuggestions(filtered.length > 0);
    } else {
      // Fallback to API search
      searchTreatmentsAPI(searchTerm);
    }
  };

  // Fallback API search for treatments
  const searchTreatmentsAPI = async (searchTerm) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/treatement`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const treatments = await response.json();
        const filtered = treatments
          .filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.treatement_id.toString().includes(searchTerm)
          )
          .slice(0, 5); // Limit to 5 suggestions
        setTreatmentSuggestions(filtered);
        setShowTreatmentSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching treatments:', error);
    }
  };

  return (
    <div className="recordFormContainer">
      <div className="form-header">
        <h3>{form.recordId ? 'Update Medical Record' : 'New Medical Record'}</h3>
        <button 
          type="button" 
          className="id-reference-button"
          onClick={() => setShowIDReference(true)}
        >
          📋 View Available IDs
        </button>
      </div>
      
      <form onSubmit={handleSave}>
        <div className="formGrid">
          <label>Record ID<input name="recordId" value={form.recordId} disabled /></label>
          
          <div className="form-field-wrapper">
            <label>Patient ID *
              <input 
                name="patientId" 
                value={form.patientId} 
                onChange={handleChange} 
                required 
                className={validationErrors.patientId ? 'error' : ''}
                placeholder="Enter Patient ID or search by name"
              />
              {validationErrors.patientId && (
                <div className="validation-error">{validationErrors.patientId}</div>
              )}
              {showPatientSuggestions && (
                <div className="suggestions-dropdown">
                  {patientSuggestions.map(patient => (
                    <div 
                      key={patient.id} 
                      className="suggestion-item"
                      onClick={() => {
                        setForm(prev => ({ ...prev, patientId: patient.id.toString() }));
                        setShowPatientSuggestions(false);
                        validatePatientId(patient.id.toString());
                      }}
                    >
                      ID: {patient.id} - {patient.name}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          
          <div className="form-field-wrapper">
            <label>Doctor ID
              <input 
                name="doctorId" 
                value={form.doctorId} 
                onChange={handleChange}
                className={validationErrors.doctorId ? 'error' : ''}
                placeholder="Enter Doctor ID or search by name (optional)"
              />
              {validationErrors.doctorId && (
                <div className="validation-error">{validationErrors.doctorId}</div>
              )}
              {showDoctorSuggestions && (
                <div className="suggestions-dropdown">
                  {doctorSuggestions.map(doctor => (
                    <div 
                      key={doctor.id} 
                      className="suggestion-item"
                      onClick={() => {
                        setForm(prev => ({ ...prev, doctorId: doctor.id.toString() }));
                        setShowDoctorSuggestions(false);
                        validateDoctorId(doctor.id.toString());
                      }}
                    >
                      ID: {doctor.id} - {doctor.name} ({doctor.specialization})
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          
          <div className="form-field-wrapper">
            <label>Department ID
              <input 
                name="departmentId" 
                value={form.departmentId} 
                onChange={handleChange}
                className={validationErrors.departmentId ? 'error' : ''}
                placeholder="Enter Department ID or search by name (optional)"
              />
              {validationErrors.departmentId && (
                <div className="validation-error">{validationErrors.departmentId}</div>
              )}
              {showDepartmentSuggestions && (
                <div className="suggestions-dropdown">
                  {departmentSuggestions.map(department => (
                    <div 
                      key={department.id || department.department_id} 
                      className="suggestion-item"
                      onClick={() => {
                        const deptId = department.id || department.department_id;
                        setForm(prev => ({ ...prev, departmentId: deptId.toString() }));
                        setShowDepartmentSuggestions(false);
                        validateDepartmentId(deptId.toString());
                      }}
                    >
                      ID: {department.id || department.department_id} - {department.name}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          
          <div className="form-field-wrapper">
            <label>Treatment ID
              <input 
                name="treatmentId" 
                value={form.treatmentId} 
                onChange={handleChange}
                className={validationErrors.treatmentId ? 'error' : ''}
                placeholder="Enter Treatment ID or search by name (optional)"
              />
              {validationErrors.treatmentId && (
                <div className="validation-error">{validationErrors.treatmentId}</div>
              )}
              {showTreatmentSuggestions && (
                <div className="suggestions-dropdown">
                  {treatmentSuggestions.map(treatment => (
                    <div 
                      key={treatment.id || treatment.treatement_id} 
                      className="suggestion-item"
                      onClick={() => {
                        const treatmentIdVal = treatment.id || treatment.treatement_id;
                        setForm(prev => ({ ...prev, treatmentId: treatmentIdVal.toString() }));
                        setShowTreatmentSuggestions(false);
                        validateTreatmentId(treatmentIdVal.toString());
                      }}
                    >
                      ID: {treatment.id || treatment.treatement_id} - {treatment.name}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          <label>Record Type<select name="recordType" value={form.recordType} onChange={handleChange} required>
            <option value="">Select...</option>
            <option value="CONSULTATION">Consultation</option>
            <option value="ADMISSION">Admission</option>
            <option value="SURGERY">Surgery</option>
          </select></label>
          <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
          <label>Diagnosis<textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} /></label>
          <label>Notes<textarea name="notes" value={form.notes} onChange={handleChange} /></label>
          <label>Record Date<input type="date" name="recordDate" value={form.recordDate} onChange={handleChange} required /></label>
        </div>

        <h4>Vital Signs</h4>
        <div className="formGrid">
          <label>Blood Pressure<input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} /></label>
          <label>Heart Rate<input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} /></label>
          <label>Respiratory Rate<input type="number" name="respiratoryRate" value={form.respiratoryRate} onChange={handleChange} /></label>
          <label>Temperature<input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} /></label>
          <label>Oxygen Saturation<input type="number" name="oxygenSaturation" value={form.oxygenSaturation} onChange={handleChange} /></label>
          <label>Height (cm)<input type="number" step="0.1" name="height" value={form.height} onChange={handleChange} /></label>
          <label>Weight (kg)<input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} /></label>
        </div>

        {/* Only show Lab Results and Attachments when editing an existing record */}
        {form.recordId ? (
          <>
            <h4>Lab Results</h4>
            <LabResultsTable 
              editable 
              labResults={form.labResults}
              recordId={form.recordId} 
              onChange={(labResults) => {
                console.log('[DEBUG] Lab results changed in MedicalRecordForm:', labResults);
                setForm(prev => ({ ...prev, labResults }));
              }} 
            />

            <h4>Attachments</h4>
            <AttachmentManager editable attachments={form.attachments} onChange={(attachments) => setForm(prev => ({ ...prev, attachments }))} />
          </>
        ) : (
          <div className="disabled-sections-notice">
            <h4>Lab Results & Attachments</h4>
            <p className="info-message">
              <strong>Note:</strong> Lab results and attachments can be added after saving the medical record for the first time. 
              Please fill in the basic information above and click "Save" to continue.
            </p>
          </div>
        )}

        {(userRole === 'DOCTOR' || userRole === 'ADMIN') && (
          <>
            <h4>Audit Trail</h4>
            <AuditTrailViewer recordId={form.recordId} readonly />
          </>
        )}

        <div className="formActions">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
      
      <IDReferenceHelper 
        isVisible={showIDReference}
        onClose={() => setShowIDReference(false)}
        onDataFetched={handleDataFetched}
      />
    </div>
  );
};

export default MedicalRecordForm;
