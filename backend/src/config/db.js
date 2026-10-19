import mongoose from 'mongoose';

// Kalau MONGO_URI belum diisi di .env, pakai MongoDB lokal saja.
const DEFAULT_URI = 'mongodb://127.0.0.1:27017/toko_online';

export default async function connectDB() {
  const uri = process.env.MONGO_URI || DEFAULT_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB terhubung: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    // Tanpa database, API-nya juga tidak bisa apa-apa. Jadi langsung berhenti saja.
    console.error('Gagal terhubung ke MongoDB:', err.message);
    console.error('Pastikan MongoDB sudah jalan dan MONGO_URI di file .env sudah benar.');
    process.exit(1);
  }
}
