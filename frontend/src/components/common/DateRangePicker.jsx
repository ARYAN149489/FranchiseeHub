import React from 'react';

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange, 
  onSearch, 
  disabled = false 
}) {
  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={onStartChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={onEndChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      <button
        onClick={onSearch}
        disabled={disabled || !startDate || !endDate}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium transition-colors"
      >
        Search
      </button>
    </div>
  );
}
