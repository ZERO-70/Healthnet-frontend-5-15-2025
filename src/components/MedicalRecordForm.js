import React, { useState } from 'react';
import LabResultsTable from './LabResultsTable';
import AttachmentManager from './AttachmentManager';
import AuditTrailViewer from './AuditTrailViewer';
import '../styles/MedicalRecordForm.css';

const MedicalRecordForm = ({
  record = {},
  userRole = '',
  onCancel,
  onSave,
}) => {  // Function to extract lab results from record object
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

  return (
    <div className="recordFormContainer">
      <h3>{form.recordId ? 'Update Medical Record' : 'New Medical Record'}</h3>
      <form onSubmit={handleSave}>
        <div className="formGrid">
          <label>Record ID<input name="recordId" value={form.recordId} disabled /></label>
          <label>Patient ID<input name="patientId" value={form.patientId} onChange={handleChange} required /></label>
          <label>Doctor ID<input name="doctorId" value={form.doctorId} onChange={handleChange} /></label>
          <label>Department ID<input name="departmentId" value={form.departmentId} onChange={handleChange} /></label>
          <label>Treatment ID<input name="treatmentId" value={form.treatmentId} onChange={handleChange} /></label>
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
    </div>
  );
};

export default MedicalRecordForm;
