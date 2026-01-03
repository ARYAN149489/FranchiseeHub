const mongoose = require('mongoose');

const salesDataSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  dos: { type: Date, required: true },
  sale: { type: Number, required: true },
  customers: { type: Number, required: true },
  orders: { type: Number, default: 0 },
  items_sold: { type: Number, default: 0 }
}, { 
  timestamps: true,
  collection: 't_sales_data'
});

salesDataSchema.index({ email: 1, dos: 1 });

module.exports = mongoose.model('SalesData', salesDataSchema);
