// Semua urusan token login ada di sini:
// - access token  : JWT berumur pendek, dikirim di header Authorization
// - refresh token : string acak berumur panjang, disimpan di cookie httpOnly,
//                   dirotasi setiap dipakai, dan tercatat di database (hash-nya saja)
// Penjelasan lengkap alurnya ada di docs/AUTENTIKASI.md
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Toleransi kalau refresh token lama terpakai lagi sesaat setelah dirotasi.
// Biasanya ini dua tab yang refresh barengan, bukan pencurian.
const REUSE_GRACE_MS = 10 * 1000;

// Umur satu refresh token. Setiap rotasi menerbitkan token baru dengan umur ini lagi (bergeser).
function refreshTokenMaxAgeMs() {
  return (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) * DAY_MS;
}

// Batas mutlak satu sesi login, dihitung sejak login. Tanpa batas ini, user yang aktif terus
// (atau pencuri yang terus me-refresh) tidak akan pernah diminta login ulang.
function sessionMaxDays() {
  return Number(process.env.SESSION_MAX_DAYS) || 30;
}

// Error khusus supaya controller tahu ini kegagalan refresh (balas 401), bukan error server.
export class RefreshError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ---------- Access token ----------

export function createAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
}

export function verifyAccessToken(token) {
  // Algoritmanya dikunci, jadi token palsu dengan "alg: none" langsung ditolak.
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
}

// ---------- Refresh token ----------

// Hasilnya { token, expiresAt }. expiresAt dipakai controller untuk umur cookie.
async function issueRefreshToken({ userId, family, sessionExpiresAt, userAgent }) {
  // Sengaja bukan JWT: cukup string acak yang panjang. Validitasnya ditentukan oleh database,
  // jadi bisa dicabut kapan saja (logout, logout semua perangkat, atau saat terdeteksi dicuri).
  const token = crypto.randomBytes(48).toString('base64url');

  // Umurnya 7 hari, tapi tidak boleh melewati batas akhir sesi.
  const expiresAt = new Date(Math.min(Date.now() + refreshTokenMaxAgeMs(), sessionExpiresAt.getTime()));

  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(token),
    family,
    expiresAt,
    sessionExpiresAt,
    userAgent: userAgent?.slice(0, 200),
  });

  return { token, expiresAt };
}

// Dipanggil saat login atau registrasi. Setiap login memulai "family" baru
// dan batas akhir sesi baru.
export async function startSession(user, userAgent) {
  const refresh = await issueRefreshToken({
    userId: user._id,
    family: crypto.randomUUID(),
    sessionExpiresAt: new Date(Date.now() + sessionMaxDays() * DAY_MS),
    userAgent,
  });
  return { accessToken: createAccessToken(user), refresh };
}

// Tukar refresh token lama dengan pasangan token baru (rotasi).
// `refresh` di hasil bisa null: artinya cookie di browser tidak perlu diganti.
export async function rotateSession(oldToken, userAgent) {
  if (!oldToken) {
    throw new RefreshError('NO_REFRESH_TOKEN', 'Sesi login tidak ditemukan, silakan login lagi');
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(oldToken) });
  if (!stored) {
    throw new RefreshError('REFRESH_INVALID', 'Sesi login tidak valid, silakan login lagi');
  }

  if (stored.revokedAt && stored.revokedReason !== 'rotated') {
    // Sudah dicabut lewat logout, logout semua perangkat, atau deteksi pencurian sebelumnya.
    throw new RefreshError('REFRESH_REVOKED', 'Sesi login kamu sudah diakhiri, silakan login lagi');
  }

  if (stored.revokedAt) {
    // Token ini sudah pernah ditukar (dirotasi) tapi dipakai lagi.
    const justRotated = Date.now() - stored.revokedAt.getTime() < REUSE_GRACE_MS;

    if (!justRotated) {
      // Pemilik asli tidak mungkin melakukan ini, karena browsernya selalu memegang token terbaru.
      // Anggap dicuri, cabut seluruh family-nya supaya pencuri maupun pemilik harus login ulang.
      await RefreshToken.updateMany(
        { family: stored.family, revokedAt: null },
        { revokedAt: new Date(), revokedReason: 'reuse_detected' }
      );
      throw new RefreshError(
        'REFRESH_REUSED',
        'Sesi login terdeteksi dipakai di tempat lain. Demi keamanan, silakan login lagi'
      );
    }

    // Masih dalam masa toleransi: cookie di browser sudah berisi token baru dari request
    // sebelumnya, jadi cukup beri access token baru tanpa merotasi lagi.
    const user = await User.findById(stored.user);
    if (!user) throw new RefreshError('USER_NOT_FOUND', 'Akun tidak ditemukan, silakan login lagi');
    return { user, accessToken: createAccessToken(user), refresh: null };
  }

  if (stored.expiresAt <= new Date()) {
    const reachedSessionMax = stored.sessionExpiresAt <= new Date();
    throw new RefreshError(
      'REFRESH_EXPIRED',
      reachedSessionMax
        ? `Demi keamanan, sesi login dibatasi ${sessionMaxDays()} hari. Silakan login lagi`
        : 'Sesi login sudah habis, silakan login lagi'
    );
  }

  const user = await User.findById(stored.user);
  if (!user) throw new RefreshError('USER_NOT_FOUND', 'Akun tidak ditemukan, silakan login lagi');

  // Tandai token lama sebagai "sudah dirotasi". Syarat revokedAt: null memastikan
  // kalau ada dua request bersamaan, cuma satu yang berhasil menerbitkan token baru.
  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: stored._id, revokedAt: null },
    { revokedAt: new Date(), revokedReason: 'rotated' }
  );
  if (!claimed) {
    return { user, accessToken: createAccessToken(user), refresh: null };
  }

  // Token baru tetap di family yang sama dan mewarisi batas akhir sesi yang sama.
  const refresh = await issueRefreshToken({
    userId: user._id,
    family: stored.family,
    sessionExpiresAt: stored.sessionExpiresAt,
    userAgent,
  });
  return { user, accessToken: createAccessToken(user), refresh };
}

// Logout biasa: cabut refresh token milik perangkat ini saja.
export async function revokeSession(token) {
  if (!token) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(token), revokedAt: null },
    { revokedAt: new Date(), revokedReason: 'logout' }
  );
}

// Logout dari semua perangkat: cabut semua refresh token milik user ini.
export async function revokeAllSessions(userId) {
  const result = await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date(), revokedReason: 'logout_all' }
  );
  return result.modifiedCount;
}

export async function countActiveSessions(userId) {
  return RefreshToken.countDocuments({ user: userId, revokedAt: null, expiresAt: { $gt: new Date() } });
}
