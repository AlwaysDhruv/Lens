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
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate({
        path: 'items.product',
        select: 'name imageUrl' // Get product name and image
      })
      .populate({
        path: 'items.seller',
        select: 'name' // Get seller's name
      })
      .populate({
        path: 'items.store',
        select: 'name' // Get store's name
      });
      
    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch buyer orders:", err);
    res.status(500).json({ msg: "Error fetching orders" });
  }
});

// Seller orders
router.get('/seller', auth, roles(['seller']), async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id }).populate('buyer', 'name');
  res.json(orders);
});

router.put('/:id/request-cancellation', auth, roles(['buyer']), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: req.user._id // Ensure the buyer owns this order
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Buyers can only request cancellation if the order hasn't shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ msg: 'Cannot cancel an order that has already been shipped' });
    }

    // Prevent duplicate requests
    if (order.status === 'cancellation_requested' || order.status === 'cancelled') {
      return res.status(400).json({ msg: 'Cancellation already requested or processed' });
    }

    order.status = 'cancellation_requested';
    await order.save();
    
    // Re-populate the data to send back the same format as the GET route
    const updatedOrder = await Order.findById(order._id)
      .populate({ path: 'items.product', select: 'name imageUrl' })
      .populate({ path: 'items.seller', select: 'name' })
      .populate({ path: 'items.store', select: 'name' });

    res.json(updatedOrder);

  } catch (err) {
    console.error('Order cancellation request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
