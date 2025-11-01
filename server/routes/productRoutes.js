const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ==========================================
// 🛍️ GET /api/products
// Fetch all products or filter by category
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const query = {};
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("seller", "name email") // show seller info
      .populate("store", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
});

module.exports = router;
