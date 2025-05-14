import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity, FiAlertCircle, FiBarChart2, FiCalendar, FiCpu,
  FiDatabase, FiPackage, FiPieChart, FiTrendingUp, FiUser,
  FiUsers, FiX, FiAward, FiHeart, FiShield, FiThermometer,
  FiInfo
} from 'react-icons/fi';
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
  RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, PolarArea } from 'react-chartjs-2';
import LoadingSpinner from './LoadingSpinner';
import NotificationIcon from './NotificationIcon';
import '../styles/StaffDashboard.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Component to display when there's no data
const NoDataMessage = () => (
  <div className="no-data-message">
    <FiInfo className="no-data-icon" />
    <p>No data available</p>
  </div>
);

const StaffDashboard = () => {
  // State for all data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [topDiseases, setTopDiseases] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [patientTrends, setPatientTrends] = useState({ approved: [], pending: [] });
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffStats, setStaffStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    lowInventoryItems: 0
  });
  
  // New state for staff info summary
  const [staffSummary, setStaffSummary] = useState([]);
  
  // Add department performance metrics state
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  
  // Animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
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
  }), []);

  // Color palettes for charts
  const colorPalette = useMemo(() => ({
    primary: [
      'rgba(99, 179, 237, 0.8)',
      'rgba(154, 230, 180, 0.8)',
      'rgba(251, 211, 141, 0.8)',
      'rgba(251, 182, 206, 0.8)',
      'rgba(214, 188, 250, 0.8)',
      'rgba(159, 122, 234, 0.8)',
    ],
    secondary: [
      'rgba(66, 153, 225, 0.8)',
      'rgba(72, 187, 120, 0.8)',
      'rgba(237, 137, 54, 0.8)',
      'rgba(237, 100, 166, 0.8)',
      'rgba(183, 148, 244, 0.8)',
      'rgba(128, 90, 213, 0.8)',
    ],
    highlight: 'rgba(237, 100, 166, 0.9)',
    background: 'rgba(247, 250, 252, 0.9)'
  }), []);

  // Fetch staff information
  const fetchStaffInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication information missing');
      const response = await fetch(
        'https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff/getmine',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch staff information');
      const data = await response.json();
      setStaffInfo(data);
      // store staffId for any further use
      localStorage.setItem('staffId', data.staff_id?.toString() || '');
      return data;
    } catch (error) {
      console.error('Error fetching staff info:', error);
      setError(error.message);
      return null;
    }
  }, []);

  // Fetch disease statistics
  const fetchDiseaseStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/medical_record', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch disease statistics');
      }
      
      const records = await response.json();
      
      // Process records to get top diseases
      const diagnosisCounts = {};
      records.forEach(record => {
        if (record.diagnosis) {
          // Don't simplify the diagnosis - use the full name as is
          const diagnosisName = record.diagnosis;
          diagnosisCounts[diagnosisName] = (diagnosisCounts[diagnosisName] || 0) + 1;
        }
      });
      
      // Convert to array and sort
      const sortedDiseases = Object.entries(diagnosisCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 diseases
      
      console.log('Top diagnoses:', sortedDiseases); // Log for debugging
      setTopDiseases(sortedDiseases);
      return sortedDiseases;
    } catch (error) {
      console.error('Error fetching disease stats:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Replace patient growth trends with appointment trends by status
  const fetchAppointmentTrends = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const allAppointments = await response.json();
      
      // Update stats
      setStaffStats(prev => ({
        ...prev,
        totalAppointments: allAppointments.length,
        pendingAppointments: allAppointments.filter(app => app.is_pending).length
      }));
      
      // Categorize appointments by status and month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      // Initialize data structure for approved/pending appointments
      const monthlyData = {
        approved: Array(3).fill().map((_, i) => ({
          month: months[(currentMonth - i + 12) % 12],
          count: 0
        })).reverse(),
        pending: Array(3).fill().map((_, i) => ({
          month: months[(currentMonth - i + 12) % 12],
          count: 0
        })).reverse()
      };
      
      // Count actual appointments by month (using appointment dates if available)
      allAppointments.forEach(appointment => {
        // Determine month from appointment date or distribute among months
        let appointmentMonth;
        if (appointment.date) {
          appointmentMonth = new Date(appointment.date).getMonth();
        } else {
          // Use a random month from the last 3 for demo purposes
          const monthsBack = Math.floor(Math.random() * 3);
          appointmentMonth = (currentMonth - monthsBack + 12) % 12;
        }
        
        // Find which of our tracked months this belongs to
        const monthIndex = monthlyData.approved.findIndex(m => m.month === months[appointmentMonth]);
        
        // Only count if it's within our 3-month window
        if (monthIndex !== -1) {
          if (appointment.is_approved) {
            monthlyData.approved[monthIndex].count++;
          }
          if (appointment.is_pending) {
            monthlyData.pending[monthIndex].count++;
          }
        }
      });
      
      setPatientTrends(monthlyData);
      return monthlyData;
    } catch (error) {
      console.error('Error fetching appointment trends:', error);
      setError(error.message);
      return { approved: [], pending: [] };
    }
  }, []);

  // Update inventory data to confirm the low quantity threshold of 10
  const fetchInventoryData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/inventory', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const items = await response.json();
      
      // Get low inventory items - threshold is 10
      const lowItems = items.filter(item => parseInt(item.quantity) < 10).length;
      setStaffStats(prev => ({ ...prev, lowInventoryItems: lowItems }));
      
      setInventoryData(items);
      return items;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Fetch top doctors
  const fetchTopDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch all doctors
      const doctorsResponse = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!doctorsResponse.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const doctors = await doctorsResponse.json();
      
      // Fetch all appointments
      const appointmentsResponse = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const appointments = await appointmentsResponse.json();
      
      // Count appointments per doctor
      const doctorAppointmentCounts = {};
      appointments.forEach(appointment => {
        const doctorId = appointment.doctor_id;
        doctorAppointmentCounts[doctorId] = (doctorAppointmentCounts[doctorId] || 0) + 1;
      });
      
      // Combine doctors with their appointment counts
      const doctorsWithCounts = doctors.map(doctor => ({
        ...doctor,
        appointmentCount: doctorAppointmentCounts[doctor.doctor_id] || 0
      }));
      
      // Sort by appointment count
      const sortedDoctors = doctorsWithCounts
        .sort((a, b) => b.appointmentCount - a.appointmentCount)
        .slice(0, 5); // Top 5 doctors
      
      setTopDoctors(sortedDoctors);
      return sortedDoctors;
    } catch (error) {
      console.error('Error fetching top doctors:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/appointment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const appointments = await response.json();
      
      // Count pending appointments
      const pendingCount = appointments.filter(appointment => appointment.is_pending).length;
      
      // Update stats
      setStaffStats(prev => ({
        ...prev,
        totalAppointments: appointments.length,
        pendingAppointments: pendingCount
      }));
      
      setAppointments(appointments);
      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const departments = await response.json();
      console.log('Departments data:', departments); // Log department data for debugging
      setDepartments(departments);
      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Fetch staff summary data
  const fetchStaffSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/staff', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff data');
      }
      
      const staffList = await response.json();
      
      // Instead of using departments directly (which could change), 
      // use the department IDs and names passed to this function
      setStaffSummary(staffList);
      return staffList;
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      setError(error.message);
      return [];
    }
  }, []); // Remove departments dependency to prevent loops

  // Fix dependency issues in calculateDepartmentPerformance
  const calculateDepartmentPerformance = useCallback(() => {
    if (!departments.length || !appointments.length || !topDoctors.length) return [];
    
    // Initialize department metrics
    const deptMetrics = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      appointmentCount: 0,
      completedAppointments: 0,
      averageRating: 0,
      doctorCount: 0
    }));
    
    // Count appointments by department via doctors
    appointments.forEach(appointment => {
      const doctor = topDoctors.find(d => d.doctor_id === appointment.doctor_id);
      if (doctor) {
        const deptIndex = deptMetrics.findIndex(d => d.id === doctor.department_id);
        if (deptIndex !== -1) {
          deptMetrics[deptIndex].appointmentCount += 1;
          
          // Count completed appointments
          if (appointment.is_approved && !appointment.is_pending) {
            deptMetrics[deptIndex].completedAppointments += 1;
          }
        }
      }
    });
    
    // Count doctors by department
    topDoctors.forEach(doctor => {
      const deptIndex = deptMetrics.findIndex(d => d.id === doctor.department_id);
      if (deptIndex !== -1) {
        deptMetrics[deptIndex].doctorCount += 1;
      }
    });
    
    // Calculate completion rates and sort by performance
    const performanceMetrics = deptMetrics
      .map(dept => ({
        ...dept,
        completionRate: dept.appointmentCount > 0 
          ? (dept.completedAppointments / dept.appointmentCount) * 100 
          : 0,
        efficiency: dept.doctorCount > 0 
          ? dept.appointmentCount / dept.doctorCount 
          : 0
      }))
      .filter(dept => dept.appointmentCount > 0) // Only show departments with appointments
      .sort((a, b) => b.efficiency - a.efficiency);
    
    setDepartmentPerformance(performanceMetrics);
  }, [departments, appointments, topDoctors]); // Keep these dependencies

  // Separate data processing from data loading
  useEffect(() => {
    if (departments.length && appointments.length && topDoctors.length) {
      calculateDepartmentPerformance();
    }
  }, [departments, appointments, topDoctors, calculateDepartmentPerformance]);

  // Fetch patient data to show total patients
  const fetchPatientStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/patient', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      
      const patients = await response.json();
      
      // Update stats with actual patient count
      setStaffStats(prev => ({
        ...prev,
        totalPatients: patients.length
      }));
      
      return patients.length;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      setError(error.message);
      return 0;
    }
  }, []);

  // Update loadAllData to prioritize departments
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Group 1: Critical data - load first and release UI
      const staffData = await fetchStaffInfo();
      
      // Also load departments in the first group since it's needed for various components
      const departmentData = await fetchDepartments();
      
      setLoading(false); // Release UI after critical data is loaded
      
      // Group 2: Stats data - load asynchronously
      Promise.all([
        fetchInventoryData(),
        fetchAppointments(),
        fetchAppointmentTrends(),
        fetchPatientStats()
      ]).catch(error => {
        console.error('Error loading stats data:', error);
      });
      
      // Group 3: Additional data
      Promise.all([
        fetchStaffSummary(),
        fetchDiseaseStats(),
        fetchTopDoctors()
      ]).catch(error => {
        console.error('Error loading additional data:', error);
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      setLoading(false);
    }
  }, [
    fetchStaffInfo, 
    fetchDepartments, 
    fetchInventoryData, 
    fetchAppointments, 
    fetchAppointmentTrends,
    fetchDiseaseStats, 
    fetchTopDoctors, 
    fetchStaffSummary,
    fetchPatientStats
  ]);

  // Load data on component mount - only run once
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadAllData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  // Updated chart data for appointment trends
  const appointmentTrendsChartData = useMemo(() => {
    if (!patientTrends.approved || !patientTrends.approved.length > 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            label: 'No Appointment Data',
            data: [0],
            borderColor: 'rgba(203, 213, 224, 0.8)',
            backgroundColor: 'rgba(203, 213, 224, 0.2)',
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }
    
    return {
      labels: patientTrends.approved.map(data => data.month),
      datasets: [
        {
          label: 'Approved Appointments',
          data: patientTrends.approved.map(data => data.count),
          borderColor: 'rgba(72, 187, 120, 0.8)',
          backgroundColor: 'rgba(72, 187, 120, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Pending Appointments',
          data: patientTrends.pending.map(data => data.count),
          borderColor: 'rgba(237, 137, 54, 0.8)',
          backgroundColor: 'rgba(237, 137, 54, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [patientTrends]);

  // Chart configurations
  const diseasesChartData = useMemo(() => {
    if (topDiseases.length === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            label: 'Cases',
            data: [1],
            backgroundColor: ['rgba(203, 213, 224, 0.8)'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    return {
      labels: topDiseases.map(disease => disease.name),
      datasets: [
        {
          label: 'Cases',
          data: topDiseases.map(disease => disease.count),
          backgroundColor: colorPalette.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [topDiseases, colorPalette.primary]);

  // Add appointmentStatusChartData definition
  const appointmentStatusChartData = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['rgba(203, 213, 224, 0.8)'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Calculate status counts
    const approved = appointments.filter(app => app.is_approved && !app.is_pending).length;
    const pending = appointments.filter(app => app.is_pending).length;
    const rejected = appointments.filter(app => !app.is_approved && !app.is_pending).length;
    
    return {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [approved, pending, rejected],
          backgroundColor: [
            'rgba(72, 187, 120, 0.8)',  // Green for approved
            'rgba(237, 137, 54, 0.8)',  // Orange for pending
            'rgba(229, 62, 62, 0.8)',   // Red for rejected
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [appointments]);

  const doctorsChartData = useMemo(() => {
    if (topDoctors.length === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            label: 'Appointments',
            data: [0],
            backgroundColor: ['rgba(203, 213, 224, 0.8)'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    return {
      labels: topDoctors.map(doctor => `Dr. ${doctor.first_name}`),
      datasets: [
        {
          label: 'Appointments',
          data: topDoctors.map(doctor => doctor.appointmentCount),
          backgroundColor: colorPalette.secondary,
          borderColor: colorPalette.secondary.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [topDoctors, colorPalette.secondary]);

  const inventoryChartData = useMemo(() => {
    if (inventoryData.length === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            label: 'Quantity',
            data: [0],
            backgroundColor: ['rgba(203, 213, 224, 0.8)'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Get top 6 inventory items by quantity
    const topItems = [...inventoryData]
      .sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity))
      .slice(0, 6);

    return {
      labels: topItems.map(item => item.name),
      datasets: [
        {
          label: 'Quantity',
          data: topItems.map(item => parseInt(item.quantity)),
          backgroundColor: colorPalette.primary,
          borderColor: colorPalette.primary.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [inventoryData, colorPalette.primary]);

  const departmentDistributionData = useMemo(() => {
    if (departments.length === 0 || topDoctors.length === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['rgba(203, 213, 224, 0.8)'],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // Count doctors per department
    const deptCounts = {};
    departments.forEach(dept => {
      deptCounts[dept.name] = 0;
    });
    
    topDoctors.forEach(doctor => {
      const dept = departments.find(d => d.id === doctor.department_id);
      if (dept) {
        deptCounts[dept.name] = (deptCounts[dept.name] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(deptCounts),
      datasets: [
        {
          data: Object.values(deptCounts),
          backgroundColor: colorPalette.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [departments, topDoctors, colorPalette.primary]);

  // Department Performance Chart Data
  const departmentPerformanceChartData = useMemo(() => {
    if (!departmentPerformance.length) {
      return {
        labels: ['No Data Available'],
        datasets: [
          {
            label: 'Appointments',
            data: [0],
            backgroundColor: 'rgba(203, 213, 224, 0.8)',
            borderWidth: 1,
          }
        ]
      };
    }
    
    return {
      labels: departmentPerformance.map(dept => dept.name),
      datasets: [
        {
          label: 'Total Appointments',
          data: departmentPerformance.map(dept => dept.appointmentCount),
          backgroundColor: colorPalette.primary[0],
          borderWidth: 1,
        },
        {
          label: 'Completed Appointments',
          data: departmentPerformance.map(dept => dept.completedAppointments),
          backgroundColor: colorPalette.secondary[1],
          borderWidth: 1,
        },
        {
          label: 'Doctors',
          data: departmentPerformance.map(dept => dept.doctorCount),
          backgroundColor: colorPalette.secondary[4],
          borderWidth: 1,
        }
      ]
    };
  }, [departmentPerformance, colorPalette]);

  // Function to check if chart has data
  const hasData = (dataArray) => {
    return Array.isArray(dataArray) && dataArray.length > 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div 
      className="staff-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header section */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="dashboard-title">
          <h1>Staff Dashboard</h1>
          <p className="subtitle">Analytics & Overview</p>
        </div>
        
        <div className="header-actions">
          <NotificationIcon />
        </div>

        {staffInfo && (
          <div className="staff-profile">
            <div className="avatar">
              {staffInfo.first_name?.[0] || 'U'}
            </div>
            <div className="staff-details">
              <h3>{staffInfo.first_name} {staffInfo.last_name}</h3>
              <p>{departments.find(d => d.id === staffInfo.department_id)?.name || 'Department'}</p>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Error message */}
      {error && (
        <motion.div 
          className="error-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <FiAlertCircle className="error-icon" />
          <p className="error-message">{error}</p>
          <button 
            className="icon-button" 
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            <FiX />
          </button>
        </motion.div>
      )}
        {/* KPI Stats Cards - Only show stats that have actual data */}
      <motion.div className="stats-container" variants={itemVariants}>
        {staffStats.totalPatients > 0 && (
          <motion.div key="total-patients" className="stat-card" whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
            <div className="stat-icon patients">
              <FiUsers />
            </div>
            <div className="stat-details">
              <h3>{staffStats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </motion.div>
        )}
        
        {staffStats.totalAppointments > 0 && (
          <motion.div key="total-appointments" className="stat-card" whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
            <div className="stat-icon appointments">
              <FiCalendar />
            </div>
            <div className="stat-details">
              <h3>{staffStats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
          </motion.div>
        )}
        
        {staffStats.pendingAppointments > 0 && (
          <motion.div key="pending-appointments" className="stat-card" whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
            <div className="stat-icon pending">
              <FiCpu />
            </div>
            <div className="stat-details">
              <h3>{staffStats.pendingAppointments}</h3>
              <p>Pending Approvals</p>
            </div>
          </motion.div>
        )}
        
        {staffStats.lowInventoryItems > 0 && (
          <motion.div key="low-inventory" className="stat-card" whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
            <div className="stat-icon inventory">
              <FiPackage />
            </div>
            <div className="stat-details">
              <h3>{staffStats.lowInventoryItems}</h3>
              <p>Low Stock Items</p>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Charts Row 1 - Only show if we have data */}
      <div className="dashboard-grid">
        {/* Appointment Trends - Only show if we have appointment data */}
        {patientTrends.approved && patientTrends.approved.length > 0 && (
          <motion.div 
            className="dashboard-card wide"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="card-header">
              <h2><FiTrendingUp /> Appointment Status Trends</h2>
            </div>
            <div className="chart-container">
              <Line 
                data={appointmentTrendsChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Appointments'
                      }
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Charts Row 2 - Only show diagnoses and appointment status */}
      <div className="dashboard-grid">
        {/* Top Diseases - Only show if we have disease data */}
        {hasData(topDiseases) && (
          <motion.div 
            className="dashboard-card"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="card-header">
              <h2><FiThermometer /> Top Diagnoses</h2>
            </div>
            <div className="chart-container">
              <Doughnut 
                data={diseasesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        // Display full diagnosis names
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value} cases`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </motion.div>
        )}
        
        {/* Appointment Status - Only show if we have appointment data */}
        {hasData(appointments) && (
          <motion.div 
            className="dashboard-card"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="card-header">
              <h2><FiActivity /> Appointment Status</h2>
            </div>
            <div className="chart-container">
              <Pie 
                data={appointmentStatusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}
        
        {/* Inventory Chart - Only show if we have inventory data */}
        {hasData(inventoryData) && (
          <motion.div 
            className="dashboard-card"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="card-header">
              <h2><FiDatabase /> Inventory Levels</h2>
            </div>
            <div className="chart-container">
              <Bar 
                data={inventoryChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Department Performance Row - Only show if we have department performance data */}
      {hasData(departmentPerformance) && (
        <motion.div 
          className="dashboard-card"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
        >
          <div className="card-header">
            <h2><FiBarChart2 /> Department Performance Metrics</h2>
          </div>
          <div className="chart-container">
            <Bar 
              data={departmentPerformanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                      beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Staff Summary Table - Only show if we have staff data */}
      {hasData(staffSummary) && (
        <motion.div 
          className="dashboard-card"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
        >
          <div className="card-header">
            <h2><FiUsers /> Staff Information</h2>
          </div>
          <div className="staff-table-container">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Gender</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {staffSummary.slice(0, 5).map((staff, index) => {
                  const dept = departments.find(d => d.id === staff.department_id);
                  const departmentName = dept ? dept.name : 'Unknown';
                  return (
                    <tr key={staff.staff_id ?? index}>
                      <td>{`${staff.first_name || ''} ${staff.last_name || ''}`}</td>
                      <td>{staff.email || 'N/A'}</td>
                      <td>{staff.contact || 'N/A'}</td>
                      <td>{staff.gender || 'N/A'}</td>
                      <td>{departmentName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      
      {/* Department Listing - Always show since departments are key hospital data */}
      {hasData(departments) && (
        <motion.div 
          className="dashboard-card"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
        >
          <div className="card-header">
            <h2><FiPieChart /> Hospital Departments</h2>
          </div>
          <div className="departments-container">
            <div className="departments-grid">
              {departments.map(dept => (
                <motion.div 
                  key={dept.id}
                  className="department-card"
                  whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3>{dept.name}</h3>
                  <p className="department-description">{dept.description || 'No description available'}</p>
                  <div className="department-meta">
                    <span className="department-id">ID: {dept.id}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Always show Hospital Insights section as it's mostly static */}
      <motion.div className="achievement-container" variants={itemVariants}>
        <h2>Hospital Insights</h2>
        <div className="achievement-cards">
          <motion.div 
            key="patient-feedback"
            className="achievement-card"
            whileHover={{ y: -8, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="achievement-icon">
              <FiHeart />
            </div>
            <h3>Patient Feedback</h3>
            <p>View patient satisfaction reports</p>
          </motion.div>
          
          <motion.div 
            key="safety-reports"
            className="achievement-card"
            whileHover={{ y: -8, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="achievement-icon">
              <FiShield />
            </div>
            <h3>Safety Reports</h3>
            <p>Access incident logs and safety protocols</p>
          </motion.div>
          
          <motion.div 
            key="growth-analytics"
            className="achievement-card"
            whileHover={{ y: -8, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="achievement-icon">
              <FiBarChart2 />
            </div>
            <h3>Growth Analytics</h3>
            <p>Track hospital performance metrics</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StaffDashboard;