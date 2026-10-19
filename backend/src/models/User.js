import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
      maxlength: [50, 'Nama maksimal 50 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [8, 'Password minimal 8 karakter'],
      // bcrypt cuma membaca 72 karakter pertama, sisanya diabaikan diam-diam. Jadi dibatasi dari awal.
      maxlength: [72, 'Password maksimal 72 karakter'],
      // Password tidak ikut terbawa saat query biasa. Kalau butuh, harus diminta pakai .select('+password').
      select: false,
    },
    // Akun dari halaman registrasi selalu 'user'. Admin hanya dibuat lewat script seed.
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
  },
  { timestamps: true }
);

// Password di-hash dulu sebelum disimpan, jadi yang masuk database bukan teks aslinya.
// Validasi (minlength dsb) sudah jalan duluan, jadi yang dicek tetap password aslinya.
userSchema.pre('save', async function () {
  // Kalau password tidak berubah, jangan di-hash lagi (nanti hash-nya jadi dobel).
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Data user yang aman dikirim ke frontend (tanpa password).
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
