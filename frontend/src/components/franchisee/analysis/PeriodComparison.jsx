import React from 'react';

export default function PeriodComparison({ comparisonData }) {
  if (!comparisonData) return null;

  return (
    <div className="mt-6 grid md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h5 className="text-sm font-semibold text-gray-600 mb-2">Period 1</h5>
        <p className="text-2xl font-bold text-gray-900">
          ₹{comparisonData.period1.total.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Avg: ₹{comparisonData.period1.avg.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">{comparisonData.period1.count} days</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h5 className="text-sm font-semibold text-gray-600 mb-2">Period 2</h5>
        <p className="text-2xl font-bold text-gray-900">
          ₹{comparisonData.period2.total.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Avg: ₹{comparisonData.period2.avg.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">{comparisonData.period2.count} days</p>
      </div>

      <div className={`bg-gradient-to-br p-4 rounded-lg border ${
        comparisonData.difference.total >= 0
          ? 'from-green-50 to-emerald-50 border-green-200'
          : 'from-red-50 to-rose-50 border-red-200'
      }`}>
        <h5 className="text-sm font-semibold text-gray-600 mb-2">Difference</h5>
        <p className={`text-2xl font-bold ${
          comparisonData.difference.total >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {comparisonData.difference.total >= 0 ? '+' : ''}₹
          {Math.abs(comparisonData.difference.total).toLocaleString()}
        </p>
        <p className={`text-sm font-medium ${
          comparisonData.difference.total >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {comparisonData.difference.percentage >= 0 ? '+' : ''}
          {comparisonData.difference.percentage}%
        </p>
      </div>
    </div>
  );
}
