// API Configuration using environment variables

// Get API URL from environment variables
const getApiUrl = () => {
  // First priority: VITE_API_URL from environment
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Second priority: Check if we're in production mode
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    // Production fallback URL
    return 'https://franchiseehub-backend.onrender.com';
  }
  
  // Development fallback
  return 'http://localhost:2016';
};

const API_BASE_URL = getApiUrl();

// Remove trailing slash if present
const cleanUrl = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL.slice(0, -1) 
  : API_BASE_URL;

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FranchiseeHub';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';
export const IS_PRODUCTION = import.meta.env.MODE === 'production' || import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development' || import.meta.env.DEV;

// Log configuration in development
if (IS_DEVELOPMENT) {
  console.log('🚀 API Configuration:');
  console.log('   Mode:', import.meta.env.MODE);
  console.log('   API URL:', cleanUrl);
  console.log('   App Name:', APP_NAME);
  console.log('   Version:', APP_VERSION);
  console.log('   Production:', IS_PRODUCTION);
}

// Validate API URL
if (!cleanUrl || cleanUrl === 'undefined') {
  console.error('❌ API URL is not configured properly!');
  console.error('   Please set VITE_API_URL in your environment variables');
}

export { cleanUrl as API_BASE_URL };
export default cleanUrl;
