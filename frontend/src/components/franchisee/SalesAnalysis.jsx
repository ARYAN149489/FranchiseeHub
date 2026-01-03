import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SalesAnalysis({ email }) {
  const [viewType, setViewType] = useState('week'); // week, month, year, custom
  const [chartType, setChartType] = useState('bar'); // bar, line
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, avg: 0, max: 0, min: 0, count: 0 });
  
  // Comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState('period'); // period, week, month, year
  const [comparisonRange1, setComparisonRange1] = useState({ start: '', end: '' });
  const [comparisonRange2, setComparisonRange2] = useState({ start: '', end: '' });
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    if (viewType !== 'custom') {
      fetchSalesData();
    }
  }, [viewType, email]);

  const fetchSalesData = async (customStart = null, customEnd = null) => {
    setLoading(true);
    try {
      let start, end;
      
      if (customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
      } else {
        const today = new Date();
        switch (viewType) {
          case 'week':
            start = startOfWeek(today);
            end = endOfWeek(today);
            break;
          case 'month':
            start = startOfMonth(today);
            end = endOfMonth(today);
            break;
          case 'year':
            start = startOfYear(today);
            end = endOfYear(today);
            break;
          default:
            start = startOfWeek(today);
            end = endOfWeek(today);
        }
      }

      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, {
        email,
        start: start.toISOString(),
        end: end.toISOString()
      });

      if (response.data.stat && response.data.doc) {
        const data = response.data.doc;
        setSalesData(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ total: 0, avg: 0, max: 0, min: 0, count: 0 });
      return;
    }

    const sales = data.map(d => d.sale || 0);
    const total = sales.reduce((sum, val) => sum + val, 0);
    const avg = total / sales.length;
    const max = Math.max(...sales);
    const min = Math.min(...sales);

    setStats({
      total: total.toFixed(2),
      avg: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      count: data.length
    });
  };

  const handleCustomSearch = () => {
    if (dateRange.start && dateRange.end) {
      fetchSalesData(dateRange.start, dateRange.end);
    }
  };

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const [response1, response2] = await Promise.all([
        axios.post(`${API_BASE_URL}/franchisee/getSales`, {
          email,
          start: new Date(comparisonRange1.start).toISOString(),
          end: new Date(comparisonRange1.end).toISOString()
        }),
        axios.post(`${API_BASE_URL}/franchisee/getSales`, {
          email,
          start: new Date(comparisonRange2.start).toISOString(),
          end: new Date(comparisonRange2.end).toISOString()
        })
      ]);

      const data1 = response1.data.stat ? response1.data.doc : [];
      const data2 = response2.data.stat ? response2.data.doc : [];

      const total1 = data1.reduce((sum, d) => sum + (d.sale || 0), 0);
      const total2 = data2.reduce((sum, d) => sum + (d.sale || 0), 0);
      const avg1 = data1.length > 0 ? total1 / data1.length : 0;
      const avg2 = data2.length > 0 ? total2 / data2.length : 0;

      setComparisonData({
        period1: { total: total1, avg: avg1, count: data1.length },
        period2: { total: total2, avg: avg2, count: data2.length },
        difference: {
          total: total2 - total1,
          avg: avg2 - avg1,
          percentage: total1 > 0 ? ((total2 - total1) / total1 * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = salesData.map(sale => ({
    date: format(new Date(sale.dos), 'MMM dd'),
    sales: sale.sale || 0,
    customers: sale.customers || 0,
    orders: sale.orders || 0
  }));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <TrendingUp size={32} />
            <div>
              <h1 className="text-3xl font-bold">Sales Analysis</h1>
              <p className="text-indigo-100 mt-1">Visualize and analyze your sales performance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg p-8">
          {/* View Type Selection */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Range' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setViewType(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewType === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            {viewType === 'custom' && (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleCustomSearch}
                  disabled={!dateRange.start || !dateRange.end}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium"
                >
                  Search
                </button>
              </div>
            )}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg font-medium ${
                chartType === 'bar' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg font-medium ${
                chartType === 'line' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Line Chart
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">₹{parseFloat(stats.total).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-medium">Average</p>
              <p className="text-2xl font-bold text-gray-900">₹{parseFloat(stats.avg).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 font-medium">Highest</p>
              <p className="text-2xl font-bold text-gray-900">₹{parseFloat(stats.max).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 font-medium">Lowest</p>
              <p className="text-2xl font-bold text-gray-900">₹{parseFloat(stats.min).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
          </div>

          {/* Chart */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8b5cf6" name="Sales (₹)" />
                    <Bar dataKey="customers" fill="#3b82f6" name="Customers" />
                    <Bar dataKey="orders" fill="#10b981" name="Orders" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Sales (₹)" />
                    <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} name="Customers" />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg">No sales data available for the selected period</p>
            </div>
          )}

          {/* Comparison Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
            >
              <ArrowUpDown size={20} />
              {showComparison ? 'Hide' : 'Show'} Period Comparison
            </button>

            {showComparison && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Compare Two Periods</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Period 1</h4>
                    <input
                      type="date"
                      value={comparisonRange1.start}
                      onChange={(e) => setComparisonRange1({ ...comparisonRange1, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={comparisonRange1.end}
                      onChange={(e) => setComparisonRange1({ ...comparisonRange1, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="End Date"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Period 2</h4>
                    <input
                      type="date"
                      value={comparisonRange2.start}
                      onChange={(e) => setComparisonRange2({ ...comparisonRange2, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={comparisonRange2.end}
                      onChange={(e) => setComparisonRange2({ ...comparisonRange2, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="End Date"
                    />
                  </div>
                </div>

                <button
                  onClick={fetchComparisonData}
                  disabled={!comparisonRange1.start || !comparisonRange1.end || !comparisonRange2.start || !comparisonRange2.end}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
                >
                  Compare Periods
                </button>

                {/* Comparison Results */}
                {comparisonData && (
                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">Period 1</h5>
                      <p className="text-2xl font-bold text-gray-900">₹{comparisonData.period1.total.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Avg: ₹{comparisonData.period1.avg.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{comparisonData.period1.count} days</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">Period 2</h5>
                      <p className="text-2xl font-bold text-gray-900">₹{comparisonData.period2.total.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Avg: ₹{comparisonData.period2.avg.toFixed(2)}</p>
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
                        {comparisonData.difference.total >= 0 ? '+' : ''}₹{Math.abs(comparisonData.difference.total).toLocaleString()}
                      </p>
                      <p className={`text-sm font-medium ${
                        comparisonData.difference.total >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparisonData.difference.percentage >= 0 ? '+' : ''}{comparisonData.difference.percentage}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
