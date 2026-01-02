import { useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';
import API_BASE_URL from '../../config/api';

export default function SalesManagement({ email, salesData, fetchSalesData }) {
  const [formData, setFormData] = useState({
    dos: new Date().toISOString().split('T')[0],
    revenue: '',
    orders: '',
    items_sold: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email,
        dos: formData.dos,
        revenue: parseFloat(formData.revenue)
      };

      // Add optional fields if provided
      if (formData.orders) payload.orders = parseInt(formData.orders);
      if (formData.items_sold) payload.items_sold = parseInt(formData.items_sold);

      const response = await axios.post(`${API_BASE_URL}/franchisee/addSales`, payload);

      if (response.data.stat) {
        alert('Sales data added successfully!');
        setFormData({ 
          dos: new Date().toISOString().split('T')[0], 
          revenue: '',
          orders: '',
          items_sold: ''
        });
        fetchSalesData();
      } else {
        alert(response.data.msg || 'Failed to add sales data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Management</h1>

      {/* Add Sales Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Daily Sales</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dos}
                onChange={(e) => setFormData({ ...formData, dos: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                required
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orders
              </label>
              <input
                type="number"
                min="0"
                value={formData.orders}
                onChange={(e) => setFormData({ ...formData, orders: e.target.value })}
                placeholder="Number of orders"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Sold
              </label>
              <input
                type="number"
                min="0"
                value={formData.items_sold}
                onChange={(e) => setFormData({ ...formData, items_sold: e.target.value })}
                placeholder="Number of items"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Sales Data'}
          </button>
        </form>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
        </div>
        
        {salesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(sale.dos).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      ₹{sale.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">
                      {sale.orders || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">
                      {sale.items_sold || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <TrendingUp size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No sales data yet</p>
            <p className="text-sm mt-2">Add your first entry using the form above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
