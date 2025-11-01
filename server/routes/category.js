const router = require("express").Router();
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const Category = require("../models/Category");

/* --------------------------------------------
   🟢 CREATE Category (Seller only)
-------------------------------------------- */
router.post("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description } = req.body;

    // prevent duplicates for same seller
    const exists = await Category.findOne({ name, seller: req.user._id });
    if (exists)
      return res.status(400).json({ msg: "Category already exists for you." });

    const category = await Category.create({
      seller: req.user._id,
      name,
      description,
    });

    res.json(category);
  } catch (err) {
    console.error("❌ Category creation error:", err);
    res.status(500).json({ msg: "Failed to create category" });
  }
});

/* --------------------------------------------
   🟡 GET All Categories (for current seller)
-------------------------------------------- */
router.get("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const categories = await Category.find({ seller: req.user._id })
      .populate("products", "name price");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch categories" });
  }
});

/* --------------------------------------------
   🟠 UPDATE Category (seller’s own only)
-------------------------------------------- */
router.put("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id }, // 🔒 seller lock
      { $set: req.body },
      { new: true }
    );

    if (!category)
      return res.status(404).json({ msg: "Category not found or unauthorized" });

    res.json(category);
  } catch (err) {
    console.error("❌ Update category error:", err);
    res.status(500).json({ msg: "Failed to update category" });
  }
});

/* --------------------------------------------
   🔴 DELETE Category (seller’s own only)
-------------------------------------------- */
router.delete("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const cat = await Category.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id, // 🔒 seller lock
    });

    if (!cat)
      return res.status(404).json({ msg: "Category not found or unauthorized" });

    res.json({ msg: "Category deleted" });
  } catch (err) {
    console.error("❌ Delete category error:", err);
    res.status(500).json({ msg: "Failed to delete category" });
  }
});

module.exports = router;
