import React from 'react';

export default function StatsCard({ label, value, color = 'gray' }) {
  const colorClasses = {
    green: 'from-green-50 to-emerald-50 border-green-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200',
    gray: 'from-gray-50 to-slate-50 border-gray-200'
  };

  return (
    <div className={`bg-gradient-to-br p-4 rounded-lg border ${colorClasses[color] || colorClasses.gray}`}>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
