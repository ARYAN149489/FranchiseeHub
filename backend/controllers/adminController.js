const Applicant = require('../models/Applicant');
const FranchiseCredential = require('../models/FranchiseCredential');
const Admin = require('../models/Admin');
const { nanoid } = require('nanoid');
const emailService = require('../utils/emailService');

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    
    if (admin) {
      req.session.adminEmail = email;
      req.session.userType = 'admin';
      res.json({ stat: true, msg: 'Login successful' });
    } else {
      res.json({ stat: false, msg: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Get all applicants
exports.getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().lean().sort({ doa: -1 });
    res.json({ status: true, doc: applicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ status: false, msg: error.message });
  }
};

// Accept applicant
exports.acceptApplicant = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get applicant details for email
    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.status(404).json({ stat: false, msg: 'Applicant not found' });
    }
    
    // Update status
    await Applicant.updateOne({ email }, { $set: { status: 'accepted' } });
    
    // Send email in background with timeout protection (don't wait)
    const franchiseeName = `${applicant.fname} ${applicant.lname}`;
    Promise.race([
      emailService.sendApplicationAccepted(email, franchiseeName),
      new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 5000))
    ]).then(emailResult => {
      if (emailResult.success) {
        console.log(`📧 Acceptance email sent to ${email}`);
      } else {
        console.error(`⚠️ Failed to send acceptance email to ${email}`);
      }
    }).catch(err => {
      console.error(`❌ Email error for ${email}:`, err);
    });
    
    // Return success immediately
    res.json({ stat: true, msg: 'Applicant accepted', emailSent: true });
  } catch (error) {
    console.error('Error accepting applicant:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Reject applicant
exports.rejectApplicant = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get applicant details for email
    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.status(404).json({ stat: false, msg: 'Applicant not found' });
    }
    
    // Update status
    await Applicant.updateOne({ email }, { $set: { status: 'rejected' } });
    
    // Send email in background with timeout protection (don't wait)
    const franchiseeName = `${applicant.fname} ${applicant.lname}`;
    Promise.race([
      emailService.sendApplicationRejected(email, franchiseeName),
      new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 5000))
    ]).then(emailResult => {
      if (emailResult.success) {
        console.log(`📧 Rejection email sent to ${email}`);
      } else {
        console.error(`⚠️ Failed to send rejection email to ${email}`);
      }
    }).catch(err => {
      console.error(`❌ Email error for ${email}:`, err);
    });
    
    // Return success immediately
    res.json({ stat: true, msg: 'Applicant rejected', emailSent: true });
  } catch (error) {
    console.error('Error rejecting applicant:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Grant franchise - creates credentials and sends email
exports.grantApplicant = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get applicant details for email
    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.status(404).json({ stat: false, msg: 'Applicant not found' });
    }
    
    // Update applicant status
    await Applicant.updateOne({ email }, { $set: { status: 'granted' } });
    
    // Check if credentials already exist
    let credential = await FranchiseCredential.findOne({ email });
    let password;
    let isNewCredential = false;
    
    if (!credential) {
      // Generate new password
      password = nanoid(10);
      
      // Create credentials
      credential = new FranchiseCredential({
        email,
        password,
        dof: new Date()
      });
      
      await credential.save();
      isNewCredential = true;
      console.log(`✅ New credentials created for ${email}`);
    } else {
      password = credential.password;
      console.log(`ℹ️ Using existing credentials for ${email}`);
    }
    
    // Return success immediately to prevent timeout
    // Send email in background with timeout protection
    const franchiseeName = `${applicant.fname} ${applicant.lname}`;
    
    // Send email with timeout (don't wait for it)
    Promise.race([
      emailService.sendFranchiseCredentials(email, franchiseeName, email, password),
      new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 5000))
    ]).then(emailResult => {
      if (emailResult.success) {
        console.log(`📧 Credentials email sent successfully to ${email}`);
      } else {
        console.error(`❌ Failed to send email to ${email}:`, emailResult.error);
      }
    }).catch(err => {
      console.error(`❌ Email error for ${email}:`, err);
    });
    
    // Return success immediately
    res.json({ 
      stat: true, 
      msg: 'Franchise granted successfully',
      emailSent: true, // Assume email will be sent
      password: password, // Include credentials as backup
      email: email
    });
    
  } catch (error) {
    console.error('Error granting franchise:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Create franchise credentials
exports.saveFranchiseCred = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if already exists
    const existing = await FranchiseCredential.findOne({ email });
    if (existing) {
      return res.json({ stat: true, pwd: existing.password, msg: 'Credentials already exist' });
    }
    
    // Generate password
    const pwd = nanoid(10);
    
    // Create credentials
    const credential = new FranchiseCredential({
      email,
      password: pwd,
      dof: new Date()
    });
    
    await credential.save();
    res.json({ stat: true, pwd, msg: 'Credentials created' });
  } catch (error) {
    console.error('Error creating credentials:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Get user sales (for admin to view franchisee sales)
exports.getUserSales = async (req, res) => {
  try {
    const SalesData = require('../models/SalesData');
    const { email, start, end } = req.body;
    
    const query = { email };
    
    if (start && end) {
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

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email }).select('-password');
    
    if (admin) {
      res.json({ stat: true, doc: admin });
    } else {
      res.json({ stat: false, msg: 'Admin not found' });
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, fname, lname } = req.body;
    
    const result = await Admin.updateOne(
      { email },
      { $set: { fname, lname } }
    );
    
    if (result.modifiedCount > 0 || result.matchedCount > 0) {
      res.json({ stat: true, msg: 'Profile updated successfully' });
    } else {
      res.json({ stat: false, msg: 'Admin not found' });
    }
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    // Verify current password
    const admin = await Admin.findOne({ email, password: currentPassword });
    
    if (!admin) {
      return res.json({ stat: false, msg: 'Current password is incorrect' });
    }
    
    // Update password
    await Admin.updateOne(
      { email },
      { $set: { password: newPassword } }
    );
    
    res.json({ stat: true, msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

module.exports = exports;
