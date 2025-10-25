const router = require('express').Router();
const Store = require('../models/Store');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Create/Update store (seller)
router.post('/', auth, roles(['seller']), async (req, res) => {
  const { name, description, type, address } = req.body;
  let store = await Store.findOne({ owner: req.user._id });
  if (store) {
    store.name = name;
    store.description = description;
    store.type = type;
    store.address = address;
    await store.save();
  } else {
    store = await Store.create({ owner: req.user._id, name, description, type, address });
    req.user.store = store._id;
    await req.user.save();
  }
  res.json(store);
});

// Get all stores
router.get('/', async (req, res) => {
  const stores = await Store.find().populate('owner', 'name');
  res.json(stores);
});

module.exports = router;
