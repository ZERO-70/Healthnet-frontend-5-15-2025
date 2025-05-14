import React, { useState } from 'react';
import VitalSignsPanel from './VitalSignsPanel';
import LabResultsTable from './LabResultsTable';
import AttachmentManager from './AttachmentManager';
import AuditTrailViewer from './AuditTrailViewer';

function MedicalRecordDetail({ record, userRole = '', onClose }) {
    const [activeTab, setActiveTab] = useState('general');

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Improved helper function to handle property name differences between backend responses
    const getProperty = (obj, propertyNames, defaultValue = '') => {
        for (const prop of propertyNames) {
            if (obj[prop] !== undefined && obj[prop] !== null) {
                return obj[prop];
            }
        }
        return defaultValue;
    };

    // Extract record properties safely considering all potential property names
    const recordId = getProperty(record, ['recordId', 'record_id', 'id']);
    const patientId = getProperty(record, ['patientId', 'patient_id']);
    const doctorId = getProperty(record, ['doctorId', 'doctor_id']);
    const departmentId = getProperty(record, ['departmentId', 'department_id']);
    const treatmentId = getProperty(record, ['treatmentId', 'treatement_id']); // Note the typo in backend 'treatement_id'
    const recordType = getProperty(record, ['recordType', 'record_type', 'type']);
    const title = getProperty(record, ['title']);
    const diagnosis = getProperty(record, ['diagnosis']);
    const notes = getProperty(record, ['notes']);
    const createdAt = getProperty(record, ['createdAt', 'created_at']);
    const updatedAt = getProperty(record, ['updatedAt', 'updated_at']);
    const recordDate = getProperty(record, ['recordDate', 'record_date', 'date']);

    // Extract vital sign properties with consistent naming
    const vitalSigns = {
        bloodPressure: getProperty(record, ['bloodPressure', 'bloodpressure', 'blood_pressure']),
        heartRate: getProperty(record, ['heartRate', 'heart_rate']),
        respiratoryRate: getProperty(record, ['respiratoryRate', 'respiratory_rate']),
        temperature: getProperty(record, ['temperature']),
        oxygenSaturation: getProperty(record, ['oxygenSaturation', 'oxygen_saturation']),
        height: getProperty(record, ['height']),
        weight: getProperty(record, ['weight'])
    };

    // Get attachments and lab results (if available)
    const attachments = record.attachments || [];
    const labResults = record.labResults || record.lab_results || [];

    // Determine if vital signs tab should be available
    const hasVitalSigns = Object.values(vitalSigns).some(value => value);

    return (
        <div className="recordDetailContainer">
            <div className="recordDetailHeader">
                <h3>{title || `Medical Record - ${formatDate(recordDate)}`}</h3>
                <button className="closeButton" onClick={onClose}>&times;</button>
            </div>
            
            {/* Tabbed navigation */}
            <div className="tabsContainer">
                <div className="tabsNav">
                    <button 
                        className={`tabButton ${activeTab === 'general' ? 'active' : ''}`} 
                        onClick={() => handleTabChange('general')}
                    >
                        General
                    </button>
                    {hasVitalSigns && (
                        <button 
                            className={`tabButton ${activeTab === 'vitalSigns' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('vitalSigns')}
                        >
                            Vital Signs
                        </button>
                    )}
                    {labResults.length > 0 && (
                        <button 
                            className={`tabButton ${activeTab === 'labResults' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('labResults')}
                        >
                            Lab Results
                        </button>
                    )}
                    {attachments.length > 0 && (
                        <button 
                            className={`tabButton ${activeTab === 'attachments' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('attachments')}
                        >
                            Attachments
                        </button>
                    )}
                    {/* Show audit trail tab only for doctors and admins */}
                    {(userRole === 'DOCTOR' || userRole === 'ADMIN') && (
                        <button 
                            className={`tabButton ${activeTab === 'auditTrail' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('auditTrail')}
                        >
                            Audit Trail
                        </button>
                    )}
                </div>
                
                {/* General information tab */}
                <div className={`tabContent ${activeTab === 'general' ? 'active' : ''}`}>
                    <h4>General Information</h4>
                    
                    {recordId && <p><strong>Record ID:</strong> {recordId}</p>}
                    {recordType && <p><strong>Record Type:</strong> {recordType}</p>}
                    {patientId && <p><strong>Patient ID:</strong> {patientId}</p>}
                    {doctorId && <p><strong>Doctor ID:</strong> {doctorId}</p>}
                    {departmentId && <p><strong>Department ID:</strong> {departmentId}</p>}
                    {treatmentId && <p><strong>Treatment ID:</strong> {treatmentId}</p>}
                    {createdAt && <p><strong>Created:</strong> {formatDate(createdAt)}</p>}
                    {updatedAt && <p><strong>Last Updated:</strong> {formatDate(updatedAt)}</p>}
                    {recordDate && <p><strong>Record Date:</strong> {formatDate(recordDate)}</p>}
                    
                    <h4>Medical Details</h4>
                    {diagnosis && (
                        <div>
                            <p><strong>Diagnosis:</strong></p>
                            <p>{diagnosis}</p>
                        </div>
                    )}
                    
                    {notes && (
                        <div>
                            <p><strong>Notes:</strong></p>
                            <p>{notes}</p>
                        </div>
                    )}
                </div>
                
                {/* Vital signs tab */}
                <div className={`tabContent ${activeTab === 'vitalSigns' ? 'active' : ''}`}>
                    <h4>Vital Signs</h4>
                    <VitalSignsPanel vitalSigns={vitalSigns} />
                </div>
                
                {/* Lab results tab */}
                <div className={`tabContent ${activeTab === 'labResults' ? 'active' : ''}`}>
                    <h4>Laboratory Results</h4>
                    <LabResultsTable labResults={labResults} />
                </div>
                
                {/* Attachments tab */}
                <div className={`tabContent ${activeTab === 'attachments' ? 'active' : ''}`}>
                    <h4>Attachments</h4>
                    <AttachmentManager attachments={attachments} />
                </div>
                
                {/* Audit trail tab - only visible for doctors and admins */}
                {(userRole === 'DOCTOR' || userRole === 'ADMIN') && (
                    <div className={`tabContent ${activeTab === 'auditTrail' ? 'active' : ''}`}>
                        <h4>Audit Trail</h4>
                        <AuditTrailViewer recordId={recordId} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default MedicalRecordDetail;