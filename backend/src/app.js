// Aplikasi Express-nya ada di sini, tanpa app.listen().
// - Lokal  : dijalankan oleh server.js (npm run dev / npm start)
// - Vercel : file ini di-export dan dijalankan Vercel sebagai serverless function
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Tanpa JWT_SECRET, token login tidak bisa dibuat dengan aman. Lebih baik aplikasi tidak jalan sama sekali.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET belum diisi. Isi di file .env (lokal) atau di Environment Variables (Vercel).');
}

// Berapa lapis proxy di depan server ini yang boleh dipercaya saat membaca IP asli pengunjung
// dari header X-Forwarded-For. IP ini dipakai rate limit registrasi.
// Kalau terlalu kecil, semua pengunjung terbaca sebagai IP proxy (berbagi satu kuota).
// Kalau terlalu besar, orang bisa memalsukan IP lewat header. Cek hasilnya di /api/health (clientIp).
function parseTrustProxy(value = 'loopback') {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === 'false') return false;
  return value;
}

const app = express();
app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

// Header keamanan standar: anti-clickjacking, anti MIME sniffing, HSTS, dan sejenisnya.
// helmet juga otomatis menghapus header X-Powered-By (tidak perlu memberi tahu dunia kita pakai Express).
app.use(helmet());

// Catatan: tidak ada CORS di sini. Browser selalu memanggil API lewat domain frontend sendiri
// (/api), lalu diteruskan ke server ini oleh proxy Vite (lokal) atau rewrite Vercel (production).
// Dengan begitu cookie refresh token bisa dipakai dengan aturan SameSite=Strict.
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'API Toko Online sudah jalan', endpoint: '/api/products' });
});

// Pastikan sudah tersambung ke MongoDB sebelum request API diproses.
// Lokal koneksinya sudah dibuka saat server start, di Vercel dibuka saat request pertama.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    res.status(503).json({ code: 'DB_UNAVAILABLE', message: 'Database sedang tidak bisa dihubungi, coba lagi sebentar' });
  }
});

// Cek kesehatan server dan database.
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'error',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    // IP kamu menurut server. Kalau beda dengan IP asli, sesuaikan TRUST_PROXY.
    clientIp: req.ip,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Dua middleware ini harus paling bawah, setelah semua route.
app.use(notFound);
app.use(errorHandler);

export default app;
