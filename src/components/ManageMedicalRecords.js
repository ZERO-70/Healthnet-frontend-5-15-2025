import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDatabase, FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiAlertCircle, FiCheck, FiRefreshCw } from 'react-icons/fi';
import '../styles/ManageMedicalRecords.css';
import '../styles/StaffComponents.css';
import LoadingSpinner from './LoadingSpinner';
import MedicalRecordForm from './MedicalRecordForm';

function ManageMedicalRecords() {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [treatments, setTreatments] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [newRecord, setNewRecord] = useState({
        patientId: '',
        doctorId: '',
        departmentId: '',
        treatmentId: '',
        recordType: '',
        title: '',
        diagnosis: '',
        notes: '',
        recordDate: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        oxygenSaturation: '',
        height: '',
        weight: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Animation variants - memoized to prevent recreating on every render
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    }), []);

    const itemVariants = useMemo(() => ({
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
    }), []);

    const fetchMedicalRecords = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`Failed to fetch medical records: ${errorResponse}`);
            }

            const records = await response.json();
            
            // Check if records is an array
            if (!Array.isArray(records)) {
                console.error('Expected an array of records but got:', typeof records);
                setErrorMessage('Received invalid data format from server');
                setMedicalRecords([]);
                setFilteredRecords([]);
                return [];
            }
            
            setMedicalRecords(records);
            setFilteredRecords(records);
            return records;
        } catch (error) {
            console.error('Error fetching medical records:', error);
            setErrorMessage(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTreatments = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/treatement', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch treatments.');
            }

            const data = await response.json();
            setTreatments(data);
            return data;
        } catch (error) {
            console.error('Error fetching treatments:', error);
            setErrorMessage(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch departments.');
            }

            const data = await response.json();
            setDepartments(data);
            return data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            setErrorMessage(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(''); // Clear any previous errors
            
            // Fetch data sequentially to avoid concurrent requests
            try {
                await fetchDepartments();
            } catch (e) {
                console.error('Error fetching departments:', e);
                // Continue loading other data even if departments fail
            }
            
            try {
                await fetchTreatments();
            } catch (e) {
                console.error('Error fetching treatments:', e);
                // Continue loading other data even if treatments fail
            }
            
            // Medical records are most important, so we'll throw if they fail
            await fetchMedicalRecords();
            
            setInitialDataLoaded(true);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setErrorMessage(`Failed to load medical records data: ${error.message}. Please try refreshing the page.`);
        } finally {
            setLoading(false);
        }
    }, [fetchDepartments, fetchTreatments, fetchMedicalRecords]);

    // Use effect to load data only once
    useEffect(() => {
        if (!initialDataLoaded) {
            loadInitialData();
        }
    }, [initialDataLoaded, loadInitialData]);

    // Create a memoized filtered records value
    const handleSearch = useCallback((e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = medicalRecords.filter((record) => {
            const patientIdMatch = record.patientId && record.patientId.toString().includes(term);
            const titleMatch = record.title && record.title.toLowerCase().includes(term);
            return patientIdMatch || titleMatch;
        });

        setFilteredRecords(filtered);
    }, [medicalRecords]);

    // Field changes are now handled by MedicalRecordForm component

    const handleCreateSubmit = async (formData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }
            
            // Validate patient ID is not empty
            if (!formData.patientId || formData.patientId.trim() === '') {
                throw new Error('Patient ID is required');
            }
            
            // Make a clean copy of the data for sending to API
            const recordData = {
                patientId: formData.patientId,
                doctorId: formData.doctorId || '',
                departmentId: formData.departmentId || '',
                treatmentId: formData.treatmentId || '',
                recordType: formData.recordType || '',
                title: formData.title,
                diagnosis: formData.diagnosis || '',
                notes: formData.notes || '',
                recordDate: formData.recordDate,
                bloodPressure: formData.bloodPressure || '',
                heartRate: formData.heartRate || null,
                respiratoryRate: formData.respiratoryRate || null,
                temperature: formData.temperature || null,
                oxygenSaturation: formData.oxygenSaturation || null,
                height: formData.height || null,
                weight: formData.weight || null
            };
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to create medical record: ${response.status} ${response.statusText}`);
            }

            // Reset the form
            setNewRecord({
                patientId: '',
                doctorId: '',
                departmentId: '',
                treatmentId: '',
                recordType: '',
                title: '',
                diagnosis: '',
                notes: '',
                recordDate: '',
                bloodPressure: '',
                heartRate: '',
                respiratoryRate: '',
                temperature: '',
                oxygenSaturation: '',
                height: '',
                weight: ''
            });
            setIsCreateMode(false);
            setSuccessMessage('Medical record created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
            setErrorMessage(''); // Clear any previous error message
            await fetchMedicalRecords(); // Refresh the list
        } catch (error) {
            console.error('Error creating medical record:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!recordId) {
            setErrorMessage('Cannot delete record: Record ID is missing');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }
                
                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${recordId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`Failed to delete medical record: ${response.status} ${response.statusText}`);
                }

                setSuccessMessage('Medical record deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
                await fetchMedicalRecords(); // Refresh the list
            } catch (error) {
                console.error('Error deleting medical record:', error);
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateSubmit = async (formData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            if (!formData || !formData.recordId) {
                throw new Error('Invalid record selected for update');
            }
            
            // Ensure required fields are present
            if (!formData.patientId || !formData.recordDate || !formData.title) {
                throw new Error('Patient ID, Record Date, and Title are required fields');
            }

            // Process attachments to ensure proper format and required fields
            let processedAttachments = [];
            if (formData.attachments && Array.isArray(formData.attachments)) {
                processedAttachments = formData.attachments.map(attachment => {
                    // If attachment doesn't have fileSize, add it
                    if (attachment.fileSize === undefined || attachment.fileSize === null) {
                        // For temporary attachments that have the file object
                        if (attachment.tempFile && attachment.tempFile.size) {
                            return {
                                ...attachment,
                                fileSize: attachment.tempFile.size // Use the actual file size
                            };
                        } else {
                            // For existing attachments without fileSize, set a default
                            return {
                                ...attachment,
                                fileSize: 1024 // Set a default size of 1KB
                            };
                        }
                    }
                    return attachment;
                });
            }

            // Make a clean copy of the data for sending to API
            const recordData = {
                recordId: formData.recordId,
                patientId: formData.patientId,
                doctorId: formData.doctorId || '',
                departmentId: formData.departmentId || '',
                treatmentId: formData.treatmentId || '',
                recordType: formData.recordType || '',
                title: formData.title,
                diagnosis: formData.diagnosis || '',
                notes: formData.notes || '',
                recordDate: formData.recordDate,
                bloodPressure: formData.bloodPressure || '',
                heartRate: formData.heartRate || null,
                respiratoryRate: formData.respiratoryRate || null,
                temperature: formData.temperature || null,
                oxygenSaturation: formData.oxygenSaturation || null,
                height: formData.height || null,
                weight: formData.weight || null,
                // Include lab results and attachments from the form
                labResults: formData.labResults || [],
                attachments: processedAttachments
            };

            // DEBUG: Log lab results data being sent
            console.log('Updating medical record with ID:', formData.recordId);
            console.log('Lab results being sent in request:', formData.labResults);
            console.log('Full request payload:', JSON.stringify(recordData, null, 2));

            const response = await fetch(
                `https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${formData.recordId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(recordData),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to update medical record: ${response.status} ${response.statusText}`);
            }

            setSelectedRecord(null);
            setSuccessMessage('Medical record updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
            await fetchMedicalRecords(); // Refresh the list
        } catch (error) {
            console.error('Error updating medical record:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Field changes are now handled by MedicalRecordForm component

    const getDepartmentName = (departmentId) => {
        if (!departmentId) return 'Not Assigned';
        const department = departments.find((d) => d.id === departmentId);
        return department ? department.name : 'Unknown Department';
    };

    const getTreatmentName = (treatmentId) => {
        if (!treatmentId) return 'Not Assigned';
        const treatment = treatments.find((t) => t.treatement_id === treatmentId);
        return treatment ? treatment.name : 'Unknown Treatment';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditRecord = async (record) => {
        try {
            setLoading(true);
            setErrorMessage('');
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }
            
            console.log('Fetching complete record for editing, record ID:', record.recordId);
            
            // Fetch the complete record with lab results from the server
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${record.recordId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch complete record details: ${response.status} ${response.statusText}`);
            }

            const completeRecord = await response.json();
            console.log('Complete record fetched for editing:', completeRecord);
            
            // Check if lab results are included in the response
            if (completeRecord.labResults) {
                console.log('[DEBUG] Lab results found in record:', completeRecord.labResults);
            } else {
                console.warn('[DEBUG] No lab results found in the fetched record');
                
                // Check if lab results are nested in another field
                const keys = Object.keys(completeRecord);
                console.log('[DEBUG] Available fields in record:', keys);
                
                // Some APIs might include lab results under a different field name
                // Let's check if any field might contain lab results
                for (const key of keys) {
                    if (Array.isArray(completeRecord[key]) && completeRecord[key].length > 0) {
                        const item = completeRecord[key][0];
                        if (item && (item.testName || item.testValue || item.resultId)) {
                            console.log('[DEBUG] Potential lab results found in field:', key, completeRecord[key]);
                            completeRecord.labResults = completeRecord[key];
                            break;
                        }
                    }
                }
            }
            
            // Initialize labResults as empty array if not present
            if (!completeRecord.labResults) {
                console.log('[DEBUG] Initializing empty lab results array');
                completeRecord.labResults = [];
            }
            
            console.log('[DEBUG] Final record with lab results before setting to state:', completeRecord);
            
            // Set the selected record with complete data including lab results
            setSelectedRecord(completeRecord);
        } catch (error) {
            console.error('Error fetching complete record for editing:', error);
            setErrorMessage(error.message);
            
            // Fallback to using the record from the list if fetching complete record fails
            setSelectedRecord(record);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setErrorMessage(''); // Clear any previous errors
        try {
            await loadInitialData();
            setSuccessMessage('Data refreshed successfully!');
            setTimeout(() => setSuccessMessage(''), 2000); // Clear success message after 2 seconds
        } catch (error) {
            console.error('Error refreshing data:', error);
            setErrorMessage(`Error refreshing data: ${error.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <motion.div 
            className="component-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {loading && <LoadingSpinner />}
            
            <motion.div className="component-header" variants={itemVariants}>
                <h2>Medical Records Management</h2>
                <p className="component-subtitle">View, create, and manage patient medical records</p>
            </motion.div>

            <AnimatePresence>
                {errorMessage && (
                    <motion.div 
                        className="error-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <FiAlertCircle className="error-icon" />
                        <p className="error-message">{errorMessage}</p>
                        <button 
                            className="table-icon-button" 
                            onClick={() => setErrorMessage('')}
                            aria-label="Close error message"
                        >
                            <FiX />
                        </button>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div 
                        className="success-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <FiCheck className="success-icon" />
                        <p className="success-message">{successMessage}</p>
                        <button 
                            className="table-icon-button" 
                            onClick={() => setSuccessMessage('')}
                            aria-label="Close success message"
                        >
                            <FiX />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isCreateMode && !selectedRecord && initialDataLoaded && (
                <motion.div variants={itemVariants}>
                    <div className="search-filter-container">
                        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                            <input
                                type="text"
                                placeholder="Search by Patient ID or Title"
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                        <motion.button 
                            className="action-button"
                            onClick={() => {
                                setIsCreateMode(true);
                                setNewRecord({
                                    patientId: '',
                                    doctorId: '',
                                    departmentId: '',
                                    treatmentId: '',
                                    recordType: '',
                                    title: '',
                                    diagnosis: '',
                                    notes: '',
                                    recordDate: new Date().toISOString().split('T')[0],
                                    bloodPressure: '',
                                    heartRate: '',
                                    respiratoryRate: '',
                                    temperature: '',
                                    oxygenSaturation: '',
                                    height: '',
                                    weight: '',
                                    attachments: [],
                                    labResults: []
                                });
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiPlus className="button-icon" /> Add Record
                        </motion.button>
                        <motion.button 
                            className="action-button secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            whileHover={!refreshing ? { scale: 1.05 } : {}}
                            whileTap={!refreshing ? { scale: 0.95 } : {}}
                        >
                            <FiRefreshCw className={`button-icon ${refreshing ? 'icon-spin' : ''}`} /> 
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </motion.button>
                    </div>

                    {filteredRecords.length === 0 ? (
                        <motion.div className="empty-state" variants={itemVariants}>
                            <FiDatabase className="empty-state-icon" />
                            <p className="empty-state-text">No medical records found. Create a new record or try a different search.</p>
                        </motion.div>
                    ) : (
                        <motion.div className="table-container" variants={itemVariants}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Record ID</th>
                                        <th>Type</th>
                                        <th>Title</th>
                                        <th>Patient ID</th>
                                        <th>Department</th>
                                        <th>Treatment</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <motion.tr 
                                            key={record.recordId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td>{record.recordId}</td>
                                            <td>{record.recordType || 'N/A'}</td>
                                            <td>{record.title || 'N/A'}</td>
                                            <td>{record.patientId}</td>
                                            <td>{getDepartmentName(record.departmentId)}</td>
                                            <td>{getTreatmentName(record.treatmentId)}</td>
                                            <td>{formatDate(record.recordDate)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <motion.button 
                                                        className="table-icon-button edit"
                                                        onClick={() => handleEditRecord(record)}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FiEdit />
                                                    </motion.button>
                                                    <motion.button 
                                                        className="table-icon-button delete"
                                                        onClick={() => handleDelete(record.recordId)}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FiTrash2 />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {isCreateMode && (
                <motion.div 
                    className="form-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <MedicalRecordForm
                        record={newRecord}
                        userRole={localStorage.getItem('userRole') || ''}
                        onCancel={() => setIsCreateMode(false)}
                        onSave={(formData) => {
                            handleCreateSubmit(formData);
                        }}
                    />
                </motion.div>
            )}

            {selectedRecord && (
                <motion.div 
                    className="form-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <MedicalRecordForm
                        record={selectedRecord}
                        userRole={localStorage.getItem('userRole') || ''}
                        onCancel={() => setSelectedRecord(null)}
                        onSave={(formData) => {
                            handleUpdateSubmit(formData);
                        }}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}

export default ManageMedicalRecords;
