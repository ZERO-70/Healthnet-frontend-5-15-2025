import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiUserPlus, FiHeart, FiActivity, FiCalendar, FiShield, FiLock, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { FaRegHospital } from 'react-icons/fa';
import logo from '../assets/images/logo.svg';
import '../styles/HomePage.css';

const HomePage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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

  return (
    <motion.div 
      className="home-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="home-header">
        <div className="logo-container">
          <FaRegHospital className="logo-icon" />
          <h1>HealthNet</h1>
        </div>
        <nav className="home-nav">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="#features" className="nav-link">Features</Link>
          <Link to="#portals" className="nav-link">Portals</Link>
          <Link to="#about" className="nav-link">About Us</Link>
        </nav>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-secondary">
            <FiLogIn className="btn-icon" /> Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            <FiUserPlus className="btn-icon" /> Register
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <motion.div className="hero-content" variants={itemVariants}>
          <h1>Healthcare Made Simple</h1>
          <p className="hero-subtitle">
            A comprehensive platform for patients and healthcare providers to manage medical care efficiently
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started <FiArrowRight className="btn-icon" />
            </Link>
            <Link to="#features" className="btn btn-outline btn-large">
              Learn More
            </Link>
          </div>
        </motion.div>
        <motion.div className="hero-image" variants={itemVariants}>
          <div className="image-placeholder">
            <FiHeart className="placeholder-icon" />
          </div>
        </motion.div>
      </section>

      <section id="features" className="features-section">
        <motion.h2 className="section-title" variants={itemVariants}>
          Key Features
        </motion.h2>
        <motion.p className="section-subtitle" variants={itemVariants}>
          Designed to improve healthcare experience for all
        </motion.p>
        
        <motion.div className="features-grid" variants={itemVariants}>
          <div className="feature-item">
            <div className="feature-icon">
              <FiCalendar />
            </div>
            <h3>Appointment Management</h3>
            <p>
              Schedule, reschedule, and cancel appointments with ease. Receive timely reminders and notifications for upcoming consultations.
            </p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <FiActivity />
            </div>
            <h3>Health Monitoring</h3>
            <p>
              Track vital health metrics and receive insights about your health progress. Monitor trends and stay informed about your wellbeing.
            </p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <FiHeart />
            </div>
            <h3>Medical Records</h3>
            <p>
              Secure access to your complete medical history, test results, and prescriptions. All your health information in one place.
            </p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <FiShield />
            </div>
            <h3>Data Security</h3>
            <p>
              Enterprise-grade security ensuring your medical data remains private and protected according to healthcare compliance standards.
            </p>
          </div>
        </motion.div>
      </section>

      <section id="portals" className="portals-section">
        <motion.h2 className="section-title" variants={itemVariants}>
          One System, Multiple Portals
        </motion.h2>
        <motion.p className="section-subtitle" variants={itemVariants}>
          Access the right portal with a single secure login
        </motion.p>
        
        <motion.div className="portal-login-card" variants={itemVariants}>
          <div className="login-card-content">
            <h3>Unified Access System</h3>
            <p>
              Our intelligent platform automatically directs you to your appropriate portal based on your credentials.
              Whether you're a patient, doctor, staff member, or administrator, you'll use the same login page.
            </p>
            <Link to="/login" className="btn btn-primary">
              <FiLock className="btn-icon" /> Secure Login
            </Link>
          </div>
        </motion.div>
        
        <motion.div className="portals-grid" variants={itemVariants}>
          <motion.div 
            className="portal-card"
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            <div className="portal-icon patient">
              <FiUser />
            </div>
            <h3>Patient Portal</h3>
            <p>
              Access your medical records, schedule appointments, and communicate with your healthcare providers all in one place.
            </p>
            <div className="portal-features">
              <span>Medical Records</span>
              <span>Appointments</span>
              <span>Prescriptions</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="portal-card"
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            <div className="portal-icon doctor">
              <FiUserPlus />
            </div>
            <h3>Doctor Portal</h3>
            <p>
              Manage patient appointments, access medical records, and streamline your practice workflow efficiently.
            </p>
            <div className="portal-features">
              <span>Patient Management</span>
              <span>Schedule</span>
              <span>Prescriptions</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="portal-card"
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            <div className="portal-icon staff">
              <FiActivity />
            </div>
            <h3>Staff Portal</h3>
            <p>
              Handle administrative tasks, manage patient information, and coordinate facility resources effectively.
            </p>
            <div className="portal-features">
              <span>Administration</span>
              <span>Scheduling</span>
              <span>Resources</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="portal-card"
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            <div className="portal-icon admin">
              <FiShield />
            </div>
            <h3>Admin Portal</h3>
            <p>
              Oversee system operations, manage user accounts, and configure system settings with comprehensive controls.
            </p>
            <div className="portal-features">
              <span>User Management</span>
              <span>System Config</span>
              <span>Analytics</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="cta-section">
        <motion.div className="cta-content" variants={itemVariants}>
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of patients and healthcare providers already using HealthNet to revolutionize their healthcare experience.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Create an Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaRegHospital className="logo-icon" />
              <h3>HealthNet</h3>
            </div>
            <p>
              Transforming healthcare management with technology that connects patients, doctors, and healthcare facilities.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-link-group">
              <h4>Company</h4>
              <Link to="#about">About Us</Link>
              <Link to="#team">Our Team</Link>
              <Link to="#careers">Careers</Link>
              <Link to="#contact">Contact Us</Link>
            </div>
            
            <div className="footer-link-group">
              <h4>Resources</h4>
              <Link to="#blog">Blog</Link>
              <Link to="#faq">FAQ</Link>
              <Link to="#support">Support</Link>
              <Link to="#documentation">Documentation</Link>
            </div>
            
            <div className="footer-link-group">
              <h4>Legal</h4>
              <Link to="#privacy">Privacy Policy</Link>
              <Link to="#terms">Terms of Service</Link>
              <Link to="#compliance">Compliance</Link>
              <Link to="#security">Security</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HealthNet. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default HomePage; 