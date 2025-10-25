const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'seller', 'buyer'], default: 'buyer' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  otp: String,             // store OTP
  otpExpires: Date         // OTP expiration time
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);