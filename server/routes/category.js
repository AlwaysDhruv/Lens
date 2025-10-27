const router = require("express").Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

// ➕ Create Category
router.post("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description, productIds = [] } = req.body;

    const category = new Category({ name, description, products: productIds });
    await category.save();

    // Link products to this category
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

// ✏️ Update Category
router.put("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description, productIds } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    // Update main fields
    category.name = name || category.name;
    category.description = description || category.description;

    // If product list is updated → sync both sides
    if (Array.isArray(productIds)) {
      // Unlink removed products
      await Product.updateMany(
        { category: category._id, _id: { $nin: productIds } },
        { $unset: { category: "" } }
      );
      // Link new ones
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { category: category._id } }
      );
      category.products = productIds;
    }

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update category" });
  }
});

// ❌ Delete Category
router.delete("/:id", auth, roles(["seller"]), async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ msg: "Category not found" });

  // Unlink all products
  await Product.updateMany({ category: cat._id }, { $unset: { category: "" } });
  await cat.deleteOne();
  res.json({ msg: "Category deleted successfully" });
});

// 📋 Get all Categories
router.get("/", auth, roles(["seller"]), async (req, res) => {
  const categories = await Category.find().populate("products", "name price");
  res.json(categories);
});

// 📋 Get single Category
router.get("/:id", auth, roles(["seller"]), async (req, res) => {
  const category = await Category.findById(req.params.id).populate("products", "name price");
  if (!category) return res.status(404).json({ msg: "Category not found" });
  res.json(category);
});

// --------------------------------------
// 🗑 Remove a product from a category
// --------------------------------------
router.put("/:id/remove-product", auth, roles(["seller"]), async (req, res) => {
  try {
    const { productId } = req.body;
    const categoryId = req.params.id;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Remove product from category's product list
    await Category.findByIdAndUpdate(categoryId, {
      $pull: { products: productId },
    });

    // Remove category reference from product
    await Product.findByIdAndUpdate(productId, {
      $unset: { category: "" },
    });

    res.json({ msg: "✅ Product removed from category successfully" });
  } catch (err) {
    console.error("❌ Failed to remove product from category:", err);
    res.status(500).json({ msg: "Failed to remove product from category" });
  }
});

module.exports = router;
