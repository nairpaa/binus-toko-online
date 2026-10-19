const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

// 14999000 -> "Rp 14.999.000"
export function formatRupiah(value) {
  return rupiah.format(value ?? 0);
}

// "2026-10-04T07:13:06.128Z" -> "4 Oktober 2026"
export function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
