import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/format';
import FlashMessage from '../components/FlashMessage';

// Halaman khusus member (harus login). Dibungkus <ProtectedRoute /> di App.jsx.
export default function Account() {
  const { user, isAdmin, logout, logoutAll } = useAuth();
  const [activeSessions, setActiveSessions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Jumlah sesi aktif diambil ulang dari server, karena bisa berubah dari perangkat lain.
  useEffect(() => {
    let ignore = false;
    getCurrentUser()
      .then((data) => {
        if (!ignore) setActiveSessions(data.activeSessions);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogoutAll() {
    if (!window.confirm('Keluar dari semua perangkat? Kamu harus login ulang di setiap perangkat.')) return;
    setBusy(true);
    setError('');
    try {
      await logoutAll();
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  }

  const initials = user.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <title>TokoKita | Akun Saya</title>
      <FlashMessage />
      {error && <div className="alert alert-danger">{error}</div>}

      <h1 className="h3 fw-bold mb-4">Akun Saya</h1>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column align-items-center text-center">
              <span className="avatar mb-3">{initials}</span>
              <h2 className="h5 fw-bold mb-1">{user.name}</h2>
              <p className="text-body-secondary mb-2">{user.email}</p>
              <span className={`badge ${isAdmin ? 'text-bg-primary' : 'text-bg-light text-primary'} mb-3`}>
                {isAdmin ? 'Admin toko' : 'Member'}
              </span>
              <small className="text-body-secondary">Bergabung sejak {formatDate(user.createdAt)}</small>

              <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                {isAdmin ? (
                  <Link to="/produk/tambah" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" /> Tambah produk
                  </Link>
                ) : (
                  <Link to="/produk" className="btn btn-primary">
                    <i className="bi bi-bag me-1" /> Mulai belanja
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">
                <i className="bi bi-shield-check text-primary me-2" />
                Keamanan & sesi login
              </h2>

              <ul className="list-unstyled small text-body-secondary mb-4 session-info">
                <li>
                  <i className="bi bi-key" />
                  <span>
                    Access token berlaku <strong>15 menit</strong> dan diperbarui otomatis di belakang layar.
                  </span>
                </li>
                <li>
                  <i className="bi bi-arrow-repeat" />
                  <span>
                    Selama aktif, kamu tetap login tanpa perlu memasukkan password lagi. Kalau <strong>7 hari</strong>{' '}
                    tidak dibuka, atau sudah <strong>30 hari</strong> sejak login, kamu diminta login ulang.
                  </span>
                </li>
                <li>
                  <i className="bi bi-laptop" />
                  <span>
                    Sesi aktif saat ini:{' '}
                    <strong>{activeSessions === null ? '...' : `${activeSessions} perangkat/browser`}</strong>
                  </span>
                </li>
              </ul>

              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={logout} disabled={busy}>
                  <i className="bi bi-box-arrow-right me-1" /> Keluar
                </button>
                <button type="button" className="btn btn-outline-danger" onClick={handleLogoutAll} disabled={busy}>
                  <i className="bi bi-phone me-1" />
                  {busy ? 'Memproses...' : 'Keluar dari semua perangkat'}
                </button>
              </div>
              <p className="small text-body-secondary mt-3 mb-0">
                Pakai "Keluar dari semua perangkat" kalau kamu pernah login di komputer umum atau curiga akunmu
                dipakai orang lain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
