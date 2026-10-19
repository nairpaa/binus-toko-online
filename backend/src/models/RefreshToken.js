import mongoose from 'mongoose';

// Satu dokumen = satu refresh token yang pernah diterbitkan.
// Token aslinya tidak disimpan, cuma hash SHA-256-nya. Jadi kalau database bocor,
// isinya tidak bisa langsung dipakai untuk login.
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Semua token hasil rotasi dari satu kali login berbagi "family" yang sama.
    // Kalau ada tanda pencurian, satu family dicabut sekaligus.
    family: {
      type: String,
      required: true,
      index: true,
    },
    // Kapan token ini kedaluwarsa (7 hari sejak diterbitkan, tapi tidak melewati sessionExpiresAt).
    expiresAt: {
      type: Date,
      required: true,
    },
    // Batas mutlak sesi (30 hari sejak login). Diwariskan ke semua token hasil rotasi.
    sessionExpiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: Date,
    revokedReason: {
      type: String,
      enum: ['rotated', 'logout', 'logout_all', 'reuse_detected'],
    },
    userAgent: String,
  },
  { timestamps: true }
);

// TTL index: MongoDB menghapus sendiri dokumen yang sudah lewat expiresAt,
// jadi koleksi ini tidak menumpuk selamanya.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
