import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {
  RefreshError,
  countActiveSessions,
  revokeAllSessions,
  revokeSession,
  rotateSession,
  startSession,
} from '../services/tokenService.js';

const REFRESH_COOKIE = 'refresh_token';

// Hash "palsu" untuk email yang tidak terdaftar. Tanpa ini, login dengan email asing dibalas
// jauh lebih cepat (tidak ada bcrypt), dan dari selisih waktunya orang bisa menebak email
// mana yang punya akun. Cost-nya sama dengan hash asli (10) supaya waktunya setara.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('cuma-penyeimbang-waktu', 10);

function refreshCookieOptions() {
  return {
    httpOnly: true, // tidak bisa dibaca JavaScript di browser, jadi aman dari pencurian lewat XSS
    secure: process.env.NODE_ENV === 'production', // di production hanya dikirim lewat HTTPS
    sameSite: 'strict', // tidak ikut terkirim kalau request-nya datang dari situs lain (cegah CSRF)
    path: '/api/auth', // cuma dikirim ke endpoint auth, bukan ke semua request
  };
}

// Umur cookie disamakan dengan umur token di database, jadi browser ikut membuangnya tepat waktu.
function setRefreshCookie(res, { token, expiresAt }) {
  res.cookie(REFRESH_COOKIE, token, { ...refreshCookieOptions(), expires: expiresAt });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
}

// Balasan standar setelah login atau registrasi berhasil.
// Access token dikirim di body, refresh token di cookie.
async function sendSession(res, user, req, status = 200) {
  const { accessToken, refresh } = await startSession(user, req.get('user-agent'));
  setRefreshCookie(res, refresh);
  res.status(status).json({ accessToken, user: user.toPublic() });
}

// POST /api/auth/register
export async function register(req, res) {
  // Field `role` sengaja tidak diambil dari body, jadi orang tidak bisa mendaftar sebagai admin.
  const { name, email, password } = req.body ?? {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

  if (typeof normalizedEmail === 'string' && (await User.exists({ email: normalizedEmail }))) {
    return res.status(409).json({ code: 'EMAIL_TAKEN', message: 'Email sudah terdaftar, silakan login' });
  }

  // Validasi nama/email/password dilakukan oleh schema User (lihat models/User.js).
  const user = await User.create({ name, email: normalizedEmail, password });
  await sendSession(res, user, req, 201);
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email dan password wajib diisi' });
  }

  // Dipaksa jadi string supaya tidak bisa diakali dengan kiriman objek
  // seperti {"$ne": null} (NoSQL injection).
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

  // bcrypt tetap dijalankan walaupun email tidak ditemukan, jadi lama prosesnya selalu sama.
  const passwordMatches = user
    ? await user.checkPassword(String(password))
    : await bcrypt.compare(String(password), DUMMY_PASSWORD_HASH).then(() => false);

  // Pesannya juga sengaja sama untuk email maupun password yang salah,
  // biar orang luar tidak bisa menebak email mana yang terdaftar.
  if (!passwordMatches) {
    return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' });
  }

  await sendSession(res, user, req);
}

// POST /api/auth/refresh
// Tidak butuh access token. Yang dipakai adalah refresh token di cookie.
export async function refresh(req, res) {
  try {
    const session = await rotateSession(req.cookies?.[REFRESH_COOKIE], req.get('user-agent'));
    if (session.refresh) setRefreshCookie(res, session.refresh);
    res.json({ accessToken: session.accessToken, user: session.user.toPublic() });
  } catch (err) {
    if (!(err instanceof RefreshError)) throw err;
    clearRefreshCookie(res);
    res.status(401).json({ code: err.code, message: err.message });
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  await revokeSession(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.json({ message: 'Berhasil keluar' });
}

// POST /api/auth/logout-all
// Mencabut semua refresh token milik user ini, jadi semua perangkat harus login ulang
// paling lambat saat access token mereka kedaluwarsa (maksimal 15 menit).
export async function logoutAll(req, res) {
  const revoked = await revokeAllSessions(req.user._id);
  clearRefreshCookie(res);
  res.json({ message: `Berhasil keluar dari ${revoked} sesi`, revoked });
}

// GET /api/auth/me
export async function getMe(req, res) {
  const activeSessions = await countActiveSessions(req.user._id);
  res.json({ ...req.user.toPublic(), activeSessions });
}
