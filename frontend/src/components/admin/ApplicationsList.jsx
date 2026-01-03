import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ApplicationModal from './ApplicationModal';
import ConfirmModal from '../common/ConfirmModal';
import SuccessModal from '../common/SuccessModal';
import API_BASE_URL from '../../config/api';

export default function ApplicationsList({ applicants, fetchApplicants }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, email: null, name: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, type: null, data: null });

  // Handle filter from dashboard navigation
  useEffect(() => {
    if (location.state?.filterStatus) {
      setActiveTab(location.state.filterStatus);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
  const handleActionClick = (email, action, name) => {
    setConfirmModal({
      isOpen: true,
      action,
      email,
      name
    });
  };

  const handleConfirmAction = async () => {
    const { email, action } = confirmModal;
    setLoading(true);

    try {
      let endpoint = '';
      
      if (action === 'accept') {
        endpoint = '/admin/acceptApplicant';
        await axios.post(`${API_BASE_URL}${endpoint}`, { email });
        await fetchApplicants();
        setSelectedApp(null);
        setConfirmModal({ isOpen: false, action: null, email: null, name: '' });
        setSuccessModal({ isOpen: true, type: 'accepted', data: null });
      } else if (action === 'reject') {
        endpoint = '/admin/rejectApplicant';
        await axios.post(`${API_BASE_URL}${endpoint}`, { email });
        await fetchApplicants();
        setSelectedApp(null);
        setConfirmModal({ isOpen: false, action: null, email: null, name: '' });
        setSuccessModal({ isOpen: true, type: 'rejected', data: null });
      } else if (action === 'grant') {
        // Grant and create credentials
        const response = await axios.post(`${API_BASE_URL}/admin/grantApplicant`, { email });
        
        if (response.data.stat) {
          await fetchApplicants();
          setSelectedApp(null);
          setConfirmModal({ isOpen: false, action: null, email: null, name: '' });
          
          // Check if email was sent successfully
          if (response.data.emailSent) {
            // Email sent successfully - show simple success message
            setSuccessModal({ 
              isOpen: true, 
              type: 'granted-email', 
              data: { email }
            });
          } else if (response.data.password) {
            // Email failed but we have credentials - show them as fallback
            setSuccessModal({ 
              isOpen: true, 
              type: 'granted', 
              data: {
                email: response.data.email,
                password: response.data.password,
                emailFailed: true
              }
            });
          } else {
            throw new Error('Failed to generate credentials');
          }
        } else {
          throw new Error('Failed to grant franchise');
        }
      }
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
                              onClick={() => handleActionClick(app.email, 'accept', `${app.fname} ${app.lname}`)}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleActionClick(app.email, 'reject', `${app.fname} ${app.lname}`)}
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
                              onClick={() => handleActionClick(app.email, 'grant', `${app.fname} ${app.lname}`)}
                              disabled={loading}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              Grant
                            </button>
                            <button
                              onClick={() => handleActionClick(app.email, 'reject', `${app.fname} ${app.lname}`)}
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
        onAction={handleActionClick}
        loading={loading}
      />

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, email: null, name: '' })}
        onConfirm={handleConfirmAction}
        action={confirmModal.action}
        applicantName={confirmModal.name}
        loading={loading}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, type: null, data: null })}
        type={successModal.type}
        data={successModal.data}
      />
    </div>
  );
}
