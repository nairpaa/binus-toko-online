import { useState } from 'react';

// Gambar produk yang punya cadangan: kalau URL kosong atau gagal dimuat,
// tampilkan ikon abu-abu, bukan gambar rusak.
export default function ProductImage({ src, alt }) {
  // Yang disimpan URL yang gagal, bukan true/false. Jadi kalau URL-nya diganti
  // (misalnya di form edit), gambar baru langsung dicoba lagi.
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className="product-img-placeholder" role="img" aria-label={alt}>
        <i className="bi bi-image" />
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />;
}
