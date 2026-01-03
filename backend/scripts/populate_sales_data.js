require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const SalesData = require('../models/SalesData');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Generate random sales data
function getRandomSalesData(date) {
  // Higher sales on weekends
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const baseMultiplier = isWeekend ? 1.3 : 1;
  
  // Seasonal variation (higher in recent months)
  const monthFactor = 1 + (date.getMonth() / 12) * 0.2;
  
  const baseSale = Math.floor(Math.random() * 5000 + 3000) * baseMultiplier * monthFactor;
  const customers = Math.floor(Math.random() * 50 + 30) * baseMultiplier;
  const orders = Math.floor(customers * (0.7 + Math.random() * 0.3)); // 70-100% of customers place orders
  const items_sold = Math.floor(orders * (1.5 + Math.random() * 1)); // 1.5-2.5 items per order
  
  return {
    sale: Math.round(baseSale),
    customers: Math.round(customers),
    orders: Math.round(orders),
    items_sold: Math.round(items_sold)
  };
}

async function populateSalesData() {
  try {
    const email = 'aryankansal113@gmail.com';
    
    // Delete existing data for this user
    const deleted = await SalesData.deleteMany({ email });
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing records`);
    
    const salesRecords = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate data for last 180 days (6 months), excluding last 2 days
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 180);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 2); // Exclude last 2 days
    
    console.log(`📊 Generating sales data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    let currentDate = new Date(startDate);
    let recordCount = 0;
    
    while (currentDate <= endDate) {
      const salesData = getRandomSalesData(currentDate);
      
      salesRecords.push({
        email,
        dos: new Date(currentDate),
        ...salesData
      });
      
      recordCount++;
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Insert all records
    await SalesData.insertMany(salesRecords);
    
    console.log(`✅ Successfully inserted ${recordCount} sales records`);
    
    // Show summary statistics
    const totalSales = salesRecords.reduce((sum, record) => sum + record.sale, 0);
    const avgSales = totalSales / recordCount;
    const totalCustomers = salesRecords.reduce((sum, record) => sum + record.customers, 0);
    const totalOrders = salesRecords.reduce((sum, record) => sum + record.orders, 0);
    const totalItems = salesRecords.reduce((sum, record) => sum + record.items_sold, 0);
    
    console.log('\n📈 Summary Statistics:');
    console.log(`   Total Sales: ₹${totalSales.toLocaleString()}`);
    console.log(`   Average Daily Sales: ₹${Math.round(avgSales).toLocaleString()}`);
    console.log(`   Total Customers: ${totalCustomers.toLocaleString()}`);
    console.log(`   Total Orders: ${totalOrders.toLocaleString()}`);
    console.log(`   Total Items Sold: ${totalItems.toLocaleString()}`);
    console.log(`   Average Items per Order: ${(totalItems / totalOrders).toFixed(2)}`);
    
    console.log('\n🎉 Data population complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

populateSalesData();
