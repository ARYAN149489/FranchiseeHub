require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const SalesData = require('../models/SalesData');
const config = require('../config/config');

mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function checkSalesData() {
  try {
    const email = 'aryankansal113@gmail.com';
    
    // Get all sales for this user
    const allSales = await SalesData.find({ email }).sort({ dos: 1 });
    
    console.log(`\n📊 Total sales records: ${allSales.length}\n`);
    
    // Get recent sales (last 10)
    const recentSales = allSales.slice(-10);
    
    console.log('📅 Last 10 sales entries:\n');
    recentSales.forEach(sale => {
      const date = new Date(sale.dos);
      const formatted = date.toISOString().split('T')[0];
      const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      console.log(`  Date (stored): ${sale.dos}`);
      console.log(`  Date (ISO):    ${formatted}`);
      console.log(`  Date (local):  ${local}`);
      console.log(`  Sale: ₹${sale.sale}, Customers: ${sale.customers}`);
      console.log('  ---');
    });
    
    // Check for specific dates
    const checkDates = ['2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03'];
    console.log('\n🔍 Checking specific dates:\n');
    
    for (const dateStr of checkDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      const found = await SalesData.findOne({
        email,
        dos: { $gte: startOfDay, $lte: endOfDay }
      });
      
      console.log(`  ${dateStr}: ${found ? '✅ HAS SALES' : '❌ NO SALES'}`);
      if (found) {
        console.log(`    Stored as: ${found.dos}`);
        console.log(`    Sale: ₹${found.sale}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSalesData();
