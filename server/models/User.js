const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email:
    {
      type: String,
      unique: true
    },
    password: String,
    role:
    {
      type: String,
      enum: ['admin', 'seller', 'buyer'],
      default: 'buyer'
    },
    store:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    otp: String,
    otpExpires: Date,
    address:
    {
      type: String,
      default: ''
    },
    phone:
    {
      type: String, 
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);