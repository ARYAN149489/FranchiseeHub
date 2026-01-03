import { useState, useEffect } from 'react';
import { Calendar, Search, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SalesHistory({ email, selectedDate = null }) {
  const [searchDate, setSearchDate] = useState(selectedDate || '');
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    setSalesData(null);

    try {
      // Format dates for the query
      const startDate = new Date(searchDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(searchDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, {
        email,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      if (response.data.stat && response.data.doc && response.data.doc.length > 0) {
        setSalesData(response.data.doc[0]);
      } else {
        setError('No sales data found for this date');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Error fetching sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if selectedDate is provided
  useEffect(() => {
    if (selectedDate) {
      setSearchDate(selectedDate);
      handleSearch();
    }
  }, [selectedDate]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Calendar size={32} />
            <div>
              <h1 className="text-3xl font-bold">Sales History</h1>
              <p className="text-blue-100 mt-1">View sales data for any specific date</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg p-8">
          {/* Search Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchDate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transition-colors"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Sales Data Display */}
          {salesData && !loading && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Sales Data for {new Date(salesData.dos).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Total Sales */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Sales</p>
                      <p className="text-3xl font-bold text-gray-900">₹{salesData.sale?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Customers */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{salesData.customers || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{salesData.orders || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Items Sold */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-500 p-3 rounded-lg">
                      <Package className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Items Sold</p>
                      <p className="text-3xl font-bold text-gray-900">{salesData.items_sold || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Sale per Customer</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{salesData.customers > 0 ? (salesData.sale / salesData.customers).toFixed(2) : 0}
                    </p>
                  </div>
                  {salesData.orders > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Average Sale per Order</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{(salesData.sale / salesData.orders).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {salesData.items_sold > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Items per Customer</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(salesData.items_sold / salesData.customers).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {salesData.orders > 0 && salesData.items_sold > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Items per Order</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(salesData.items_sold / salesData.orders).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!salesData && !loading && !error && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg">Select a date to view sales history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
