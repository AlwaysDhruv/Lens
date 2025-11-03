const router = require("express").Router();
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

router.post("/send-email", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message)
      return res.status(400).json({ msg: "All fields are required" });

    await sendEmail(email, subject, "", `<p>${message}</p>`);

    const saved = await Contact.create
    ({
      name: "Admin",
      email,
      subject,
      message,
      from: "admin",
      replied: false,
    });

    res.json({ msg: "✅ Email sent and logged successfully", data: saved });
  }
  catch (err)
  {
    console.error("Admin send-email error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/messages", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  }
  catch (err)
  {
    console.error("Admin messages fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/users", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const users = await User.find().sort({ createdAt: -1 }).populate
    ({
      path: "store",
      select: "name description address totalProducts categories owner",
    });

    const sellerIds = users
      .filter((u) => u.role === "seller")
      .map((u) => u._id);

    let products = [];
    if (sellerIds.length)
    {
      products = await Product.find({ seller: { $in: sellerIds } })
        .select("name price stock imageUrl store seller createdAt")
        .populate("store", "name");
    }

    const productsBySeller = {};
    products.forEach((p) => {
      const sid = p.seller?.toString();
      if (!sid) return;
      if (!productsBySeller[sid]) productsBySeller[sid] = [];
      productsBySeller[sid].push(p);
    });

    const usersWithExtra = users.map((u) => {
      const obj = u.toObject();
      if (obj.role === "seller")
      {
        obj.products = productsBySeller[obj._id] || [];
      }
      else
      {
        obj.products = [];
      }
      return obj;
    });

    res.json(usersWithExtra);
  }
  catch (err)
  {
    console.error("Admin users fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/products", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const products = await Product.find()
      .populate("seller", "name email")
      .populate("store", "name");

    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "name");
      
    const buyerMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.product?._id?.toString();
        if (!pid) return;
        if (!buyerMap[pid]) buyerMap[pid] = [];
        buyerMap[pid].push({
          name: order.buyer?.name || "Unknown",
          email: order.buyer?.email || "Unknown",
          date: order.createdAt,
        });
      });
    });

    const result = products.map((p) => (
    {
      _id: p._id,
      name: p.name,
      price: p.price,
      seller: p.seller,
      store: p.store,
      buyers: buyerMap[p._id.toString()] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("Admin product fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/products/:id", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const p = await Product.findById(req.params.id)
      .populate("seller", "name email")
      .populate("store", "name");

    if (!p) return res.status(404).json({ msg: "Product not found" });

    const orders = await Order.find({ "items.product": p._id })
      .populate("buyer", "name email")
      .select("buyer createdAt");

    const buyers = orders.map((o) => (
    {
      name: o.buyer?.name,
      email: o.buyer?.email,
      date: o.createdAt,
    }));

    res.json(
    {
      _id: p._id,
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      stock: p.stock,
      imageUrl: p.imageUrl,
      seller: p.seller,
      store: p.store,
      buyers,
    });
  }
  catch (err)
  {
    console.error("Single product fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/orders", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate({
        path: "items.product",
        select: "name price imageUrl store seller",
        populate: [
          { path: "seller", select: "name email" },
          { path: "store", select: "name" }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  }
  catch (err)
  {
    console.error("Admin orders fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/users/:id", auth, roles(["admin"]), async (req, res) =>
{
  try
  {
    const uid = req.params.id;

    const user = await User.findById(uid).populate
    ({
      path: "store",
      select: "name description address totalProducts categories owner",
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    let products = [];
    if (user.role === "seller")
    {
      products = await Product.find({ seller: user._id })
        .select("name price stock imageUrl store createdAt")
        .populate("store", "name");
    }

    const result = user.toObject();
    result.products = products;

    res.json(result);
  }
  catch (err)
  {
    console.error("Admin single-user fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;