import User from '../models/User.js';
import { verifyAccessToken } from '../services/tokenService.js';

// Pasang di route yang butuh login.
// Request harus membawa header: Authorization: Bearer <access token>
//
// Setiap balasan 401 membawa `code`, supaya frontend tahu harus berbuat apa.
// Contohnya, TOKEN_EXPIRED berarti frontend cukup minta access token baru lewat /api/auth/refresh.
export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ code: 'NO_TOKEN', message: 'Silakan login terlebih dahulu' });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Access token sudah kedaluwarsa' });
    }
    return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Token login tidak valid, silakan login lagi' });
  }

  // Data user diambil ulang dari database, bukan dari isi token. Jadi kalau akunnya dihapus
  // atau role-nya diubah, efeknya langsung terasa tanpa menunggu token kedaluwarsa.
  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ code: 'USER_NOT_FOUND', message: 'Akun tidak ditemukan, silakan login lagi' });
  }

  req.user = user;
  next();
}

// Pasang setelah requireAuth untuk route yang khusus admin.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Fitur ini khusus admin' });
  }
  next();
}
