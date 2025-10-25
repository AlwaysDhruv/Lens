const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Admin only
router.get('/', auth, roles(['admin']), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.delete('/:id', auth, roles(['admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'User deleted' });
});

module.exports = router;