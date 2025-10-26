// server/routes/product.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const auth = require("../middleware/auth"); // if you require auth

// CREATE product (seller)
router.post("/", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // assume req.body has name, price, description, category, stock, imageUrl...
    const { name, price, description, category, stock, imageUrl } = req.body;
    const product = await Product.create([{ name, price, description, category, stock, imageUrl, seller: req.user._id }], { session });
    const prod = product[0];

    // push product id to category.products
    await Category.findByIdAndUpdate(category, { $push: { products: prod._id } }, { session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(prod);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ msg: "Create product failed" });
  }
});

// UPDATE product (handles category change)
router.put("/:id", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prodId = req.params.id;
    const updates = req.body; // name, price, category, etc.

    const existing = await Product.findById(prodId).session(session);
    if (!existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Product not found" });
    }

    const oldCategory = existing.category ? existing.category.toString() : null;
    const newCategory = updates.category ? updates.category.toString() : oldCategory;

    // apply updates to product
    Object.assign(existing, updates);
    await existing.save({ session });

    // if category changed, move product id between categories
    if (oldCategory && newCategory && oldCategory !== newCategory) {
      await Category.findByIdAndUpdate(oldCategory, { $pull: { products: existing._id } }, { session });
      await Category.findByIdAndUpdate(newCategory, { $addToSet: { products: existing._id } }, { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json(existing);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});

// DELETE product (remove from category.products as well)
router.delete("/:id", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prodId = req.params.id;
    const product = await Product.findById(prodId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: "Product not found" });
    }

    const categoryId = product.category;
    // delete product
    await Product.findByIdAndDelete(prodId).session(session);
    // remove product id from category.products
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, { $pull: { products: prodId } }, { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ msg: "Product deleted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
