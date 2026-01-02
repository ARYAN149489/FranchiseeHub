import { FileText, Clock, CheckCircle, Award } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function DashboardOverview({ applicants }) {
  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    granted: applicants.filter(a => a.status === 'granted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Applications</span>
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Pending</span>
            <Clock className="text-orange-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Accepted</span>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Granted</span>
            <Award className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.granted}</div>
        </div>
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
