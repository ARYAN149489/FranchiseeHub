const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fname: { type: String, default: '' },
  lname: { type: String, default: '' },
  name: String, // Keep for backwards compatibility
  role: { type: String, default: 'admin' }
}, { 
  timestamps: true,
  collection: 'admins'
});

// Pre-save hook to hash password before saving
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
