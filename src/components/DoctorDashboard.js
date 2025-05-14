import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiClock, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';
import NotificationIcon from './NotificationIcon';
import '../styles/DoctorDashboard.css';

const DoctorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token missing');
                }

                // Fetch doctor info
                const doctorResponse = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor/getmine', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!doctorResponse.ok) {
                    throw new Error('Failed to fetch doctor information');
                }

                const doctorData = await doctorResponse.json();
                setDoctorInfo(doctorData);
                
                // Fetch doctor's appointments
                const appointmentsResponse = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment/getmine', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!appointmentsResponse.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const appointmentsData = await appointmentsResponse.json();
                console.log('Fetched appointments data:', appointmentsData);
                
                // Process appointments with patient names
                const appointmentsWithPatients = await Promise.all(
                    appointmentsData.map(async (appointment) => {
                        try {
                            // Fetch patient name
                            const patientResponse = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient/${appointment.patient_id}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (patientResponse.ok) {
                                const patientData = await patientResponse.json();
                                return {
                                    ...appointment,
                                    patientName: patientData.name || 'Unknown Patient',
                                };
                            } else {
                                return {
                                    ...appointment,
                                    patientName: 'Unknown Patient',
                                };
                            }
                        } catch (error) {
                            console.error('Error fetching patient data:', error);
                            return {
                                ...appointment,
                                patientName: 'Unknown Patient',
                            };
                        }
                    })
                );

                // Filter today's appointments
                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appointmentsWithPatients.filter(appt => 
                    appt.date === today && appt.is_pending
                );
                
                // Filter upcoming appointments - future dates, pending status
                const upcomingAppts = appointmentsWithPatients.filter(appt => 
                    appt.date > today && appt.is_pending
                );
                
                console.log('Today\'s appointments:', todayAppts);
                console.log('Upcoming appointments:', upcomingAppts);
                
                setTodayAppointments(todayAppts);
                setUpcomingAppointments(upcomingAppts);
                
                // Set stats
                const pendingCount = appointmentsWithPatients.filter(appt => appt.is_pending && !appt.is_approved).length;
                const uniquePatients = [...new Set(appointmentsWithPatients.map(appt => appt.patient_id))];
                
                setStats({
                    totalPatients: uniquePatients.length,
                    todayAppointments: todayAppts.length,
                    pendingAppointments: pendingCount
                });

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 12
            }
        }
    };

    // Helper to determine status class
    const getStatusClass = (appointment) => {
        if (appointment.is_pending && !appointment.is_approved) return "pending";
        if (appointment.is_pending && appointment.is_approved) return "confirmed";
        if (!appointment.is_pending && appointment.is_approved) return "completed";
        return "rejected";
    };

    // Helper to determine status text
    const getStatusText = (appointment) => {
        if (appointment.is_pending && !appointment.is_approved) return "Pending";
        if (appointment.is_pending && appointment.is_approved) return "Confirmed";
        if (!appointment.is_pending && appointment.is_approved) return "Completed";
        return "Rejected";
    };

    const handleSelectAppointment = (appointment) => {
        console.log('Selected appointment:', appointment);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <motion.div 
            className="doctor-dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="dashboard-header">
                <h2>Welcome back, Dr. {doctorInfo?.name?.split(' ')[0] || 'Doctor'}</h2>
                <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <NotificationIcon />
            </div>

            <motion.div className="stats-container" variants={itemVariants}>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiUser />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalPatients}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiCalendar />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayAppointments}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiClock />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingAppointments}</h3>
                        <p>Pending Appointments</p>
                    </div>
                </div>
            </motion.div>

            <div className="dashboard-sections">
                <motion.div className="dashboard-section" variants={itemVariants}>
                    <h3>
                        <FiCalendar className="section-icon" />
                        Today's Appointments
                    </h3>
                    {todayAppointments.length > 0 ? (
                        <div className="appointments-list">
                            {todayAppointments.map(appointment => (
                                <div key={appointment.appointment_id} className={`appointment-card ${getStatusClass(appointment)}`}>
                                    <div className="appointment-time">{appointment.startTime} - {appointment.endTime}</div>
                                    <div className="appointment-details">
                                        <h4>{appointment.patientName}</h4>
                                        <p>Appointment ID: {appointment.appointment_id}</p>
                                    </div>
                                    <div className="appointment-actions">
                                        <button className="action-button info">
                                            <FiInfo />
                                        </button>
                                        <button className="action-button approve">
                                            <FiCheckCircle />
                                        </button>
                                        <button className="action-button reject">
                                            <FiXCircle />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No appointments scheduled for today</p>
                        </div>
                    )}
                </motion.div>

                <motion.div className="dashboard-section" variants={itemVariants}>
                    <h3>
                        <FiCalendar className="section-icon" />
                        Upcoming Appointments
                    </h3>
                    {upcomingAppointments.length > 0 ? (
                        <div className="appointments-list">
                            {upcomingAppointments.map((appointment) => (
                                <div key={appointment.appointment_id} className="appointment-item">
                                    <p><span>Patient:</span> {appointment.patientName}</p>
                                    <p><span>Date:</span> {appointment.date}</p>
                                    <p><span>Time:</span> {appointment.startTime}</p>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => handleSelectAppointment(appointment)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No upcoming appointments</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DoctorDashboard;