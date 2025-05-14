import React, { useState } from 'react';

function FileUploader({ recordId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fileTypes = [
        'X-RAY', 'MRI', 'CT-SCAN', 'ULTRASOUND', 'ECG', 
        'LAB-REPORT', 'PRESCRIPTION', 'CONSENT-FORM', 
        'DISCHARGE-SUMMARY', 'OTHER'
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (!file) {
            setError('Please select a file to upload');
            return;
        }
        if (!fileType) {
            setError('Please select a file type');
            return;
        }

        try {
            setIsUploading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileType', fileType);
            if (description) {
                formData.append('description', description);
            }

            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${recordId}/attachments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Upload failed: ${errorData}`);
            }

            const data = await response.json();
            setMessage('File uploaded successfully!');
            setFile(null);
            setFileType('');
            setDescription('');
            
            // Notify parent component about successful upload
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fileUploaderContainer">
            <h4>Upload New Attachment</h4>
            
            {message && <p className="successMessage">{message}</p>}
            {error && <p className="errorMessage">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="formGroup">
                    <label htmlFor="file">Select File:</label>
                    <input 
                        type="file" 
                        id="file" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>
                
                <div className="formGroup">
                    <label htmlFor="fileType">File Type:</label>
                    <select 
                        id="fileType" 
                        value={fileType} 
                        onChange={(e) => setFileType(e.target.value)}
                        disabled={isUploading}
                    >
                        <option value="">Select a file type</option>
                        {fileTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                
                <div className="formGroup">
                    <label htmlFor="description">Description (optional):</label>
                    <textarea 
                        id="description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isUploading}
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="uploadButton"
                    disabled={isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
            </form>
        </div>
    );
}

export default FileUploader;