import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import AuthCard from '../components/AuthCard';
import Loading from '../components/Loading';

export default function Login() {
  const { user, isLoggedIn, checking, sessionMessage, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Halaman yang tadi mau dibuka sebelum diminta login (dikirim oleh ProtectedRoute).
  const from = location.state?.from;

  if (checking) return <Loading text="Memeriksa sesi login..." />;

  // Begitu login berhasil (atau ternyata sudah login), langsung pindah halaman.
  if (isLoggedIn) {
    const fallback = user.role === 'admin' ? '/produk' : '/';
    return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : fallback} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <>
      <title>TokoKita | Masuk</title>

      <AuthCard
        icon="bi-person-lock"
        title="Masuk ke TokoKita"
        subtitle="Masuk untuk melihat akunmu. Admin bisa langsung mengelola produk."
        footer={
          <>
            Belum punya akun?{' '}
            <Link to="/daftar" state={location.state}>
              Daftar sekarang
            </Link>
          </>
        }
      >
        {sessionMessage && !error && (
          <div className="alert alert-warning small py-2">
            <i className="bi bi-clock-history me-2" />
            {sessionMessage}
          </div>
        )}

        {from && !sessionMessage && !error && (
          <div className="alert alert-info small py-2">Silakan login dulu untuk membuka halaman itu.</div>
        )}

        {error && (
          <div className="alert alert-danger small py-2 d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {submitting ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </AuthCard>
    </>
  );
}
