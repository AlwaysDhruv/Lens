const router = require("express").Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

// ➕ Create Category (any authenticated seller)
router.post("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description, productIds = [] } = req.body;

    // Create category
    const category = new Category({
      name,
      description,
      products: productIds,
    });
    await category.save();

    // Link category to each product
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { category: category._id } }
      );
    }

    res.status(201).json(category);
  } catch (err) {
    console.error("Category creation failed:", err);
    res.status(500).json({ msg: "Category creation failed" });
  }
});

// 📋 Get all categories
router.get("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const categories = await Category.find().populate("products", "name price");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch categories" });
  }
});

// ❌ Delete Category
router.delete("/:id", auth, async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ msg: "Not found" });
  if (cat.products && cat.products.length > 0) {
    return res.status(400).json({ msg: "Category has products. Remove or reassign them first." });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// GET /categories/:id
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id).populate("products");
  if (!category) return res.status(404).json({ msg: "Category not found" });
  res.json(category);
});

// PUT /categories/:id
router.put("/:id", async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true }
  );
  res.json(category);
});

// PUT /categories/:id/remove-product
router.put("/:id/remove-product", async (req, res) => {
  const { productId } = req.body;
  await Category.findByIdAndUpdate(req.params.id, { $pull: { products: productId } });
  await Product.findByIdAndUpdate(productId, { $unset: { category: "" } });
  res.json({ msg: "Product removed from category" });
});

// DELETE /categories/:id
router.delete("/:id", async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ msg: "Not found" });
  if (cat.products && cat.products.length > 0)
    return res.status(400).json({ msg: "Cannot delete category with products" });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ msg: "Category deleted" });
});

module.exports = router;
