const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  name: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
