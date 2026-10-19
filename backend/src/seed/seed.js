// npm run seed        -> isi ulang produk contoh + buat akun admin
// npm run seed:admin  -> buat/reset akun admin saja, produk tidak disentuh
//
// Hati-hati, `npm run seed` menghapus semua produk lama lalu menggantinya dengan data contoh.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import products from './products.js';

const adminOnly = process.argv.includes('--admin-only');

async function seedProducts() {
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`Berhasil menambahkan ${inserted.length} produk contoh.`);
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di file .env');
  }

  // Akun lama dengan email yang sama dihapus dulu (beserta sesi login-nya),
  // jadi script ini sekalian bisa dipakai untuk reset password admin.
  const oldAdmin = await User.findOneAndDelete({ email });
  if (oldAdmin) await RefreshToken.deleteMany({ user: oldAdmin._id });

  await User.create({ name: process.env.ADMIN_NAME || 'Admin', email, password, role: 'admin' });
  console.log(`Akun admin ${email} siap dipakai untuk login.`);
}

await connectDB();

try {
  if (!adminOnly) await seedProducts();
  await seedAdmin();
} catch (err) {
  console.error('Seeding gagal:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
