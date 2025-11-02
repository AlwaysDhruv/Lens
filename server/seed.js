const mongoose = require("mongoose");
const User = require("./models/User");
const Store = require("./models/Store");
const Category = require("./models/Category");
const Product = require("./models/Product");

// ✅ Replace with your database
mongoose.connect("mongodb://127.0.0.1:27017/lensgallery", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Get seller email from command line
const sellerEmail = process.argv[2];

if (!sellerEmail) {
  console.log("❌ Please provide seller email:");
  console.log("   node seed/addDataForSeller.js seller@gmail.com");
  process.exit();
}

const categoriesData = [
  { name: "Sunglasses", description: "UV-protected eyewear for outdoor style." },
  { name: "Prescription Glasses", description: "Frames for corrective lenses." },
  { name: "Kids Frames", description: "Safe, flexible frames for children." },
  { name: "Sports Eyewear", description: "Impact-resistant eyewear for athletes." },
  { name: "Blue Light Glasses", description: "Protective eyewear for screen use." },
  { name: "Premium Collection", description: "Designer-grade handcrafted frames." },
  { name: "Budget Frames", description: "Affordable, durable eyewear." },
  { name: "Reading Glasses", description: "Magnified clarity for reading." },
  { name: "Stylish Metal Frames", description: "Lightweight high-grade metal frames." },
  { name: "Rimless Minimal Frames", description: "Ultra-light rimless elegant frames." }
];

const productsData = [
  { name: "UrbanShield Sunglasses", price: 1299, stock: 12, category: "Sunglasses" },
  { name: "AeroVision Sport Shades", price: 1899, stock: 9, category: "Sports Eyewear" },
  { name: "BlueGuard Anti-Glare", price: 999, stock: 20, category: "Blue Light Glasses" },
  { name: "Classic Oval Readers", price: 699, stock: 25, category: "Reading Glasses" },
  { name: "KidsFlex HERO", price: 799, stock: 18, category: "Kids Frames" },
  { name: "PureMetal Gold Frame", price: 2199, stock: 7, category: "Stylish Metal Frames" },
  { name: "FeatherRim Ultra Light", price: 2599, stock: 5, category: "Rimless Minimal Frames" },
  { name: "VisionCare Rx Frame", price: 1499, stock: 30, category: "Prescription Glasses" },
  { name: "OptiBudget Basic", price: 499, stock: 40, category: "Budget Frames" },
  { name: "Luxora Signature", price: 3299, stock: 6, category: "Premium Collection" },
  { name: "CoolWave Street Glasses", price: 1399, stock: 14, category: "Sunglasses" },
  { name: "SportX Performance Goggles", price: 1999, stock: 8, category: "Sports Eyewear" },
  { name: "WorkShield BlueCut", price: 1199, stock: 19, category: "Blue Light Glasses" },
  { name: "CrystalLens Reader Pro", price: 799, stock: 16, category: "Reading Glasses" },
  { name: "LightFrame Essential", price: 1299, stock: 28, category: "Prescription Glasses" },
  { name: "ValueFit Everyday", price: 449, stock: 35, category: "Budget Frames" },
  { name: "VelvetGloss Premium", price: 3499, stock: 4, category: "Premium Collection" },
  { name: "AirLite Minimal", price: 2199, stock: 10, category: "Rimless Minimal Frames" },
  { name: "KiddoColor Rainbow", price: 699, stock: 22, category: "Kids Frames" },
  { name: "PilotMetal Aviator", price: 1599, stock: 17, category: "Stylish Metal Frames" }
];

async function run() {
  try {
    console.log(`🔍 Looking for seller: ${sellerEmail}`);
    const seller = await User.findOne({ email: sellerEmail });

    if (!seller) {
      console.log("❌ Seller not found.");
      return;
    }

    console.log("✅ Seller found:", seller.name);

    console.log("🔍 Finding store...");
    const store = await Store.findOne({ owner: seller._id });

    if (!store) {
      console.log("❌ This seller does not have a store.");
      return;
    }

    console.log("✅ Store found:", store.name);

    console.log("🧹 Removing old categories/products for this seller...");
    await Category.deleteMany({ seller: seller._id });
    await Product.deleteMany({ seller: seller._id });

    console.log("📦 Creating categories...");
    const categoryMap = {};
    for (const c of categoriesData) {
      const category = await Category.create({
        ...c,
        seller: seller._id,
        products: []
      });
      categoryMap[c.name] = category;
    }

    console.log("🕶 Creating products...");
    for (const p of productsData) {
      const product = await Product.create({
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description || p.name,
        seller: seller._id,
        store: store._id,
        category: categoryMap[p.category]._id,
      });

      categoryMap[p.category].products.push(product._id);
      await categoryMap[p.category].save();
    }

    console.log("🎉 Done! Data inserted successfully.");
    
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

run();
