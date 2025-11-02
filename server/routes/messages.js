const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");
const sendMail = require("../utils/sendEMail");
const roles = require("../middleware/roles");

// 🧠 Role permissions map
const allowed = {
  admin: ["seller"],
  seller: ["admin", "buyer"],
  buyer: ["seller"],
};

router.post("/send", auth, async (req, res) => {
  try {
    const { receiverId, subject, message } = req.body;
    if (!receiverId || !message)
      return res.status(400).json({ msg: "Receiver and message required" });

    const sender = req.user;
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ msg: "Receiver not found" });

    // ✅ Role rule enforcement
    if (!allowed[sender.role]?.includes(receiver.role)) {
      return res.status(403).json({
        msg: `${sender.role} cannot message ${receiver.role}`
      });
    }

    const newMsg = await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      subject,
      message,
      senderRole: sender.role,
      receiverRole: receiver.role,
    });

    const io = req.app.get("io");
    io.to(sender._id.toString()).emit("new_message", newMsg);
    io.to(receiver._id.toString()).emit("new_message", newMsg);

    sendMail(
      receiver.email,
      subject || `New Message from ${sender.name}`,
      `<p>${message}</p>`
    );

    res.status(201).json({ msg: "Message sent successfully", data: newMsg });

  } catch (err) {
    console.error("❌ Message send error:", err);
    res.status(500).json({ msg: "Failed to send message" });
  }
});

/* =====================================================
   GET /api/messages — Get all messages for current user
===================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Fetch messages error:", err);
    res.status(500).json({ msg: "Failed to fetch messages" });
  }
});

// GET /api/messages/thread/:userId
router.get("/thread/:userId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load conversation" });
  }
});

router.get("/inbox", auth, async (req, res) => {
  const messages = await Message.find({ receiver: req.user._id })
    .populate("sender", "name email role")
    .sort({ createdAt: -1 });

  res.json(messages);
});

router.get("/admin-unread-count", auth, roles(["admin"]), async (req, res) => {
  const unread = await Message.countDocuments({ receiver: req.user._id, read: false });
  res.json({ unread });
});

/* =====================================================
   PATCH /api/messages/:id/read — Mark a message as read
===================================================== */
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!msg) return res.status(404).json({ msg: "Message not found" });

    res.json({ msg: "Marked as read", data: msg });
  } catch (err) {
    console.error("Read update failed:", err);
    res.status(500).json({ msg: "Failed to update read status" });
  }
});


module.exports = router;
