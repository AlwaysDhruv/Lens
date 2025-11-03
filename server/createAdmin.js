require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin()
{
  try
  {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 MongoDB connected for admin check');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists)
    {
      console.log('✅ Admin already exists:', adminExists.email);
      await mongoose.connection.close();
      return;
    }

    const hash = await bcrypt.hash('priyesh123', 10);
    const admin = new User(
    {
      name: 'Priyesh',
      email: 'priyeshvansjariya@gmail.com',
      password: hash,
      role: 'admin'
    });

    await admin.save();
    console.log('🛠️ Admin(Priyesh) created:');
    console.log('   Email: priyeshvansjariya@gmail.com');
    console.log('   Password: priyesh123');

    await mongoose.connection.close();
  }
  catch (err)
  {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();