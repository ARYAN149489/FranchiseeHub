import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isFuture,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isAfter,
  addDays
} from 'date-fns';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SalesCalendar({ email, onDateSelect }) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [salesDates, setSalesDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthSales();
  }, [currentMonth, email]);

  const fetchMonthSales = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await axios.post(`${API_BASE_URL}/franchisee/getSales`, {
        email,
        start: start.toISOString(),
        end: end.toISOString()
      });

      if (response.data.stat && response.data.doc) {
        const dates = new Set(
          response.data.doc.map(sale => format(new Date(sale.dos), 'yyyy-MM-dd'))
        );
        setSalesDates(dates);
      }
    } catch (error) {
      console.error('Error fetching sales dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Check if date can have data added (current month + first week of next month)
  const canAddData = (date) => {
    const today = new Date();
    const firstWeekOfNextMonth = addDays(startOfMonth(addMonths(today, 1)), 7);
    return !isAfter(date, firstWeekOfNextMonth) && !isFuture(date);
  };

  const getDayColor = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasData = salesDates.has(dateStr);
    const today = isToday(day);
    const future = isFuture(day);
    const editable = canAddData(day);

    if (future) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';
    }
    if (today) {
      return hasData
        ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 ring-4 ring-blue-300 shadow-lg font-bold'
        : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 ring-4 ring-blue-300 shadow-lg font-bold';
    }
    if (hasData) {
      return 'bg-green-500 text-white cursor-pointer hover:bg-green-600 shadow-md hover:shadow-xl font-semibold';
    }
    if (editable) {
      return 'bg-red-50 text-red-800 cursor-pointer hover:bg-red-100 border-2 border-red-300';
    }
    return 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-50';
  };

  const handleDateClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasData = salesDates.has(dateStr);
    const editable = canAddData(day);
    
    if (isFuture(day) || !editable) return;
    
    // If date has data, show it in history
    if (hasData && onDateSelect) {
      onDateSelect(dateStr);
    } 
    // If date doesn't have data, navigate to sales form with pre-filled date
    else if (!hasData && editable) {
      navigate('/franchisee/today', { state: { selectedDate: dateStr } });
    }
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white p-4 md:p-6 rounded-t-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <CalendarIcon size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Sales Calendar</h1>
              <p className="text-purple-50 text-sm mt-1">Track your daily sales at a glance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl p-4 md:p-6 border-t-4 border-purple-500">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg bg-white hover:bg-purple-100 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ChevronLeft size={24} className="text-purple-600" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 bg-white px-6 py-2 rounded-lg shadow-md">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              disabled={format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
              className="p-2 rounded-lg bg-white hover:bg-purple-100 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronRight size={24} className="text-purple-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-md shadow-sm"></div>
              <span className="text-xs font-semibold text-gray-700">Sales Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 border-2 border-red-400 rounded-md"></div>
              <span className="text-xs font-semibold text-gray-700">Click to Add Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-md ring-2 ring-blue-200 shadow-sm"></div>
              <span className="text-xs font-semibold text-gray-700">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded-md"></div>
              <span className="text-xs font-semibold text-gray-700">Disabled</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-bold text-sm uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative p-2 min-h-[60px] md:min-h-[70px] border border-gray-200
                      ${isCurrentMonth ? '' : 'bg-gray-50/50 opacity-60'}
                      ${getDayColor(day)}
                      transition-all duration-200 transform hover:scale-105
                    `}
                  >
                    <div className="font-bold text-lg md:text-xl">
                      {format(day, 'd')}
                    </div>
                    {salesDates.has(format(day, 'yyyy-MM-dd')) && (
                      <div className="absolute bottom-2 right-2">
                        <div className="w-2 h-2 bg-white rounded-full shadow-md animate-pulse"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
            <p className="text-xs md:text-sm text-blue-900 font-medium">
              <strong className="text-blue-700">💡 Tip:</strong> Click on a <span className="inline-block w-3 h-3 bg-green-500 rounded mx-1 align-middle"></span> green date to view sales details, 
              or click a <span className="inline-block w-3 h-3 bg-red-100 border-2 border-red-400 rounded mx-1 align-middle"></span> red date to add sales data.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4 mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
