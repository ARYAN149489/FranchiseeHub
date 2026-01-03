import { X, AlertTriangle, CheckCircle, XCircle, Award } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, action, applicantName, loading }) {
  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'accept':
        return {
          icon: <CheckCircle className="text-green-600" size={48} />,
          title: 'Accept Application',
          message: `Are you sure you want to accept the application from ${applicantName}? This will move them to the accepted stage.`,
          confirmText: 'Yes, Accept',
          confirmClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'reject':
        return {
          icon: <XCircle className="text-red-600" size={48} />,
          title: 'Reject Application',
          message: `Are you sure you want to reject the application from ${applicantName}? This action cannot be undone.`,
          confirmText: 'Yes, Reject',
          confirmClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'grant':
        return {
          icon: <Award className="text-blue-600" size={48} />,
          title: 'Grant Franchise',
          message: `Are you sure you want to grant franchise access to ${applicantName}? This will create login credentials and activate their account.`,
          confirmText: 'Yes, Grant Access',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          icon: <AlertTriangle className="text-yellow-600" size={48} />,
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          confirmClass: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              {config.icon}
            </div>
            <p className="text-gray-700 leading-relaxed">
              {config.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmClass}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                config.confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
