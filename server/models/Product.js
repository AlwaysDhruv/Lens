const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name:
    { 
      type: String,
      required: true
    },
    price:
    {
      type: Number,
      required: true
    },
    description:
    {
      type: String
    },
    stock:
    {
      type: Number,
      default: 1
    },
    imageUrl:
    {
      type: String
    },
    seller:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    store:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store"
    },
    category:
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);