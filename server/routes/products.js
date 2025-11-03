const router = require("express").Router();
const multer = require("multer");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Store = require("../models/Store");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const storage = multer.diskStorage(
{
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", auth, roles(["seller"]), upload.single("image"), async (req, res) =>
{
  try
  {
    const { name, price, description, category, stock } = req.body;

    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(400).json({ msg: "You must create a store first" });

    const product = await Product.create(
    {
      seller: req.user._id,
      store: store._id,
      name,
      price,
      description,
      category,
      stock,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await Store.findByIdAndUpdate(store._id, { $inc: { totalProducts: 1 } });

    res.status(201).json(product);
  }
  catch (err)
  {
    console.error("❌ Product creation failed:", err);
    res.status(500).json({ msg: "Failed to create product" });
  }
});

router.get("/", async (req, res) =>
{
  try
  {
    const products = await Product.find({ stock: { $gt: 0 } })
      .populate("category", "name")
      .populate("store", "name")
      .populate("seller", "name");
    res.json(products);
  }
  catch (err)
  {
    res.status(500).json({ msg: "Failed to fetch products" });
  }
});

router.get("/my", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const products = await Product.find({ seller: req.user._id })
      .populate("category", "name");
    res.json(products);
  }
  catch (err)
  {
    console.error("❌ Fetch failed:", err);
    res.status(500).json({ msg: "Failed to fetch seller products" });
  }
});

router.get("/:id", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const product = await Product.findOne(
    {
      _id: req.params.id,
      seller: req.user._id,
    })
      .populate("category", "name")
      .populate("store", "name");

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json(product);
  }
  catch (err)
  {
    console.error("❌ Failed to fetch product:", err);
    res.status(500).json({ msg: "Failed to fetch product details" });
  }
});

router.get("/detail/:id", async (req, res) =>
{
  try
  {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("store", "name")
      .populate("seller", "name");
      
    if (!product)
    {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  }
  catch (err)
  {
     console.error("❌ Failed to fetch public product:", err);
    res.status(500).json({ msg: "Failed to fetch product details" });
  }
});

router.put("/:id", auth, roles(["seller"]), upload.single("image"), async (req, res) =>
{
  try
  {
    const { name, price, description, stock, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (String(product.seller) !== String(req.user._id))
    {
      return res.status(403).json({ msg: "Not authorized to edit this product" });
    }

    if (category && String(category) !== String(product.category))
    {
      if (product.category)
      {
        await Category.findByIdAndUpdate(product.category,
        {
          $pull: { products: product._id },
        });
      }
      await Category.findByIdAndUpdate(category,
      {
        $addToSet: { products: product._id },
      });
      product.category = category;
    }

    if (category === null || category === '')
    {
      if (product.category)
      {
        await Category.findByIdAndUpdate(product.category,
        {
          $pull: { products: product._id },
        });
      }
      product.category = null;
    }

    if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (stock) product.stock = stock;

    await product.save();

    const updated = await Product.findById(product._id).populate("category", "name");
    res.json(updated);
  }
  catch (err)
  {
    console.error("❌ Product update failed:", err);
    res.status(500).json({ msg: "Product update failed" });
  }
});

router.delete("/:id", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (String(product.seller) !== String(req.user._id))
    {
      return res.status(403).json({ msg: "Not authorized to delete this product" });
    }

    if (product.category)
    {
      await Category.findByIdAndUpdate(product.category,
      {
        $pull: { products: product._id },
      });
    }

    await Store.findByIdAndUpdate(product.store, { $inc: { totalProducts: -1 } });

    await product.deleteOne();
    res.json({ msg: "🗑 Product deleted successfully" });
  }
  catch (err)
  {
    console.error("❌ Product deletion failed:", err);
    res.status(500).json({ msg: "Product deletion failed" });
  }
});

module.exports = router;