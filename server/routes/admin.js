const router = require("express").Router();
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

/* =====================================================
   1️⃣ Send Email to User + Save to Contact Collection
===================================================== */
router.post("/send-email", auth, roles(["admin"]), async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message)
      return res.status(400).json({ msg: "All fields are required" });

    // Send email
    await sendEmail(email, subject, "", `<p>${message}</p>`);

    // Log in DB (so admin message shows in AdminMessages.jsx)
    const saved = await Contact.create({
      name: "Admin",
      email,
      subject,
      message,
      from: "admin",
      replied: false,
    });

    res.json({ msg: "✅ Email sent and logged successfully", data: saved });
  } catch (err) {
    console.error("Admin send-email error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   2️⃣ Get All Contact Messages
===================================================== */
router.get("/messages", auth, roles(["admin"]), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Admin messages fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   3️⃣ Get All Users
===================================================== */
router.get("/users", auth, roles(["admin"]), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   4️⃣ Get All Products (with Seller, Store, Buyer Info)
===================================================== */
router.get("/products", auth, roles(["admin"]), async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .populate("store", "name");

    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "name");

    // Map product ID → list of buyers
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

    // Attach buyers to each product
    const result = products.map((p) => ({
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

/* =====================================================
   5️⃣ Get Single Product Details (Admin)
===================================================== */
router.get("/products/:id", auth, roles(["admin"]), async (req, res) => {
  try {
    const p = await Product.findById(req.params.id)
      .populate("seller", "name email")
      .populate("store", "name");

    if (!p) return res.status(404).json({ msg: "Product not found" });

    const orders = await Order.find({ "items.product": p._id })
      .populate("buyer", "name email")
      .select("buyer createdAt");

    const buyers = orders.map((o) => ({
      name: o.buyer?.name,
      email: o.buyer?.email,
      date: o.createdAt,
    }));

    res.json({
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
  } catch (err) {
    console.error("Single product fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   6️⃣ Get All Orders
===================================================== */
router.get("/orders", auth, roles(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Admin orders fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
