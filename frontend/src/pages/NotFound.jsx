import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <title>TokoKita | Halaman tidak ditemukan</title>
      <p className="display-1 fw-bold text-primary mb-0">404</p>
      <p className="lead mb-4">Halaman yang kamu cari tidak ada atau sudah dipindah.</p>
      <Link to="/" className="btn btn-primary">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
