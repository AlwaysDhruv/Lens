const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    owner:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name:
    {
      type: String,
      required: true
    },
    description: String,
    type: String,
    address: String,
    totalProducts:
    {
      type: Number,
      default: 0
    },
    categories:
    [
      {
        type: String
      }
    ],
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Store", storeSchema);