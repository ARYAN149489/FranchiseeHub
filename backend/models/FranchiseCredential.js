const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Using typo 'credentails' to match existing database
const franchiseCredentialSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dof: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'franchise_credentails' // Intentional typo
});

// Pre-save hook to hash password before saving
franchiseCredentialSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
franchiseCredentialSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('FranchiseCredential', franchiseCredentialSchema);
