require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    // connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 MongoDB connected for admin check');

    // check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('✅ Admin already exists:', adminExists.email);
      await mongoose.connection.close();
      return;
    }

    // create default admin
    const hash = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Default Admin',
      email: 'sonavanebharat92@gmail.com',
      password: hash,
      role: 'admin'
    });

    await admin.save();
    console.log('🛠️ Admin created:');
    console.log('   Email: admin@lensgallery.com');
    console.log('   Password: admin123');

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();