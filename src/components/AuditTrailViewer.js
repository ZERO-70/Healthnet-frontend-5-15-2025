import React, { useState, useEffect } from 'react';
import { useLoading } from '../hooks/useLoading';
import LoadingSpinner from './LoadingSpinner';

function AuditTrailViewer({ recordId }) {
    const [auditTrail, setAuditTrail] = useState([]);
    const [error, setError] = useState('');
    const { loading, withLoading } = useLoading();

    useEffect(() => {
        const fetchAuditTrail = async () => {
            try {
                setError('');
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in again.');
                }

                const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record/${recordId}/audit-trail`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch audit trail');
                }

                const data = await response.json();
                setAuditTrail(data);
            } catch (error) {
                console.error('Error fetching audit trail:', error);
                setError('Failed to load audit trail. Please try again.');
            }
        };

        if (recordId) {
            withLoading(fetchAuditTrail)();
        }
    }, [recordId, withLoading]);

    // Format date and time
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Get user role and action color
    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'CREATE':
                return { color: '#2ecc71', icon: '✏️' }; // Green for create
            case 'VIEW':
                return { color: '#3498db', icon: '👁️' }; // Blue for view
            case 'UPDATE':
                return { color: '#f39c12', icon: '🔄' }; // Orange for update
            case 'DELETE':
                return { color: '#e74c3c', icon: '🗑️' }; // Red for delete
            default:
                return { color: '#95a5a6', icon: '🔍' }; // Gray for unknown
        }
    };

    if (error) {
        return <p className="errorMessage">{error}</p>;
    }

    return (
        <div>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {auditTrail.length === 0 ? (
                        <p>No audit history available for this record.</p>
                    ) : (
                        <table className="auditTable">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>User ID</th>
                                    <th>Timestamp</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditTrail.map((audit) => {
                                    const { color, icon } = getActionColor(audit.actionType);
                                    return (
                                        <tr key={audit.auditId}>
                                            <td>
                                                <span style={{ 
                                                    color, 
                                                    fontWeight: 'bold', 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {icon} {audit.actionType}
                                                </span>
                                            </td>
                                            <td>{audit.userId}</td>
                                            <td>{formatTimestamp(audit.actionTimestamp)}</td>
                                            <td>{audit.actionDetails || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default AuditTrailViewer;