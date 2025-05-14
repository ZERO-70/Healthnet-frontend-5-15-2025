import React, { useState, useEffect, useCallback } from 'react';
import '../styles/ManageAppointments.css'; // Custom CSS for styling
import LoadingSpinner from './LoadingSpinner'; // Import loading spinner component

const getAppointmentCardColor = (appointment) => {
    if (appointment.is_pending && !appointment.is_approved) {
        return 'lightyellow'; // Light yellow for Pending
    } else if (appointment.is_approved && appointment.is_pending) {
        return '#eaffea'; // Light green for Approved
    } else if (appointment.is_approved && !appointment.is_pending) {
        return 'white'; // White for Completed
    } else {
        return 'lightcoral'; // Light red for Rejected
    }
};

function ManageAppointments() {
    const [loading, setLoading] = useState(false); // Loading state
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null); // To track selected appointment
    const [errorMessage, setErrorMessage] = useState('');

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment/getmine', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`Failed to fetch appointments: ${errorResponse}`);
            }

            const data = await response.json();

            const updatedAppointments = await Promise.all(
                data.map(async (appointment) => {
                    const patientName = await fetchPatientName(appointment.patient_id, token);
                    return { ...appointment, patientName };
                })
            );

            updatedAppointments.sort((a, b) => {
                if (a.date === b.date) {
                    return a.startTime.localeCompare(b.startTime);
                }
                return new Date(a.date) - new Date(b.date);
            });

            setAppointments(updatedAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const fetchPatientName = async (patientId, token) => {
        console.log(`Fetching patient name for patient_id: ${patientId}`);
        try {
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient/${patientId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch patient details.');
            }

            const patient = await response.json();
            return patient.name;
        } catch (error) {
            console.error(`Error fetching patient name for ID ${patientId}:`, error);
            return 'Unknown Patient';
        }
    };

    const handleApprove = async (id) => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to approve appointment.');
            }

            fetchAppointments();
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error approving appointment:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkNotPending = async (id) => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment/${id}/mark-not-pending`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to mark appointment as not pending.');
            }

            fetchAppointments();
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error marking appointment as not pending:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (appointment) => {
        if (appointment.is_pending && appointment.is_approved) return 'Approved';
        if (appointment.is_pending && !appointment.is_approved) return 'Not Approved';
        if (!appointment.is_pending && appointment.is_approved) return 'Completed';
        if (!appointment.is_pending && !appointment.is_approved) return 'Rejected';
        return 'Unknown Status'; // Fallback case (shouldn't happen ideally)
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {errorMessage ? (
                <p className="errorMessage">{errorMessage}</p>
            ) : selectedAppointment ? (
                <div className="appointmentDetails">
                    <h2>Appointment Details</h2>
                    <p><strong>Date:</strong> {selectedAppointment.date}</p>
                    <p><strong>Time:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                    <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                    <p><strong>Status:</strong> {getStatus(selectedAppointment)}</p>
                    <div className="actionButtons">
                        <button onClick={() => handleApprove(selectedAppointment.appointment_id)} className="approveButton">Approve</button>
                        <button onClick={() => handleMarkNotPending(selectedAppointment.appointment_id)} className="markNotPendingButton">Mark Not Pending</button>
                        <button onClick={() => setSelectedAppointment(null)} className="backButton">Back to Appointments</button>
                    </div>
                </div>
            ) : appointments.length === 0 ? (
                <p className="loadingMessage">No appointments found.</p>
            ) : (
                <div className="appointments">
                    <h2 className="appointmentsTitle">Manage Appointments</h2>
                    <div className="appointmentsList">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.appointment_id}
                                className="appointmentCard"
                                style={{ backgroundColor: getAppointmentCardColor(appointment) }}
                                onClick={() => setSelectedAppointment(appointment)}
                            >
                                <p><strong>Date:</strong> {appointment.date}</p>
                                <p><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</p>
                                <p><strong>Patient:</strong> {appointment.patientName}</p>
                                <p><strong>Status:</strong> {getStatus(appointment)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageAppointments;
