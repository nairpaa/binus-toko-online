import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

// Pembungkus route yang butuh login.
//   <ProtectedRoute />           -> cukup sudah login (user maupun admin)
//   <ProtectedRoute adminOnly /> -> harus admin
//
// Ini cuma untuk kenyamanan tampilan. Keamanan sebenarnya tetap dicek backend
// di setiap request, jadi mengakali kode ini di browser tidak ada gunanya.
export default function ProtectedRoute({ adminOnly = false }) {
  const { isLoggedIn, isAdmin, checking, loggedOutManually } = useAuth();
  const location = useLocation();

  if (checking) return <Loading text="Memeriksa sesi login..." />;

  if (!isLoggedIn) {
    // Habis klik "Keluar" di halaman ini? Bawa ke Beranda saja, bukan ke halaman login.
    if (loggedOutManually) return <Navigate to="/" replace />;
    // Setelah login nanti, user dikembalikan ke halaman yang tadi mau dibuka.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="text-center py-5">
        <title>TokoKita | Khusus admin</title>
        <p className="display-1 fw-bold text-primary mb-0">403</p>
        <p className="lead mb-4">Halaman ini khusus admin toko.</p>
        <Link to="/produk" className="btn btn-primary">
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  return <Outlet />;
}
