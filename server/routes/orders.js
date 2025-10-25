const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Place order (Buyer)
router.post('/', auth, roles(['buyer']), async (req, res) => {
  const { items, address, phone, payment } = req.body;
  let total = 0;

  for (const item of items) {
    const prod = await Product.findById(item.product);
    if (!prod || prod.stock < item.quantity) return res.status(400).json({ msg: 'Invalid stock' });
    total += prod.price * item.quantity;
    prod.stock -= item.quantity;
    await prod.save();
  }

  const order = await Order.create({
    buyer: req.user._id,
    items,
    address,
    phone,
    payment,
    total
  });

  res.json({ msg: 'Order placed', order });
});

// Buyer orders
router.get('/buyer', auth, roles(['buyer']), async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate('items.product');
  res.json(orders);
});

// Seller orders
router.get('/seller', auth, roles(['seller']), async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id }).populate('buyer', 'name');
  res.json(orders);
});

module.exports = router;
