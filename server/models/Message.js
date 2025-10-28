const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String },
  message: { type: String, required: true },
  senderRole: { type: String },
  receiverRole: { type: String },
  sentEmail: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
