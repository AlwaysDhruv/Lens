const router = require("express").Router();
const multer = require("multer");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Store = require("../models/Store");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

// --------------------------------------
// 🗂 Multer configuration for image upload
// --------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --------------------------------------
// 🧩 Create Product (Seller only)
// --------------------------------------
router.post("/", auth, roles(["seller"]), upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;

    // 🧠 find seller’s store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(400).json({ msg: "You must create a store first" });

    const product = await Product.create({
      seller: req.user._id,
      store: store._id, // ✅ attach store here
      name,
      price,
      description,
      category,
      stock,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    // ⬆️ increment store’s total product count
    await Store.findByIdAndUpdate(store._id, { $inc: { totalProducts: 1 } });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Product creation failed:", err);
    res.status(500).json({ msg: "Failed to create product" });
  }
});

// --------------------------------------
// 📦 Get All Products (public)
// --------------------------------------
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("store", "name")
      .populate("seller", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch products" });
  }
});

// --------------------------------------
// 📦 Get Seller’s Products
// --------------------------------------
router.get("/my", auth, roles(["seller"]), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("category", "name");
    res.json(products);
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    res.status(500).json({ msg: "Failed to fetch seller products" });
  }
});

// --------------------------------------
// 🔍 Get Single Product by ID
// --------------------------------------
router.get("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id, // ensures sellers can only view their own products
    })
      .populate("category", "name")
      .populate("store", "name");

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("❌ Failed to fetch product:", err);
    res.status(500).json({ msg: "Failed to fetch product details" });
  }
});

// --------------------------------------
// ✏️ Update Product (Seller only)
// --------------------------------------
router.put("/:id", auth, roles(["seller"]), upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    // Ensure ownership
    if (String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ msg: "Not authorized to edit this product" });
    }

    // Category logic: handle addition/removal/change
    if (category && String(category) !== String(product.category)) {
      // Remove from old category
      if (product.category) {
        await Category.findByIdAndUpdate(product.category, {
          $pull: { products: product._id },
        });
      }
      // Add to new category
      await Category.findByIdAndUpdate(category, {
        $addToSet: { products: product._id },
      });
      product.category = category;
    }

    // Allow unassigning category completely
    if (!category) {
      if (product.category) {
        await Category.findByIdAndUpdate(product.category, {
          $pull: { products: product._id },
        });
      }
      product.category = null;
    }

    // Update other fields
    if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (stock) product.stock = stock;

    await product.save();

    // Populate the new category for immediate frontend use
    const updated = await Product.findById(product._id).populate("category", "name");
    res.json(updated);
  } catch (err) {
    console.error("❌ Product update failed:", err);
    res.status(500).json({ msg: "Product update failed" });
  }
});

// --------------------------------------
// 🗑 Delete Product (Seller only)
// --------------------------------------
router.delete("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    // Ownership check
    if (String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ msg: "Not authorized to delete this product" });
    }

    // Remove from category if linked
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $pull: { products: product._id },
      });
    }

    // Remove from store count
    await Store.findByIdAndUpdate(req.user.store, { $inc: { totalProducts: -1 } });

    await product.deleteOne();
    res.json({ msg: "🗑 Product deleted successfully" });
  } catch (err) {
    console.error("❌ Product deletion failed:", err);
    res.status(500).json({ msg: "Product deletion failed" });
  }
});

module.exports = router;
