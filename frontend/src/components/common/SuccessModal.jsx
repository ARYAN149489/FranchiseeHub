import { X, CheckCircle, Copy, Mail, Key } from 'lucide-react';
import { useState } from 'react';

export default function SuccessModal({ isOpen, onClose, type, data }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = `Franchise Access Granted\n\nEmail: ${data.email}\nPassword: ${data.password}\n\nPlease keep these credentials safe.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getContent = () => {
    switch (type) {
      case 'granted-email':
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: '🎉 Franchise Granted Successfully!',
          subtitle: 'Login credentials have been sent to the franchisee\'s email',
        };
      case 'granted':
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: '🎉 Franchise Granted Successfully!',
          subtitle: data?.emailFailed ? 'Email failed - Please share these credentials manually' : 'Login credentials have been created',
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: '✅ Application Accepted!',
          subtitle: 'The applicant has been moved to accepted status',
        };
      case 'rejected':
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: 'Application Rejected',
          subtitle: 'The application has been rejected',
        };
      default:
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: 'Success!',
          subtitle: 'Action completed successfully',
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Success</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 animate-bounce">
              {content.icon}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {content.title}
            </h4>
            <p className="text-gray-600">
              {content.subtitle}
            </p>
          </div>

          {/* Email Sent Confirmation (for granted-email) */}
          {type === 'granted-email' && data && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4 text-green-900">
                <Mail size={20} />
                <span className="font-semibold">Email Sent Successfully</span>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  📧 Credentials have been sent to:
                </div>
                <div className="font-mono font-semibold text-gray-900 break-all">
                  {data.email}
                </div>
              </div>

              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  ✅ The franchisee will receive their login credentials via email within a few minutes.
                </p>
              </div>
            </div>
          )}

          {/* Credentials Section (only for granted with credentials) */}
          {type === 'granted' && data && data.password && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              {data.emailFailed && (
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-900">
                    ⚠️ Email delivery failed. Please share these credentials manually.
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4 text-blue-900">
                <Key size={20} />
                <span className="font-semibold">Login Credentials</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail size={16} />
                    <span>Email</span>
                  </div>
                  <div className="font-mono font-semibold text-gray-900 break-all">
                    {data.email}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Key size={16} />
                    <span>Password</span>
                  </div>
                  <div className="font-mono font-semibold text-gray-900 break-all">
                    {data.password}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Copy size={18} />
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>

              <p className="text-xs text-blue-900 mt-3 text-center">
                ⚠️ Please save these credentials and share them with the franchisee
              </p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
