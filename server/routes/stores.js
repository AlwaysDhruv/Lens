const router = require("express").Router();
const Store = require("../models/Store");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

router.post("/", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const { name, description, type, address } = req.body;

    let store = await Store.findOne({ owner: req.user._id });

    if (store)
    {
      store.name = name;
      store.description = description;
      store.type = type;
      store.address = address;
      await store.save();
    }
    else
    {
      store = await Store.create(
      {
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
  }
  catch (err)
  {
    console.error("❌ Store create/update failed:", err);
    res.status(500).json({ msg: "Failed to create or update store" });
  }
});

router.get("/", async (req, res) =>
{
  try
  {
    const stores = await Store.find().populate("owner", "name email");
    res.json(stores);
  }
  catch (err)
  {
    console.error("❌ Failed to fetch stores:", err);
    res.status(500).json({ msg: "Failed to fetch stores" });
  }
});

router.get("/my", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const store = await Store.findOne({ owner: req.user._id })
      .populate("owner", "name email");

    if (!store) return res.status(404).json({ msg: "No store found" });

    const Product = require("../models/Product");
    const Category = require("../models/Category");

    const totalProducts = await Product.countDocuments({ store: store._id });

    const categories = await Category.find({ seller: req.user._id }).select("name");

    res.json(
    {
      ...store.toObject(),
      totalProducts,
      categories: categories.map((c) => c.name),
    });

  }
  catch (err)
  {
    console.error("❌ Failed to load store:", err);
    res.status(500).json({ msg: "Failed to load store" });
  }
});

router.put("/:id", auth, roles(["seller"]), async (req, res) =>
{
  try
  {
    const { name, description, type, address } = req.body;
    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, description, type, address },
      { new: true }
    );
    if (!store) return res.status(404).json({ msg: "Store not found" });
    res.json(store);
  }
  catch (err)
  {
    console.error("❌ Store update failed:", err);
    res.status(500).json({ msg: "Store update failed" });
  }
});

module.exports = router;