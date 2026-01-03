const Applicant = require('../models/Applicant');
const Admin = require('../models/Admin');
const emailService = require('../utils/emailService');
exports.submitApplication = async (req, res) => {
  try {
    const {
      fname, lname, email, phone, res_address, buis_name,
      site_address, site_city, site_postal, area_sqft, site_floor, ownership
    } = req.body;
    
    // Check if exists
    const existing = await Applicant.findOne({ email });
    if (existing) {
      return res.json({ stat: false, msg: 'Application already exists' });
    }
    
    // Create application
    const applicant = new Applicant({
      fname, lname, email, phone, res_address, buis_name,
      site_address, site_city, site_postal, area_sqft, site_floor, ownership,
      status: 'pending',
      doa: new Date()
    });
    
    await applicant.save();
    
    // Send notification email to all admins
    try {
      const admins = await Admin.find({}, 'email');
      const applicantName = `${fname} ${lname}`;
      
      for (const admin of admins) {
        const emailResult = await emailService.sendNewApplicationNotification(
          admin.email,
          applicantName,
          email,
          buis_name,
          site_city
        );
        
        if (emailResult.success) {
          console.log(`📧 New application notification sent to admin: ${admin.email}`);
        } else {
          console.error(`⚠️ Failed to send notification to admin: ${admin.email}`);
        }
      }
    } catch (emailError) {
      console.error('Error sending admin notifications:', emailError);
      // Don't fail the application submission if email fails
    }
    
    res.json({ stat: true, msg: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ stat: false, msg: error.message });
  }
};

module.exports = exports;
