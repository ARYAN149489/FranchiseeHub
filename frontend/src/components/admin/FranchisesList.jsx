import { useState } from 'react';
import { Users, Mail, Phone, MapPin, Eye } from 'lucide-react';
import FranchiseDetailModal from './FranchiseDetailModal';

export default function FranchisesList({ applicants }) {
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const grantedFranchisees = applicants.filter(a => a.status === 'granted');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Franchises</h1>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
          {grantedFranchisees.length} Active
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {grantedFranchisees.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grantedFranchisees.map((franchisee) => (
              <div 
                key={franchisee._id} 
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                {/* Avatar and Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {franchisee.fname.charAt(0)}{franchisee.lname.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">
                      {franchisee.fname} {franchisee.lname}
                    </div>
                    <div className="text-sm text-gray-600">{franchisee.site_city}</div>
                  </div>
                </div>

                {/* Business Info */}
                {franchisee.buis_name && (
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Business</div>
                    <div className="text-sm font-medium text-gray-900">{franchisee.buis_name}</div>
                  </div>
                )}

                {/* Contact Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="truncate">{franchisee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="flex-shrink-0" />
                    <span>{franchisee.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{franchisee.site_address}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Area</div>
                    <div className="font-semibold text-gray-900">{franchisee.area_sqft} sq ft</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Ownership</div>
                    <div className="font-semibold text-gray-900">{franchisee.ownership}</div>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedFranchise(franchisee)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Eye size={16} />
                  View Sales Data
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Users size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No active franchises yet</p>
            <p className="text-sm mt-2">Franchises will appear here once applications are granted</p>
          </div>
        )}
      </div>

      {/* Franchise Detail Modal */}
      <FranchiseDetailModal
        franchise={selectedFranchise}
        onClose={() => setSelectedFranchise(null)}
      />
    </div>
  );
}
