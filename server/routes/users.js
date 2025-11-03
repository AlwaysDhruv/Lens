const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) =>
{
  try
  {
    const role = req.user.role;
    let filter = {};

    if (role === "admin")
    {
      filter = { role: "seller" };
    }
    else if (role === "seller")
    {
      filter = { role: { $in: ["admin", "buyer"] } };
    }
    else if (role === "buyer")
    {
      filter = { role: "seller" };
    }
    else
    {
      return res.status(403).json({ msg: "Access denied for this role" });
    }

    const users = await User.find(filter).select("name email role");
    res.json(users);
  }
  catch (err)
  {
    console.error("❌ Failed to load users:", err);
    res.status(500).json({ msg: "Failed to load users" });
  }
});

router.delete("/:id", auth, async (req, res) =>
{
  try
  {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Only admins can delete users" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "✅ User deleted successfully" });
  }
  catch (err)
  {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ msg: "Failed to delete user" });
  }
});

module.exports = router;