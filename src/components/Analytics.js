import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/Analytics.css';

import {
    Chart as ChartJS,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Analytics() {
    const [patientList, setPatientList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [inventoryList, setInventoryList] = useState([]);
    const [appointmentList, setAppointmentList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data for analytics
    const fetchData = async (endpoint, setData) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/${endpoint}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);
            const data = await response.json();
            console.log(`Fetched ${endpoint} Data:`, data); // Debug log
            setData(data);
        } catch (error) {
            console.error(`Error fetching ${endpoint} data:`, error.message);
            setErrorMessage(`Error fetching ${endpoint} data: ${error.message}`);
        }
    };

    // Gender Analysis for Patients
    const analyzePatientGender = () => {
        const genderCounts = { male: 0, female: 0, other: 0 };

        patientList.forEach((patient) => {
            const gender = patient.gender.toLowerCase();
            if (gender === 'male') genderCounts.male += 1;
            else if (gender === 'female') genderCounts.female += 1;
            else genderCounts.other += 1;
        });

        return {
            labels: ['Male', 'Female', 'Other'],
            datasets: [
                {
                    data: [genderCounts.male, genderCounts.female, genderCounts.other],
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                },
            ],
        };
    };

    // Gender Analysis for Doctors
    const analyzeDoctorGender = () => {
        const genderCounts = { male: 0, female: 0, other: 0 };

        doctorList.forEach((doctor) => {
            const gender = doctor.gender.toLowerCase();
            if (gender === 'male') genderCounts.male += 1;
            else if (gender === 'female') genderCounts.female += 1;
            else genderCounts.other += 1;
        });

        return {
            labels: ['Male', 'Female', 'Other'],
            datasets: [
                {
                    data: [genderCounts.male, genderCounts.female, genderCounts.other],
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                },
            ],
        };
    };

    // Gender Analysis for Staff
    const analyzeStaffGender = () => {
        const genderCounts = { male: 0, female: 0, other: 0 };

        staffList.forEach((staff) => {
            const gender = staff.gender.toLowerCase();
            if (gender === 'male') genderCounts.male += 1;
            else if (gender === 'female') genderCounts.female += 1;
            else genderCounts.other += 1;
        });

        return {
            labels: ['Male', 'Female', 'Other'],
            datasets: [
                {
                    data: [genderCounts.male, genderCounts.female, genderCounts.other],
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                },
            ],
        };
    };

    // Analyze Inventory by Department
    const analyzeInventoryByDepartment = () => {
        const departmentCounts = departmentList.reduce((acc, department) => {
            acc[department.name] = 0;
            return acc;
        }, {});

        inventoryList.forEach((item) => {
            const department = departmentList.find((d) => d.department_id === item.department_id);
            if (department) departmentCounts[department.name] += 1;
        });

        return {
            labels: Object.keys(departmentCounts),
            datasets: [
                {
                    data: Object.values(departmentCounts),
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
                },
            ],
        };
    };


    // Get inventory item quantities
    const inventoryItemQuantities = () => {
        return inventoryList.map((item) => ({
            name: item.name,
            quantity: item.quantity,
        }));
    };

    // Analyze inventory items' quantities
    const analyzeInventoryQuantities = () => {
        const labels = inventoryList.map((item) => item.name);
        const data = inventoryList.map((item) => item.quantity);

        return {
            labels,
            datasets: [
                {
                    label: 'Quantity',
                    data,
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
                },
            ],
        };
    };




    // Analyze Appointments by Approval Status
    const analyzeAppointments = () => {
        const statusCounts = { approved: 0, pending: 0 };

        appointmentList.forEach((appointment) => {
            if (appointment.is_approved) statusCounts.approved += 1;
            if (appointment.is_pending) statusCounts.pending += 1;
        });

        return {
            labels: ['Approved', 'Pending'],
            datasets: [
                {
                    data: [statusCounts.approved, statusCounts.pending],
                    backgroundColor: ['#36A2EB', '#FF6384'],
                },
            ],
        };
    };

    useEffect(() => {
        fetchData('patient', setPatientList);
        fetchData('doctor', setDoctorList);
        fetchData('staff', setStaffList);
        fetchData('inventory', setInventoryList);
        fetchData('appointment', setAppointmentList);
        fetchData('department', setDepartmentList);
    }, []);

    return (
        <div className="analytics">
            <h2>Analytics Dashboard</h2>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}

            {/* Patient Gender Analysis */}
            <div className="chartContainer">
                <h3>Patient Gender Distribution</h3>
                <Pie data={analyzePatientGender()} />
            </div>

            {/* Doctor Gender Analysis */}
            <div className="chartContainer">
                <h3>Doctor Gender Distribution</h3>
                <Pie data={analyzeDoctorGender()} />
            </div>

            {/* Staff Gender Analysis */}
            <div className="chartContainer">
                <h3>Staff Gender Distribution</h3>
                <Pie data={analyzeStaffGender()} />
            </div>

            {/* Inventory by Department */}
            <div className="chartContainer">
                <h3>Inventory Distribution by Department</h3>
                <Bar
                    data={analyzeInventoryByDepartment()}
                    options={{
                        scales: {
                            y: { beginAtZero: true },
                        },
                    }}

                />

                {/* Inventory Item Quantities Chart */}
                <div className="chartContainer">
                    <h3>Inventory Item Quantities</h3>
                    <Bar
                        data={analyzeInventoryQuantities()}
                        options={{
                            scales: {
                                y: { beginAtZero: true },
                            },
                        }}
                    />
                </div>

            </div>



            {/* Appointment Status */}
            <div className="chartContainer">
                <h3>Appointment Status</h3>
                <Pie data={analyzeAppointments()} />
            </div>
        </div>
    );
}

export default Analytics;
