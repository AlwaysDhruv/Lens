const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// ===================================================
// 🛍️ GET /api/categories/buyer
// Fetch all categories that have at least one product
// (Visible to buyers for dropdowns, filters, etc.)
// ===================================================
router.get("/buyer", async (req, res) => {
  try {
    const categories = await Category.find({ products: { $exists: true, $ne: [] } })
      .populate({
        path: "products",
        select: "name price store",
      })
      .select("name slug description") // don’t expose seller info
      .sort({ name: 1 });

    // Optional: transform to a minimal structure for dropdowns
    const formatted = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.products?.length || 0,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      categories: formatted,
    });
  } catch (err) {
    console.error("Error fetching buyer categories:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching buyer categories",
    });
  }
});

module.exports = router;
