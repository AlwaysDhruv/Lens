const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const auth = require("../middleware/auth");

/* =====================================================
   Helper: Generate JWT (✅ FIXED to include role)
===================================================== */
function generateToken(user) {
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* =====================================================
   USER REGISTRATION
===================================================== */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || 'buyer',
    });

    const token = generateToken(user);

    res.json({
      msg: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   USER PROFILE
===================================================== */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile route error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   USER LOGIN
===================================================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid email or password' });

    const token = generateToken(user);

    res.json({
      msg: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   FORGOT PASSWORD - SEND OTP
===================================================== */
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user)
      // security: don't reveal if account exists
      return res.json({ msg: 'If an account exists, OTP has been sent.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      user.email,
      'Lens Gallery Password Reset OTP',
      `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.`
    );

    console.log(`📧 Sent OTP ${otp} to ${email}`);
    res.json({ msg: 'If an account exists, OTP has been sent.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   VERIFY OTP
===================================================== */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ msg: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp)
      return res.status(400).json({ msg: 'Invalid OTP' });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ msg: 'OTP expired' });

    res.json({ msg: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =====================================================
   RESET PASSWORD
===================================================== */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ msg: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp)
      return res.status(400).json({ msg: 'Invalid OTP or user' });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ msg: 'OTP expired' });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.put("/update-details", auth, async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = name || user.name;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    
    res.json({
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ msg: err.message });
  }
});
module.exports = router;
