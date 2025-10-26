// server/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Category = require("./models/Category");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lensGallery";

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("✅ connected to mongo");

  try {
    // clear
    await Product.deleteMany({});
    await Category.deleteMany({});

    // create categories
    const categories = await Category.insertMany([
      {
        name: "Smart Goggles",
        description: "High-tech goggles with AR, sensors and connectivity.",
      },
      {
        name: "Outdoor Goggles",
        description: "Durable goggles for biking, skiing and outdoor sports.",
      },
      {
        name: "Indoor Goggles",
        description: "Anti-reflective and safety goggles for indoor use.",
      },
      {
        name: "Blue Filter Goggles",
        description: "Blue-light blocking eyewear for screen-heavy users.",
      },
      {
        name: "Water Goggles",
        description: "Waterproof and anti-fog goggles for swimming/diving.",
      },
    ]);

    // prepare products (each points to a category)
    const productsData = [
      {
        name: "Aero Vision Classic Goggles",
        price: 1299,
        category: categories[1]._id,
        description: "Lightweight, anti-fog goggles perfect for rides and workouts. UV400 protection included.",
        stock: 40,
        imageUrl: "/uploads/aero-vision-classic.jpg",
      },
      {
        name: "ZoomTech Night Vision Goggles",
        price: 2599,
        category: categories[0]._id,
        description: "Advanced night vision goggles with IR sensor and fog-resistant lenses.",
        stock: 25,
        imageUrl: "/uploads/zoomtech-night-vision.jpg",
      },
      {
        name: "OpticPro Sport Goggles",
        price: 1799,
        category: categories[1]._id,
        description: "Designed for athletes. Scratch-proof, aerodynamic design with adjustable strap.",
        stock: 30,
        imageUrl: "/uploads/opticpro-sport.jpg",
      },
      {
        name: "SkyLens BlueShield Goggles",
        price: 2199,
        category: categories[3]._id,
        description: "Blue light filtering lenses ideal for long computer sessions.",
        stock: 50,
        imageUrl: "/uploads/skylens-blue.jpg",
      },
      {
        name: "HydroEdge Water Sports Goggles",
        price: 999,
        category: categories[4]._id,
        description: "High-seal waterproof goggles with anti-fog film.",
        stock: 60,
        imageUrl: "/uploads/hydroedge-water.jpg",
      },
      {
        name: "VisionPro Digital Goggles",
        price: 4499,
        category: categories[0]._id,
        description: "Smart digital display goggles with AR overlay and Bluetooth connectivity.",
        stock: 15,
        imageUrl: "/uploads/visionpro-digital.jpg",
      },
      {
        name: "SunGuard Polarized Goggles",
        price: 1899,
        category: categories[1]._id,
        description: "Polarized outdoor goggles for skiing, biking, and hiking.",
        stock: 45,
        imageUrl: "/uploads/sunguard-polarized.jpg",
      },
      {
        name: "CrystalView Anti-Reflective Goggles",
        price: 1599,
        category: categories[2]._id,
        description: "Anti-reflective, shatterproof goggles designed for clear indoor vision.",
        stock: 35,
        imageUrl: "/uploads/crystalview-anti-reflective.jpg",
      },
      {
        name: "AquaShield Diving Goggles",
        price: 2999,
        category: categories[4]._id,
        description: "Wide-lens waterproof diving goggles with pressure equalization valve.",
        stock: 20,
        imageUrl: "/uploads/aquashield-diving.jpg",
      },
      {
        name: "TechView AR Smart Goggles",
        price: 6999,
        category: categories[0]._id,
        description: "Augmented reality-enabled smart goggles with voice commands and HUD display.",
        stock: 10,
        imageUrl: "/uploads/techview-ar.jpg",
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    // populate Category.products arrays
    for (const cat of categories) {
      const ids = insertedProducts
        .filter((p) => p.category.toString() === cat._id.toString())
        .map((p) => p._id);
      if (ids.length) {
        await Category.findByIdAndUpdate(cat._id, { $set: { products: ids } });
      }
    }

    console.log("✅ seed completed");
  } catch (err) {
    console.error("❌ seed error", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 disconnected");
  }
}

main();
