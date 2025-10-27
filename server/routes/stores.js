const router = require("express").Router();
const Store = require("../models/Store");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

// 🏗 Create or Update Store (Seller)
router.post("/", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description, type, address } = req.body;

    let store = await Store.findOne({ owner: req.user._id });

    if (store) {
      // update existing store
      store.name = name;
      store.description = description;
      store.type = type;
      store.address = address;
      await store.save();
    } else {
      // create new store
      store = await Store.create({
        owner: req.user._id,
        name,
        description,
        type,
        address,
      });
      req.user.store = store._id;
      await req.user.save();
    }

    res.json(store);
  } catch (err) {
    console.error("❌ Store create/update failed:", err);
    res.status(500).json({ msg: "Failed to create or update store" });
  }
});

// 📋 Get all stores (Admin or public view)
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find().populate("owner", "name email");
    res.json(stores);
  } catch (err) {
    console.error("❌ Failed to fetch stores:", err);
    res.status(500).json({ msg: "Failed to fetch stores" });
  }
});

// 👤 Get seller’s own store (with live stats)
// 👤 Get seller’s own store (with product stats)
router.get("/my", auth, roles(["seller"]), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .populate("owner", "name email");
    if (!store) return res.status(404).json({ msg: "No store found" });

    // 🧮 Count products belonging to this store
    const Product = require("../models/Product");
    const totalProducts = await Product.countDocuments({ store: store._id });

    // 🧩 Recalculate categories from Category model
    const Category = require("../models/Category");
    const categories = await Category.find({}, "name");

    // 📝 Update live stats
    store.totalProducts = totalProducts;
    store.categories = categories.map((c) => c.name);
    await store.save();

    res.json({
      ...store.toObject(),
      totalProducts,
      categories: store.categories,
    });
  } catch (err) {
    console.error("❌ Failed to load store:", err);
    res.status(500).json({ msg: "Failed to load store" });
  }
});

// ✏️ Update existing store by ID
router.put("/:id", auth, roles(["seller"]), async (req, res) => {
  try {
    const { name, description, type, address } = req.body;
    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, description, type, address },
      { new: true }
    );
    if (!store) return res.status(404).json({ msg: "Store not found" });
    res.json(store);
  } catch (err) {
    console.error("❌ Store update failed:", err);
    res.status(500).json({ msg: "Store update failed" });
  }
});

module.exports = router;
