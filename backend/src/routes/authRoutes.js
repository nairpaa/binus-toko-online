import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, refresh, logout, logoutAll, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Cegah tebak-tebakan password: maksimal 5 kali gagal login per email dalam 15 menit.
// Login yang berhasil tidak dihitung. Kuncinya email (bukan IP), jadi tetap efektif
// walaupun request lewat beberapa proxy seperti Vercel dan Render.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => String(req.body?.email ?? '').trim().toLowerCase() || '(tanpa-email)',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  message: {
    code: 'TOO_MANY_ATTEMPTS',
    message: 'Terlalu banyak percobaan login gagal untuk email ini. Coba lagi 15 menit lagi.',
  },
});

// Cegah pembuatan akun spam: maksimal 10 percobaan daftar per IP per jam.
// Percobaan yang gagal (misalnya email sudah terdaftar) ikut dihitung, supaya fitur daftar
// juga tidak bisa dipakai untuk mengecek email mana saja yang punya akun secara massal.
// IP dibaca sesuai pengaturan TRUST_PROXY di server.js.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    code: 'TOO_MANY_REGISTRATIONS',
    message: 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi 1 jam lagi.',
  },
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', requireAuth, logoutAll);
router.get('/me', requireAuth, getMe);

export default router;
