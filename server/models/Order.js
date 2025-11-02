const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  // item-level status to support multi-seller orders
  status: {
    type: String,
    enum: [
      'pending',              // initial state
      'confirmed',            // seller confirmed
      'shipped',              // seller marked shipped
      'out_for_delivery',     // seller / courier marked out for delivery
      'delivered',            // delivered to buyer
      'cancellation_requested', // buyer requested cancellation for this item
      'cancelled'             // seller approved cancellation
    ],
    default: 'pending'
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [itemSchema],
  address: String,
  phone: String,
  total: Number,
  payment: { type: String, enum: ['cash', 'upi'] },
  // kept for convenience/legacy: a computed overall status can still exist,
  // but we will primarily use item-level statuses in endpoints/responses.
  overallStatus: {
    type: String,
    enum: ['pending','partially_shipped','shipped','delivered','cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
