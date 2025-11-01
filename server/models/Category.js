const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // 🔒 links category to its creator
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String },
    description: { type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

// 🧠 Generate slug automatically
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// ✅ Make name unique *per seller*, not globally
categorySchema.index({ seller: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
