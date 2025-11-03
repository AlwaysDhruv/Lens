const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    threadId: 
      { type: String,
        index: true
      },
      from:
      {
        type: String,
        enum: ["admin", "seller", "user"],
        required: true
      },
      fromEmail:
      {
        type: String,
        required: true
      },
      to:
      {
        type: String,
        enum: ["admin", "seller", "user"],
        required: true
      },
      toEmail:
      {
        type: String,
        required: true
      },
      subject:
      {
        type: String,
        required: true
      },
      message:
      {
        type: String,
        required: true
      },
      replied:
      {
        type: Boolean,
        default: false
      },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Contact", contactSchema);