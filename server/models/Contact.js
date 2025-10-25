const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  message: { type: String, required: true },
  from: { type: String, enum: ['user', 'admin'], default: 'user' }, // who sent it
  subject: { type: String, default: '' },
  replied: { type: Boolean, default: false },
  replyMessage: { type: String, default: '' },
  repliedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
