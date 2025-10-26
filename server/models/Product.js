const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String },
  stock: { type: Number, default: 1 },
  imageUrl: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buyers: [
    {
      name: String,
      email: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
