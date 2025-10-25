const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  }],
  address: String,
  phone: String,
  total: Number,
  payment: { type: String, enum: ['cash', 'upi'] },
  status: { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
