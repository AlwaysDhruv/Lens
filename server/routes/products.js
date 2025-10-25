const router = require('express').Router();
const multer = require('multer');
const Product = require('../models/Product');
const Store = require('../models/Store');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Create product (Seller)
router.post('/', auth, roles(['seller']), upload.single('image'), async (req, res) => {
  const { name, price, description, category, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const product = await Product.create({
    seller: req.user._id,
    store: req.user.store,
    name, price, description, category, stock, imageUrl
  });
  await Store.findByIdAndUpdate(req.user.store, { $inc: { totalProducts: 1 } });
  res.json(product);
});

// Get all (public)
router.get('/', async (req, res) => {
  const products = await Product.find().populate('store seller', 'name');
  res.json(products);
});

// Seller products
router.get('/my', auth, roles(['seller']), async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
});

// Delete product (seller only)
router.delete('/:id', auth, roles(['seller']), async (req, res) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ msg: 'Not found' });
  if (!prod.seller.equals(req.user._id)) return res.status(403).json({ msg: 'Not yours' });
  await prod.deleteOne();
  await Store.findByIdAndUpdate(req.user.store, { $inc: { totalProducts: -1 } });
  res.json({ msg: 'Deleted' });
});

module.exports = router;
