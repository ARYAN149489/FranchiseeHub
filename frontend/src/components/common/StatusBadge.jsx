// Status Badge Component
const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  granted: {
    label: 'Granted',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
