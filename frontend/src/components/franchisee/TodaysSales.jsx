import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, DollarSign, Package, Users, TrendingUp, Save } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function TodaysSales({ email, onSaleAdded }) {
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];
  
  const initialDate = location.state?.selectedDate || today;
  
  const [formData, setFormData] = useState({
    dos: initialDate,
    sale: '',
    customers: '',
    orders: '',
    items_sold: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [existingSales, setExistingSales] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  const getDateRange = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let minDate, maxDate;
    
    if (currentDay <= 7) {
      // First week: allow previous month
      // Handle year boundary (January -> previous year December)
      if (currentMonth === 0) {
        minDate = new Date(currentYear - 1, 11, 1); // December of previous year
      } else {
        minDate = new Date(currentYear, currentMonth - 1, 1);
      }
    } else {
      minDate = new Date(currentYear, currentMonth, 1);
    }
    
    maxDate = now;
    
    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    fetchExistingSales();
  }, [email]);

  useEffect(() => {
    if (location.state?.selectedDate) {
      setFormData(prev => ({
        ...prev,
        dos: location.state.selectedDate
      }));
      setMessage({ type: '', text: '' });
    }
  }, [location.state?.selectedDate]);

  const fetchExistingSales = async () => {
    try {
      const { minDate, maxDate } = getDateRange();
      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, { 
        email,
        start: minDate,
        end: maxDate
      });
      if (response.data.stat) {
        const sales = response.data.doc || [];
        setExistingSales(sales);
        generateAvailableDates(sales);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };  const generateAvailableDates = (sales) => {
    // Create a set of dates that already have sales (in YYYY-MM-DD format)
    const salesDatesSet = new Set(
      sales.map(sale => {
        // Parse the date and extract in LOCAL timezone (IST)
        // Because dates stored as UTC but represent IST dates (5:30 offset)
        const saleDate = new Date(sale.dos);
        
        // Use local timezone methods to get the actual intended date
        const year = saleDate.getFullYear();
        const month = String(saleDate.getMonth() + 1).padStart(2, '0');
        const day = String(saleDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })
    );
    
    const dates = [];
    const { minDate, maxDate } = getDateRange();
    
    // Parse min and max dates
    const [minYear, minMonth, minDay] = minDate.split('-').map(Number);
    const [maxYear, maxMonth, maxDay] = maxDate.split('-').map(Number);
    
    const start = new Date(minYear, minMonth - 1, minDay);
    const end = new Date(maxYear, maxMonth - 1, maxDay);
    
    // Generate all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (!salesDatesSet.has(dateStr)) {
        dates.push({
          value: dateStr,
          label: new Date(year, parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })
        });
      }
    }
    
    dates.sort((a, b) => new Date(b.value) - new Date(a.value));
    
    setAvailableDates(dates);
    
    // Update form date if current date is no longer available or if there are dates available
    if (dates.length > 0) {
      const currentDateStillAvailable = dates.some(d => d.value === formData.dos);
      if (!currentDateStillAvailable) {
        // Current date was just used, select the next available date
        setFormData(prev => ({ 
          ...prev, 
          dos: dates[0].value,
          sale: '',
          customers: '',
          orders: '',
          items_sold: ''
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sale || !formData.customers) {
      setMessage({ type: 'error', text: 'Please fill in Sales and Customers fields' });
      return;
    }

    if (availableDates.length === 0) {
      setMessage({ type: 'error', text: 'No available dates to add sales' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/franchisee/addSales`, {
        email,
        ...formData,
        sale: parseFloat(formData.sale),
        customers: parseInt(formData.customers),
        orders: formData.orders ? parseInt(formData.orders) : 0,
        items_sold: formData.items_sold ? parseInt(formData.items_sold) : 0
      });

      if (response.data.stat) {
        setMessage({ type: 'success', text: 'Sales data added successfully!' });
        // Fetch updated sales list which will automatically update available dates and form
        await fetchExistingSales();
        if (onSaleAdded) onSaleAdded();
      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Failed to add sales data' });
      }
    } catch (error) {
      console.error('Error adding sales:', error);
      setMessage({ type: 'error', text: 'Error adding sales data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const isFirstWeek = now.getDate() <= 7;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 md:p-8 rounded-t-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Calendar size={36} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Add Sales Entry</h1>
              <p className="text-green-50 mt-1 text-sm md:text-base">
                Add sales for {isFirstWeek ? 'current or previous month' : 'current month only'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl p-6 md:p-8 border-t-4 border-green-500">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 \${
              message.type === 'success' 
                ? 'bg-green-100 border-2 border-green-300 text-green-900 shadow-lg' 
                : 'bg-red-100 border-2 border-red-300 text-red-900 shadow-lg'
            `}>
              <div className={`font-bold text-lg \${message.type === 'success' ? 'text-green-600' : 'text-red-600'`}>
                {message.type === 'success' ? '✓' : '✕'}
              </div>
              <div className="flex-1">{message.text}</div>
            </div>
          )}

          {availableDates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-bold text-gray-700 mb-2">All Sales Entries Complete!</h3>
              <p className="text-gray-600">
                You have added sales data for all available dates in the current period.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="transform transition-all hover:scale-[1.02]">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  Select Date *
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors" size={22} />
                  <select
                    name="dos"
                    value={formData.dos}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-lg font-medium transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    required
                  >
                    {availableDates.map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ℹ️ Showing only dates without sales entries ({availableDates.length} available)
                </p>
              </div>

              <div className="transform transition-all hover:scale-[1.02]">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  Total Sales Amount (₹) *
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 group-focus-within:text-green-600 transition-colors" size={22} />
                  <input
                    type="number"
                    name="sale"
                    value={formData.sale}
                    onChange={handleChange}
                    placeholder="Enter total sales"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 text-lg font-medium transition-all shadow-sm hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="transform transition-all hover:scale-[1.02]">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  Number of Customers *
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors" size={22} />
                  <input
                    type="number"
                    name="customers"
                    value={formData.customers}
                    onChange={handleChange}
                    placeholder="Enter number of customers"
                    min="0"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all shadow-sm hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="transform transition-all hover:scale-[1.02]">
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    Number of Orders (Optional)
                  </label>
                  <div className="relative group">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 group-focus-within:text-purple-600 transition-colors" size={22} />
                    <input
                      type="number"
                      name="orders"
                      value={formData.orders}
                      onChange={handleChange}
                      placeholder="Enter number of orders"
                      min="0"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-lg font-medium transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                <div className="transform transition-all hover:scale-[1.02]">
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    Items Sold (Optional)
                  </label>
                  <div className="relative group">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:text-orange-600 transition-colors" size={22} />
                    <input
                      type="number"
                      name="items_sold"
                      value={formData.items_sold}
                      onChange={handleChange}
                      placeholder="Enter items sold"
                      min="0"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-lg font-medium transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-gray-600"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={24} />
                    Save Sales Entry
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-md">
            <p className="text-sm text-blue-900 font-medium">
              <strong className="text-blue-700">📌 Note:</strong> You can add sales data for the current month
              {isFirstWeek && ' and the previous month (first week only)'}. 
              Click on red dates in the calendar to quickly add sales for that specific date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
