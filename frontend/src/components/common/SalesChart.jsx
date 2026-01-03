import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data, type = 'bar' }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <ResponsiveContainer width="100%" height={400}>
        {type === 'bar' ? (
          <BarChart data={data}>
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
          <LineChart data={data}>
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
  );
}
