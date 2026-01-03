import { FileText, Clock, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export default function DashboardOverview({ applicants }) {
  const navigate = useNavigate();
  
  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    granted: applicants.filter(a => a.status === 'granted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const handleStatusClick = (status) => {
    // Navigate to applications page with status filter
    navigate('/admin/applications', { state: { filterStatus: status } });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Dashboard Overview</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <button
          onClick={() => handleStatusClick('all')}
          className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base text-gray-600">Total Applications</span>
            <FileText className="text-blue-600 flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{stats.total}</div>
          <div className="text-xs text-blue-600 mt-2">Click to view all →</div>
        </button>

        <button
          onClick={() => handleStatusClick('pending')}
          className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base text-gray-600">Pending</span>
            <Clock className="text-orange-600 flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-orange-600 break-words">{stats.pending}</div>
          <div className="text-xs text-orange-600 mt-2">Click to view pending →</div>
        </button>

        <button
          onClick={() => handleStatusClick('accepted')}
          className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base text-gray-600">Accepted</span>
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600 break-words">{stats.accepted}</div>
          <div className="text-xs text-green-600 mt-2">Click to view accepted →</div>
        </button>

        <button
          onClick={() => handleStatusClick('granted')}
          className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base text-gray-600">Granted</span>
            <Award className="text-blue-600 flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 break-words">{stats.granted}</div>
          <div className="text-xs text-blue-600 mt-2">Click to view granted →</div>
        </button>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {applicants.slice(0, 5).map((app) => (
            <div key={app._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold text-gray-900">{app.fname} {app.lname}</div>
                <div className="text-sm text-gray-600">{app.email} • {app.site_city}</div>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
          {applicants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No applications yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
