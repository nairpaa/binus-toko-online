import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 5000;

// Tanpa JWT_SECRET, token login tidak bisa dibuat dengan aman. Lebih baik server tidak jalan sama sekali.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diisi di file .env. Lihat contohnya di .env.example.');
  process.exit(1);
}

// Berapa lapis proxy di depan server ini yang boleh dipercaya saat membaca IP asli pengunjung
// dari header X-Forwarded-For. IP ini dipakai rate limit registrasi.
//   - lokal      : 'loopback' (proxy Vite di komputer yang sama)
//   - production : 2 (proxy Vercel/Netlify + load balancer Render)
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
// (/api), lalu diteruskan ke server ini oleh proxy Vite (lokal) atau Vercel/Netlify (production).
// Dengan begitu cookie refresh token bisa dipakai dengan aturan SameSite=Strict.
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'API Toko Online sudah jalan', endpoint: '/api/products' });
});

// Dipakai Render untuk mengecek apakah server sehat. Kalau database putus, balas 503.
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

await connectDB();

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
