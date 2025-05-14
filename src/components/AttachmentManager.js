import React, { useState } from 'react';
import '../styles/AttachmentManager.css';

function AttachmentManager({ attachments, editable = false, onChange }) {    const [downloadError, setDownloadError] = useState('');
    const [newAttachment, setNewAttachment] = useState({ name: '', file: null });
    const [loadingAttachment, setLoadingAttachment] = useState(false);// Function to download an attachment
    const downloadAttachment = async (attachment) => {
        try {
            setDownloadError('');
            setLoadingAttachment(true);
            
            // Handle temporary file downloads (files that were just added but not yet saved to server)
            if (attachment.tempFile) {
                console.log('[DEBUG] Downloading temporary file:', attachment.fileName);
                
                // For temporary files, we already have the file object, so we can create a download link directly
                const downloadUrl = window.URL.createObjectURL(attachment.tempFile);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = attachment.fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                return;
            }
            
            // For server-side files, we need to fetch them
            const attachmentId = attachment.attachmentId || attachment.id;
            if (!attachmentId) {
                throw new Error('Invalid attachment ID');
            }
            
            console.log('[DEBUG] Downloading attachment from server with ID:', attachmentId, 'Type:', typeof attachmentId);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }
            
            // If the attachment is marked with a string ID and it's not a temporary one, 
            // ensure we're using a numeric ID for the API
            let apiAttachmentId = attachmentId;
            if (typeof attachmentId === 'string' && !attachmentId.startsWith('temp-')) {
                // Try to convert to a number if possible
                apiAttachmentId = parseInt(attachmentId, 10);
                if (isNaN(apiAttachmentId)) {
                    apiAttachmentId = attachmentId; // Fall back to the original if conversion fails
                }
                console.log('[DEBUG] Converted string ID to number for API call:', apiAttachmentId);
            }
            
            // Try to download the file
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/attachments/${apiAttachmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[DEBUG] Server response error:', errorText);
                throw new Error(`Failed to download attachment (${response.status} ${response.statusText})`);
            }

            // Get the blob data
            const blob = await response.blob();
            console.log('[DEBUG] Successfully received blob data:', blob.type, blob.size);
            
            // Check if the blob is empty or invalid
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty - the attachment may be invalid');
            }
            
            // Create a download link and trigger the download
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = attachment.fileName || `attachment-${attachmentId}.${getFileExtension(attachment)}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Clean up the URL object
            window.URL.revokeObjectURL(downloadUrl);
            
        } catch (error) {
            console.error('Error downloading attachment:', error);
            setDownloadError(`Failed to download attachment: ${error.message}`);
        } finally {
            setLoadingAttachment(false);
        }
    };
    
    // Helper function to get file extension based on content type
    const getFileExtension = (attachment) => {
        // If we have a file name with extension, extract it
        if (attachment.fileName && attachment.fileName.includes('.')) {
            return attachment.fileName.split('.').pop();
        }
        
        // Otherwise try to determine from content type
        const contentType = attachment.contentType || attachment.fileType || '';
        
        // Map common MIME types to extensions
        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'application/pdf': 'pdf',
            'text/plain': 'txt',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
        };
        
        return mimeToExt[contentType] || 'dat'; // Default to .dat for unknown types
    };

    // Function to get icon based on file type
    const getFileIcon = (fileType, contentType) => {
        // You can replace these text icons with actual icon components or images
        if (contentType.includes('image')) {
            return '🖼️'; // Image icon
        } else if (contentType.includes('pdf')) {
            return '📄'; // PDF icon
        } else if (contentType.includes('video')) {
            return '🎬'; // Video icon
        } else if (contentType.includes('audio')) {
            return '🔊'; // Audio icon
        } else {
            return '📎'; // Default file icon
        }
    };

    // Function to handle file input change
    const handleFileChange = (e) => {
        if (!editable) return;
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewAttachment({
                name: file.name,
                file: file
            });
        }
    };    // Function to add attachment
    const addAttachment = () => {
        if (!editable || !newAttachment.file) return;
        // In a real application, we would upload this file to the server
        // For now, we'll just add it to the local state
        const newAttachmentObj = {
            id: `temp-${Date.now()}`, // Temporary ID
            fileName: newAttachment.name,
            uploadDate: new Date().toISOString(),
            fileType: newAttachment.file.type,
            contentType: newAttachment.file.type,
            fileSize: newAttachment.file.size, // Add the file size to prevent null pointer exception in backend
            tempFile: newAttachment.file // Keep a reference to the actual file
        };
        
        console.log('[DEBUG] Adding new attachment with size:', newAttachment.file.size);
        
        const updatedAttachments = [...(attachments || []), newAttachmentObj];
        onChange && onChange(updatedAttachments);
        setNewAttachment({ name: '', file: null });
    };// Function to remove attachment
    const removeAttachment = async (id) => {
        if (!editable) return;
        
        try {
            // Check if this is a temporary ID or an existing attachment from server
            const isTemporary = String(id).startsWith('temp-');
            
            if (!isTemporary) {
                // This is an existing attachment, so we need to send a DELETE request to the server
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing');
                }
                  console.log('[DEBUG] Sending DELETE request for attachment ID:', id);
                console.log('[DEBUG] Attachment ID type:', typeof id);
                  // Use the medical_record endpoint pattern consistent with other API calls
                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/attachments/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`Failed to delete attachment: ${response.status} ${response.statusText}`);
                }
                
                console.log('[DEBUG] Successfully deleted attachment from server');
            } else {
                console.log('[DEBUG] Skipping DELETE request for temporary attachment');
            }
            
            // Update local state regardless of whether it was temporary or server-side
            const updatedAttachments = attachments.filter(att => {
                const attId = att.attachmentId || att.id;
                return attId !== id;
            });
            
            onChange && onChange(updatedAttachments);
            
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setDownloadError('Failed to delete attachment: ' + error.message);
        }
    };    // Instead of returning early, we'll show a message within the main component if no attachments
    const hasAttachments = attachments && attachments.length > 0;
        return (
        <div>
            {downloadError && <p className="errorMessage">{downloadError}</p>}
            
            {/* Show a message when no attachments exist */}
            {!hasAttachments ? (
                <p className="no-attachments-message">No attachments available for this record.</p>
            ) : (
                <div className="attachmentsList">
                    {attachments.map((attachment) => {
                        // Log each attachment for debugging
                        console.log('[DEBUG] Rendering attachment:', {
                            id: attachment.attachmentId || attachment.id,
                            fileName: attachment.fileName,
                            isTemp: attachment.tempFile ? true : false,
                            fileSize: attachment.fileSize,
                            contentType: attachment.contentType
                        });
                        
                        return (
                            <div key={attachment.attachmentId || attachment.id} className="attachmentItem">
                                <div className="attachmentIcon">
                                    {getFileIcon(attachment.fileType, attachment.contentType)}
                                </div>
                                <div className="attachmentName">{attachment.fileName}</div>
                                <div className="attachmentType">{attachment.fileType}</div>
                                
                                {attachment.description && (
                                    <div className="attachmentDescription">
                                        {attachment.description}
                                    </div>
                                )}
                                
                                {attachment.fileSize && (
                                    <div className="attachmentSize">
                                        {(attachment.fileSize / 1024).toFixed(1)} KB
                                    </div>
                                )}
                                
                                <button 
                                    className={`downloadButton ${loadingAttachment ? 'loading' : ''}`}
                                    onClick={() => downloadAttachment(attachment)}
                                    disabled={loadingAttachment}
                                >
                                    {loadingAttachment ? 'Downloading...' : 'Download'}
                                </button>
                                
                                {editable && (
                                    <button 
                                        className="removeButton"
                                        onClick={() => {
                                            const attachmentId = attachment.attachmentId || attachment.id;
                                            console.log('[DEBUG] Remove attachment clicked with ID:', attachmentId, 'Type:', typeof attachmentId);
                                            removeAttachment(attachmentId);
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {editable && (
                <div className="addAttachment">
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                    />
                    <button 
                        className="addButton"
                        onClick={addAttachment}
                    >
                        Add Attachment
                    </button>
                </div>
            )}
        </div>
    );
}

export default AttachmentManager;