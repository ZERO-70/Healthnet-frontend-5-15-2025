import React from 'react';
import '../styles/LabResultsTable.css';

function LabResultsTable({ labResults, editable = false, onChange, recordId }) {    // Debug logging to check the lab results received
    React.useEffect(() => {
        console.log('LabResultsTable received labResults:', labResults);
        console.log('LabResultsTable received recordId:', recordId);
        
        if (labResults && labResults.length > 0) {
            // Check the structure of the first lab result to identify property names
            const firstResult = labResults[0];
            console.log('First lab result structure:', Object.keys(firstResult));
            
            // Try to identify the key properties needed for rendering
            const idField = firstResult.resultId !== undefined ? 'resultId' : 
                          firstResult.id !== undefined ? 'id' :
                          firstResult.labResultId !== undefined ? 'labResultId' : null;
            
            const nameField = firstResult.testName !== undefined ? 'testName' :
                           firstResult.name !== undefined ? 'name' : 
                           firstResult.test !== undefined ? 'test' : null;
                           
            const valueField = firstResult.testValue !== undefined ? 'testValue' :
                            firstResult.value !== undefined ? 'value' :
                            firstResult.result !== undefined ? 'result' : null;
                            
            console.log('Detected field mappings:', { idField, nameField, valueField });
        }
    }, [labResults]);

    const [newResult, setNewResult] = React.useState({
        testName: '',
        testValue: '',
        testUnit: '',
        referenceRange: '',
        notes: '',
        isAbnormal: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewResult(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddResult = () => {
        if (!editable || !newResult.testName || !newResult.testValue) return;
        
        // Try to get the recordId from props first, if not available, try to find in existing lab results
        let currentRecordId = recordId;
        if (!currentRecordId && labResults && labResults.length > 0) {
            // Look for recordId in existing lab results
            for (const result of labResults) {
                if (result.recordId) {
                    currentRecordId = result.recordId;
                    console.log('[DEBUG] Found recordId in existing lab results:', currentRecordId);
                    break;
                }
            }
        }
          // Generate a temporary ID as a negative number
        // This ensures it won't conflict with real IDs from the server (which are positive)
        // and satisfies the Java Long type requirement
        const temporaryId = -Math.floor(Math.random() * 1000000);
        
        const updatedResults = [
            ...(labResults || []),
            {
                resultId: temporaryId, // Temporary ID as a negative number
                recordId: currentRecordId, // Include the recordId from prop or existing results
                ...newResult
            }
        ];
          console.log('[DEBUG] Adding new lab result with recordId:', currentRecordId);
        console.log('[DEBUG] Using temporary resultId (as Long):', temporaryId);
        console.log('[DEBUG] Updated lab results array:', updatedResults);
        
        onChange && onChange(updatedResults);
        
        // Reset form
        setNewResult({
            testName: '',
            testValue: '',
            testUnit: '',
            referenceRange: '',
            notes: '',
            isAbnormal: false
        });
    };    const handleRemoveResult = async (resultId) => {
        if (!editable) return;
        console.log('[DEBUG] Removing lab result with ID:', resultId);

        try {
            // Check if this is a temporary ID (negative number) or an existing lab result from server
            const isTemporary = typeof resultId === 'number' && resultId < 0;
            
            if (!isTemporary) {
                // This is an existing lab result, so we need to send a DELETE request to the server
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing');
                }
                
                // Ensure resultId is a number for the API call
                const numericId = typeof resultId === 'string' ? parseInt(resultId, 10) : resultId;
                console.log('[DEBUG] Sending DELETE request for lab result ID:', numericId);
                
                // Use the medical_record endpoint pattern consistent with other API calls
                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/lab-results/${numericId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`Failed to delete lab result: ${response.status} ${response.statusText}`);
                }
                
                console.log('[DEBUG] Successfully deleted lab result from server');
            } else {
                console.log('[DEBUG] Skipping DELETE request for temporary lab result');
            }
            
            // Update local state regardless of whether it was temporary or server-side
            // Convert resultId to string for comparison to handle both string and numeric IDs
            const idToRemove = String(resultId);
            
            const updatedResults = labResults.filter(result => {
                // Handle potential different types and field names for resultId
                const currentId = result.resultId !== undefined ? result.resultId :
                                result.id !== undefined ? result.id :
                                result.labResultId !== undefined ? result.labResultId : null;
                
                // Convert to string to ensure consistent comparison
                return currentId === null || String(currentId) !== idToRemove;
            });
            
            console.log('[DEBUG] Updated lab results array after removal:', updatedResults);
            onChange && onChange(updatedResults);
            
        } catch (error) {
            console.error('Error deleting lab result:', error);
            alert('Failed to delete lab result: ' + error.message);
        }
    };if ((!labResults || labResults.length === 0) && !editable) {
        return <p>No lab results available for this record.</p>;
    }

    return (
        <div>
            <table className="labResultsTable">
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Result</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                        <th>Notes</th>
                        {editable && <th>Actions</th>}
                    </tr>
                </thead>                <tbody>                    {labResults && labResults.map((result) => {
                        // Check for the ID field - the backend might be using a different field name
                        // Always use a number for resultId - if it's somehow missing, generate a negative random number
                        const resultId = result.resultId !== undefined ? result.resultId : 
                                       result.id !== undefined ? result.id :
                                       result.labResultId !== undefined ? result.labResultId : 
                                       -Math.floor(Math.random() * 1000000);
                        
                        console.log('[DEBUG] Rendering lab result with ID:', resultId, 'Type:', typeof resultId);
                        
                        // Handle various property name formats from different APIs
                        const testName = result.testName || result.name || result.test || 'Unknown Test';
                        const testValue = result.testValue || result.value || result.result || '';
                        const testUnit = result.testUnit || result.unit || result.units || '-';
                        const referenceRange = result.referenceRange || result.reference || result.range || '-';
                        const notes = result.notes || result.comment || result.description || '-';
                        const isAbnormal = result.isAbnormal || result.abnormal || false;
                        
                        return (
                            <tr key={resultId}>
                                <td>{testName}</td>
                                <td className={isAbnormal ? 'abnormalResult' : ''}>
                                    {testValue}
                                </td>
                                <td>{testUnit}</td>
                                <td>{referenceRange}</td>
                                <td>{notes}</td>
                                {editable && (
                                    <td>                                        <button 
                                            onClick={() => {
                                                console.log('[DEBUG] Remove button clicked for ID:', resultId, 'Type:', typeof resultId);
                                                handleRemoveResult(resultId);
                                            }}
                                            className="removeButton"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {editable && (
                <div className="addLabResult">
                    <h5>Add New Lab Result</h5>
                    <div className="labResultForm">
                        <input 
                            name="testName"
                            placeholder="Test Name"
                            value={newResult.testName}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="testValue"
                            placeholder="Result Value"
                            value={newResult.testValue}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="testUnit"
                            placeholder="Unit"
                            value={newResult.testUnit}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="referenceRange"
                            placeholder="Reference Range"
                            value={newResult.referenceRange}
                            onChange={handleInputChange}
                        />
                        <input 
                            name="notes"
                            placeholder="Notes"
                            value={newResult.notes}
                            onChange={handleInputChange}
                        />
                        <label>
                            <input 
                                type="checkbox"
                                name="isAbnormal"
                                checked={newResult.isAbnormal}
                                onChange={handleInputChange}
                            />
                            Abnormal Result
                        </label>
                        <button onClick={handleAddResult}>Add Result</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabResultsTable;