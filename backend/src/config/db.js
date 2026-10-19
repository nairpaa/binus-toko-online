import mongoose from 'mongoose';

// Kalau MONGO_URI belum diisi di .env, pakai MongoDB lokal saja.
const DEFAULT_URI = 'mongodb://127.0.0.1:27017/toko_online';

// Koneksi disimpan dan dipakai ulang. Ini penting di Vercel: satu instance function
// melayani banyak request, jadi tidak perlu konek ulang ke MongoDB setiap kali.
let connecting = null;

export default function connectDB() {
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGO_URI || DEFAULT_URI, { serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log(`MongoDB terhubung: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        connecting = null; // biar request berikutnya mencoba konek lagi
        throw err;
      });
  }
  return connecting;
}
