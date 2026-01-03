require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const FranchiseCredential = require('../models/FranchiseCredential');
const Applicant = require('../models/Applicant');
const config = require('../config/config');

mongoose.connect(config.mongodb.uri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function createFranchiseeAccount() {
  try {
    const email = 'aryankansal113@gmail.com';
    const password = 'aryan123';
    
    // Check if credential exists
    let credential = await FranchiseCredential.findOne({ email });
    
    if (!credential) {
      credential = new FranchiseCredential({
        email,
        password
      });
      await credential.save();
      console.log('✅ Franchise credential created');
    } else {
      console.log('✅ Franchise credential already exists');
    }
    
    // Check if applicant profile exists
    let profile = await Applicant.findOne({ email });
    
    if (!profile) {
      profile = new Applicant({
        email,
        fname: 'Aryan',
        lname: 'Kansal',
        phone: '9876543299',
        res_address: '123 Main Street, Delhi',
        buis_name: 'Kansal Foods',
        site_address: '456 Business Park',
        site_city: 'Delhi',
        site_postal: '110001',
        status: 'accepted',
        createdAt: new Date('2025-12-01')
      });
      await profile.save();
      console.log('✅ Applicant profile created');
    } else {
      console.log('✅ Applicant profile already exists');
    }
    
    console.log('\n📋 Account Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${profile.fname} ${profile.lname}`);
    console.log(`   Business: ${profile.buis_name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFranchiseeAccount();
