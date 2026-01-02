// API Configuration using environment variables
const PRODUCTION_API = import.meta.env.VITE_API_URL || 'https://franchiseehub.onrender.com';
const DEVELOPMENT_API = import.meta.env.VITE_API_URL || 'http://localhost:2016';

const API_BASE_URL = import.meta.env.MODE === 'production' ? PRODUCTION_API : DEVELOPMENT_API;

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FranchiseHub';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🚀 API Mode:', import.meta.env.MODE);
  console.log('🌐 API URL:', API_BASE_URL);
  console.log('📦 App Version:', APP_VERSION);
}

export { API_BASE_URL };
export default API_BASE_URL;
