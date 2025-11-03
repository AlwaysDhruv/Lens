const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    seller:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:
    { 
      type: String,
      required: true,
      trim: true
    },
    slug:
    {
      type: String
    },
    description:
    {
      type: String
    },
    products:
    [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
  },
  {
    timestamps: true
  }
);

categorySchema.pre("save", function (next)
{
  if (this.isModified("name"))
  {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
  next();
});

categorySchema.index
(
  { seller: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model("Category", categorySchema);