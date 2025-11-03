const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Store = require('./models/Store');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lensgallery';
const DEFAULT_PASSWORD = '123';

async function hashPassword(pw)
{
  return bcrypt.hash(pw, 10);
}

async function main()
{
  console.log(`Connecting to ${MONGO_URI} ...`);
  await mongoose.connect(MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try
  {
    const sellersSeed = Array.from({ length: 5 }, (_, i) => (
    {
      name: `Seller ${i + 1}`,
      email: `seller${i + 1}@lensgallery.com`,
    }));

    const buyersSeed = Array.from({ length: 5 }, (_, i) => (
    {
      name: `Buyer ${i + 1}`,
      email: `buyer${i + 1}@lensgallery.com`,
      address: `${i + 1} Buyer Lane, Demo City`,
      phone: `90000000${(i + 1).toString().padStart(2, '0')}`,
    }));

    const allEmails = sellersSeed.map(s => s.email).concat(buyersSeed.map(b => b.email));
    console.log('Removing any existing seeded users...');
    await User.deleteMany({ email: { $in: allEmails } });

    const storeNames = sellersSeed.map(s => `${s.name}'s Store`);
    console.log('Removing any existing seeded stores...');
    await Store.deleteMany({ name: { $in: storeNames } });

    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    console.log('Creating sellers and stores...');
    const createdSellers = [];
    for (const s of sellersSeed)
    {
      const user = new User(
      {
        name: s.name,
        email: s.email,
        password: passwordHash,
        role: 'seller',
      });
      await user.save();
      const store = new Store(
      {
        owner: user._id,
        name: `${s.name}'s Store`,
        description: `${s.name} sells quality products.`,
        type: 'General',
        address: `${Math.floor(Math.random() * 999)} Market Road, Demo City`,
        totalProducts: 0,
        categories: ['General'],
      });
      await store.save();

      user.store = store._id;
      await user.save();

      createdSellers.push({ user, store });
      console.log(`  - ${s.email} -> store "${store.name}"`);
    }

    console.log('Creating buyers...');
    const createdBuyers = [];
    for (const b of buyersSeed)
    {
      const user = new User(
      {
        name: b.name,
        email: b.email,
        password: passwordHash,
        role: 'buyer',
        address: b.address,
        phone: b.phone,
      });
      await user.save();
      createdBuyers.push(user);
      console.log(`  - ${b.email}`);
    }

    console.log('\nSeed complete.');
    console.log(`Sellers created: ${createdSellers.length}`);
    createdSellers.forEach((s, i) => console.log(`  ${i + 1}. ${s.user.email} -> ${s.store.name} (id: ${s.store._id})`));
    console.log(`Buyers created: ${createdBuyers.length}`);
    createdBuyers.forEach((b, i) => console.log(`  ${i + 1}. ${b.email}`));

    console.log(`\nAll accounts use password: "${DEFAULT_PASSWORD}" (hashed in DB).`);
    console.log('Reminder: "123" is a very weak password — rotate before sharing DB or deploying.');
  }
  catch (err)
  {
    console.error('Seeding error:', err);
  }
  finally
  {
    await mongoose.disconnect();
    console.log('Disconnected. Exiting.');
    process.exit(0);
  }
}

main();