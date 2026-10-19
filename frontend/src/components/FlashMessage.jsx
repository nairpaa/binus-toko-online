import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Menampilkan pesan sukses yang dititipkan lewat
// navigate('/alamat', { state: { message: '...' } })
export default function FlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(location.state?.message ?? '');

  useEffect(() => {
    // Pesannya dihapus dari history, biar tidak muncul lagi kalau halaman di-refresh.
    if (location.state?.message) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  if (!message) return null;

  return (
    <div className="alert alert-success alert-dismissible d-flex align-items-center" role="alert">
      <i className="bi bi-check-circle-fill me-2" />
      <span>{message}</span>
      <button type="button" className="btn-close" aria-label="Tutup" onClick={() => setMessage('')} />
    </div>
  );
}
