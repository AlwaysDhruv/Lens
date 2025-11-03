const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    product:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity:
    {
      type: Number,
      required: true
    },
    price:
    {
      type: Number,
      required: true
    },
    seller:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    store:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    status:
    {
      type: String,
      enum:
      [
        'pending',
        'confirmed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancellation_requested',
        'cancelled'
      ],
      default: 'pending'
    }
  }, 
  {
    _id: true
  }
);

const orderSchema = new mongoose.Schema
(
  {
    buyer:
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items:
    [
      itemSchema
    ],
    address: String,
    phone: String,
    total: Number,
    payment:
    {
      type: String,
      enum: ['cash', 'upi']
    },
    overallStatus:
    {
      type: String,
      enum: ['pending','partially_shipped','shipped','delivered','cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);