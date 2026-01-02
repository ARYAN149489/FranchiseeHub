import { DollarSign, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

export default function FranchiseeDashboardOverview({ profile, salesData }) {
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalOrders = salesData.reduce((sum, sale) => sum + (sale.orders || 0), 0);
  const totalItems = salesData.reduce((sum, sale) => sum + (sale.items_sold || 0), 0);
  const avgRevenue = salesData.length > 0 ? (totalRevenue / salesData.length).toFixed(2) : 0;
  const recentSales = salesData.slice(0, 5);

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        {profile && (
          <p className="text-gray-600 mt-2">
            {profile.fname} {profile.lname} • {profile.site_city}
          </p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Revenue</span>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Lifetime earnings</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Average Daily</span>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{avgRevenue}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per day average</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Orders</span>
            <CalendarIcon className="text-purple-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalOrders.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">All time orders</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Items Sold</span>
            <DollarSign className="text-orange-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {totalItems.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total items</div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h2>
        
        {salesData.length > 0 ? (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div 
                key={sale._id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {new Date(sale.dos).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {sale.orders || 0} orders • {sale.items_sold || 0} items sold
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{sale.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.dos).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No sales data yet</p>
            <p className="text-sm mt-2">Start adding your daily sales to track performance</p>
          </div>
        )}
      </div>
    </div>
  );
}
