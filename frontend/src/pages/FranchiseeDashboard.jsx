import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FranchiseeSidebar from '../components/layout/FranchiseeSidebar';
import DashboardOverview from '../components/franchisee/DashboardOverview';
import SalesManagement from '../components/franchisee/SalesManagement';
import API_BASE_URL from '../config/api';

function FranchiseeDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('email');

  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    if (userType !== 'franchisee' || !email) {
      navigate('/franchisee/login');
      return;
    }

    // Fetch data
    fetchProfile();
    fetchSalesData();
  }, [navigate, email]);

  const fetchProfile = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/profile`, { email });
      if (response.data.stat) {
        setProfile(response.data.doc);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, { email });
      if (response.data.stat) {
        setSalesData(response.data.doc || []);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <FranchiseeSidebar profile={profile} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route 
            path="/" 
            element={<DashboardOverview profile={profile} salesData={salesData} />} 
          />
          <Route 
            path="/sales" 
            element={<SalesManagement email={email} salesData={salesData} fetchSalesData={fetchSalesData} />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default FranchiseeDashboard;
