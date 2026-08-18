// API Constants for the HealthNet application
//
// The base URL comes from REACT_APP_API_BASE_URL so the same build config works
// across environments. Create-React-App inlines this at build time, so set it
// before `npm run build` (see .env.example).
//
// Falls back to the local backend from docker-compose + `./mvnw spring-boot:run`.
export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
