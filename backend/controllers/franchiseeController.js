const FranchiseCredential = require('../models/FranchiseCredential');
const Applicant = require('../models/Applicant');
const SalesData = require('../models/SalesData');

// Franchisee login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const franchisee = await FranchiseCredential.findOne({ email, password });
    
    if (franchisee) {
      req.session.franchiseeEmail = email;
      req.session.userType = 'franchisee';
      res.json({ stat: true, msg: 'Login successful' });
    } else {
      res.json({ stat: false, msg: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Franchisee login error:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const { email } = req.body;
    
    const profile = await Applicant.findOne({ email });
    if (profile) {
      res.json({ stat: true, doc: profile });
    } else {
      res.json({ stat: false, msg: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, fname, lname, phone, res_address, buis_name, site_address, site_city, site_postal } = req.body;
    
    const updated = await Applicant.findOneAndUpdate(
      { email },
      {
        fname,
        lname,
        phone,
        res_address,
        buis_name,
        site_address,
        site_city,
        site_postal
      },
      { new: true }
    );
    
    if (updated) {
      res.json({ stat: true, msg: 'Profile updated successfully', doc: updated });
    } else {
      res.json({ stat: false, msg: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    // Verify current password
    const credential = await FranchiseCredential.findOne({ email, password: currentPassword });
    
    if (!credential) {
      return res.json({ stat: false, msg: 'Current password is incorrect' });
    }
    
    // Update password
    credential.password = newPassword;
    await credential.save();
    
    res.json({ stat: true, msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Add sales
exports.addSales = async (req, res) => {
  try {
    const { email, dos, sale, customers, orders, items_sold } = req.body;
    
    // Parse date string and create local date object (will be stored with timezone)
    const salesDate = new Date(dos);
    salesDate.setHours(0, 0, 0, 0);
    
    // Check if exists
    const existing = await SalesData.findOne({ email, dos: salesDate });
    
    if (existing) {
      existing.sale = sale;
      existing.customers = customers;
      existing.orders = orders || 0;
      existing.items_sold = items_sold || 0;
      await existing.save();
      return res.json({ stat: true, msg: 'Sales updated' });
    }
    
    // Create new
    const salesData = new SalesData({
      email,
      dos: salesDate,
      sale,
      customers,
      orders: orders || 0,
      items_sold: items_sold || 0
    });
    
    await salesData.save();
    res.json({ stat: true, msg: 'Sales added' });
  } catch (error) {
    console.error('Error adding sales:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Get sales
exports.getSales = async (req, res) => {
  try {
    const { email, start, end } = req.body;
    
    const query = { email };
    
    if (start && end) {
      // Parse dates and set to local timezone boundaries
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      
      query.dos = { $gte: startDate, $lte: endDate };
    }
    
    const salesData = await SalesData.find(query).sort({ dos: -1 });
    res.json({ stat: true, doc: salesData });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

module.exports = exports;
