import React, { useState, useEffect, useCallback } from 'react';
import '../styles/PatientAppointments.css'; // Custom CSS for styling
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';

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


function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();

    const fetchDoctorName = async (doctorId, token) => {
        try {
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/${doctorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch doctor details.');
            }

            const doctor = await response.json();
            return doctor.name; // Assuming the API returns a `name` field in the doctor object
        } catch (error) {
            console.error(`Error fetching doctor name for ID ${doctorId}:`, error);
            return 'Unknown Doctor'; // Fallback in case of an error
        }
    };

    const fetchAppointments = useCallback(async () => {
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

            // Fetch doctor names and update appointments with doctor names
            const updatedAppointments = await Promise.all(
                data.map(async (appointment) => {
                    const doctorName = await fetchDoctorName(appointment.doctor_id, token);
                    return { ...appointment, doctorName };
                })
            );

            // Sort appointments by date and time
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
        }
    }, []);

    useEffect(() => {
        withLoading(fetchAppointments)();
    }, [withLoading, fetchAppointments]);

    if (errorMessage) {
        return <p className="errorMessage">{errorMessage}</p>;
    }

    return (
        <div className="appointments">
            {loading && <LoadingSpinner />}

            {!loading && (
                <>
                    <h2 className="appointmentsTitle">Your Appointments</h2>
                    {appointments.length === 0 ? (
                        <p className="loadingMessage">No appointments found.</p>
                    ) : (
                        <div className="appointmentsList">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.appointment_id}
                                    className="appointmentCard"
                                    style={{ backgroundColor: getAppointmentCardColor(appointment) }}
                                >
                                    <p><strong>Date:</strong> {appointment.date}</p>
                                    <p><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</p>
                                    <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                                    <p><strong>Is Approved:</strong> {appointment.is_approved ? 'Yes' : 'No'}</p>
                                    {appointment.is_pending && !appointment.is_approved
                                        ? 'Pending'
                                        : appointment.is_approved && !appointment.is_pending
                                            ? 'Completed'
                                            : appointment.is_approved && appointment.is_pending ? "Approved" : "Rejected"}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default PatientAppointments;
