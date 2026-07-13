# HealthNet Frontend

Welcome to the **HealthNet** frontend repository! This is a modern React application built to provide a seamless healthcare management experience for patients, doctors, staff, and administrators.

## Features

- **Role-Based Portals:** Dedicated dashboards and interfaces for Patients, Doctors, Staff, and Admins.
- **Appointment Management:** Intuitive booking, tracking, and cancellation UI for patients and doctors.
- **Medical Records Management:** Secure access to medical records, attachments, and lab results, including an audit trail.
- **Live Chat:** Real-time messaging service for patient-doctor communication.
- **Department & Staff Management:** Optimized UI for administrators and staff to manage departments, staff roles, and subscriptions.
- **Multi-Tab Session Management:** Advanced session control ensuring data consistency and conflict resolution when multiple tabs are open.
- **Subscriptions:** Dedicated subscription page and workflow integrations.

## Technology Stack

- **Framework:** React.js
- **Styling:** CSS Modules / Styled Components (Check `src/styles` for custom stylesheets)
- **Deployment:** Pre-configured for deployment on Heroku

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ZERO-70/Healthnet-frontend.git
   cd Healthnet-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Variables

API base URL configuration can be found and modified in `src/constants/api.js`. 
For local development, it defaults to `http://localhost:8081`. 
For production, it points to the Heroku deployed backend.

## Project Structure

- `src/components`: Reusable UI components (LiveChat, MedicalRecordForm, AvailableDoctors, etc.)
- `src/pages`: Top-level routing pages (PatientPortal, DoctorPortal, AdminPortal, etc.)
- `src/services`: API service classes and session management logic
- `src/styles`: CSS files for styling components and pages
- `src/constants`: Application-wide constants, including API endpoints
- `src/utils`: Helper functions and utilities

## Deployment

To create an optimized production build:

```bash
npm run build
```

This will build the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## License

This project is proprietary and intended for use within the HealthNet system.
