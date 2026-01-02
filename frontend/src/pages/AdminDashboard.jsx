import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/layout/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import ApplicationsList from '../components/admin/ApplicationsList';
import FranchisesList from '../components/admin/FranchisesList';
import API_BASE_URL from '../config/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    // Fetch applicants
    fetchApplicants();
  }, [navigate]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/allApplicants`);
      if (response.data.status) {
        setApplicants(response.data.doc || []);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      // Show error notification but don't navigate away
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route 
            path="/" 
            element={<DashboardOverview applicants={applicants} />} 
          />
          <Route 
            path="/applications" 
            element={<ApplicationsList applicants={applicants} fetchApplicants={fetchApplicants} />} 
          />
          <Route 
            path="/franchises" 
            element={<FranchisesList applicants={applicants} />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
