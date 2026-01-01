import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, TrendingUp, LogOut, Award, DollarSign, Calendar as CalendarIcon
} from 'lucide-react';
import API_BASE_URL from '../config/api';

function FranchiseeDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const email = localStorage.getItem('email');

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'franchisee') {
      navigate('/franchisee/login');
    } else {
      fetchProfile();
      fetchSalesData();
    }
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/franchisee/profile`);
      if (response.data.stat) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, { email });
      if (response.data.stat) {
        setSalesData(response.data.doc);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    navigate('/franchisee/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-green-600 to-teal-700 text-white">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Award size={32} />
            <span className="text-xl font-bold">FranchiseHub</span>
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/franchisee/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/franchisee/sales"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              <TrendingUp size={20} />
              <span>Sales</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="dashboard" element={<Dashboard profile={profile} salesData={salesData} />} />
          <Route path="sales" element={<Sales email={email} salesData={salesData} fetchSalesData={fetchSalesData} />} />
          <Route path="*" element={<Dashboard profile={profile} salesData={salesData} />} />
        </Routes>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ profile, salesData }) {
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
  const avgRevenue = salesData.length > 0 ? (totalRevenue / salesData.length).toFixed(2) : 0;
  const recentSales = salesData.slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        {profile && (
          <p className="text-gray-600 mt-2">
            {profile.fname} {profile.lname} • {profile.site_city}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Revenue</span>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Average Daily</span>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${avgRevenue}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Days</span>
            <CalendarIcon className="text-purple-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {salesData.length}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h2>
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div key={sale._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">
                  {new Date(sale.dos).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-gray-600">{new Date(sale.dos).toLocaleDateString()}</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${sale.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {salesData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>No sales data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sales Component
function Sales({ email, salesData, fetchSalesData }) {
  const [formData, setFormData] = useState({
    dos: new Date().toISOString().split('T')[0],
    revenue: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/addSales`, {
        email,
        dos: formData.dos,
        revenue: parseFloat(formData.revenue)
      });

      if (response.data.stat) {
        alert('Sales data added successfully!');
        setFormData({ dos: new Date().toISOString().split('T')[0], revenue: '' });
        fetchSalesData();
      } else {
        alert(response.data.msg || 'Failed to add sales data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding sales data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Management</h1>

      {/* Add Sales Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Daily Sales</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.dos}
                onChange={(e) => setFormData({ ...formData, dos: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                required
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Sales Data'}
          </button>
        </form>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(sale.dos).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                    ${sale.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salesData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>No sales data yet. Add your first entry above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FranchiseeDashboard;
