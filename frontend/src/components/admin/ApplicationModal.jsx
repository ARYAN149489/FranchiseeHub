import { X, Mail, MapPin, Calendar } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ApplicationModal({ application, onClose, onAction, loading }) {
  if (!application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Applicant Details</h2>
            <p className="text-blue-100 text-sm">Complete application information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Mail size={18} className="text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">First Name</div>
                <div className="text-sm font-medium text-gray-900">{application.fname}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Last Name</div>
                <div className="text-sm font-medium text-gray-900">{application.lname}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Email</div>
                <div className="text-sm font-medium text-gray-900">{application.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Phone</div>
                <div className="text-sm font-medium text-gray-900">{application.phone || 'N/A'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 font-semibold uppercase">Residential Address</div>
                <div className="text-sm font-medium text-gray-900">{application.res_address || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              Business & Location Details
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="col-span-2">
                <div className="text-xs text-gray-500 font-semibold uppercase">Business Name</div>
                <div className="text-sm font-medium text-gray-900">{application.buis_name || 'N/A'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 font-semibold uppercase">Site Address</div>
                <div className="text-sm font-medium text-gray-900">{application.site_address}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">City</div>
                <div className="text-sm font-medium text-gray-900">{application.site_city}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Postal Code</div>
                <div className="text-sm font-medium text-gray-900">{application.site_postal}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Area (sq ft)</div>
                <div className="text-sm font-medium text-gray-900">{application.area_sqft}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Floor</div>
                <div className="text-sm font-medium text-gray-900">{application.site_floor || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase">Ownership</div>
                <div className="text-sm font-medium text-gray-900">{application.ownership}</div>
              </div>
            </div>
          </div>

          {/* Application Information */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Application Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Date Applied</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(application.doa).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={application.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end border-t pt-4">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => onAction(application.email, 'accept')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => onAction(application.email, 'reject')}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </>
            )}
            {application.status === 'accepted' && (
              <>
                <button
                  onClick={() => onAction(application.email, 'grant')}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Grant Franchise'}
                </button>
                <button
                  onClick={() => onAction(application.email, 'reject')}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
