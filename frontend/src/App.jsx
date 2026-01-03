import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ApplicationForm from './pages/ApplicationForm';
import UnifiedLogin from './pages/UnifiedLogin';
import AdminDashboard from './pages/AdminDashboard';
import FranchiseeDashboard from './pages/FranchiseeDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/login" element={<UnifiedLogin />} />
        {/* Legacy routes redirect to unified login */}
        <Route path="/admin/login" element={<Navigate to="/login" />} />
        <Route path="/franchisee/login" element={<Navigate to="/login" />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/franchisee/*" element={<FranchiseeDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
