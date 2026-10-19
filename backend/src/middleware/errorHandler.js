// Dipanggil kalau tidak ada route yang cocok dengan URL yang diminta.
export function notFound(req, res) {
  res.status(404).json({ code: 'NOT_FOUND', message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
}

// Semua error dari route berakhir di sini, jadi format balasannya seragam: { code, message }.
// Express mengenali error handler dari jumlah parameternya (4), makanya
// `next` tetap ditulis walaupun tidak dipakai.
export function errorHandler(err, req, res, next) {
  // Body request bukan JSON yang valid.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 'INVALID_JSON', message: 'Format JSON tidak valid' });
  }

  // Nilai tidak bisa diubah ke tipe yang benar, misalnya ID asal-asalan
  // atau harga diisi huruf.
  if (err.name === 'CastError') {
    const message = err.path === '_id' ? 'ID tidak valid' : `Nilai untuk "${err.path}" tidak valid`;
    return res.status(400).json({ code: 'INVALID_VALUE', message });
  }

  // Data tidak lolos aturan di schema (nama kosong, harga minus, email salah format, dst).
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Data belum valid', errors });
  }

  // Melanggar unique index, misalnya dua orang daftar dengan email yang sama di detik yang sama.
  if (err.code === 11000) {
    return res.status(409).json({ code: 'DUPLICATE', message: 'Data yang sama sudah terdaftar' });
  }

  console.error(err);
  res.status(500).json({ code: 'SERVER_ERROR', message: 'Terjadi kesalahan di server' });
}
