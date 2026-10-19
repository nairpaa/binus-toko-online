// Menjalankan API sebagai server biasa (lokal: npm run dev / npm start).
// Di Vercel file ini tidak dipakai, Vercel langsung memakai app.js.
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Tanpa database, API-nya juga tidak bisa apa-apa. Jadi langsung berhenti saja.
try {
  await connectDB();
} catch (err) {
  console.error('Gagal terhubung ke MongoDB:', err.message);
  console.error('Pastikan MongoDB sudah jalan dan MONGO_URI di file .env sudah benar.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
