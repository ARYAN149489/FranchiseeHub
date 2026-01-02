import { useState } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ApplicationModal from './ApplicationModal';
import API_BASE_URL from '../../config/api';

export default function ApplicationsList({ applicants, fetchApplicants }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter applications
  const filteredApps = applicants.filter(app => {
    const matchesSearch = 
      app.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.site_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.buis_name && app.buis_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      activeTab === 'all' || app.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Handle actions (accept, reject, grant)
  const handleAction = async (email, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      
      if (action === 'accept') {
        endpoint = '/admin/acceptApplicant';
        await axios.post(`${API_BASE_URL}${endpoint}`, { email });
      } else if (action === 'reject') {
        endpoint = '/admin/rejectApplicant';
        await axios.post(`${API_BASE_URL}${endpoint}`, { email });
      } else if (action === 'grant') {
        // Grant and create credentials
        await axios.post(`${API_BASE_URL}/admin/grantApplicant`, { email });
        await axios.post(`${API_BASE_URL}/admin/saveFranchiseCred`, { email });
      }
      
      await fetchApplicants();
      setSelectedApp(null);
      alert(`Application ${action}ed successfully!`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${action} application. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { key: 'all', label: 'All', count: applicants.length },
    { key: 'pending', label: 'Pending', count: applicants.filter(a => a.status === 'pending').length },
    { key: 'accepted', label: 'Accepted', count: applicants.filter(a => a.status === 'accepted').length },
    { key: 'granted', label: 'Granted', count: applicants.filter(a => a.status === 'granted').length },
    { key: 'rejected', label: 'Rejected', count: applicants.filter(a => a.status === 'rejected').length },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Franchise Applications</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, business, or city..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {app.fname} {app.lname}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.buis_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.site_city}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(app.doa).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(app.email, 'accept')}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleAction(app.email, 'reject')}
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleAction(app.email, 'grant')}
                              disabled={loading}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Grant
                            </button>
                            <button
                              onClick={() => handleAction(app.email, 'reject')}
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(app.status === 'granted' || app.status === 'rejected') && (
                          <span className="text-xs text-gray-500">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No applications match your search.' : 'No applications found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onAction={handleAction}
        loading={loading}
      />
    </div>
  );
}
