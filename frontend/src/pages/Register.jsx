import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import AuthCard from '../components/AuthCard';
import Loading from '../components/Loading';

const MIN_PASSWORD = 8;

export default function Register() {
  const { isLoggedIn, checking, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Penanda bahwa user baru saja mendaftar di halaman ini, supaya tidak ikut
  // terlempar oleh <Navigate> di bawah sebelum pesan selamat datang terkirim.
  const justRegistered = useRef(false);

  if (checking) return <Loading text="Memeriksa sesi login..." />;
  if (isLoggedIn && !justRegistered.current) return <Navigate to="/akun" replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Cek ringan di browser dulu. Aturan sebenarnya tetap dicek ulang oleh backend.
    if (form.password.length < MIN_PASSWORD) {
      setError(`Password minimal ${MIN_PASSWORD} karakter.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setSubmitting(true);
    setError('');
    justRegistered.current = true;

    try {
      await register({ name: form.name, email: form.email, password: form.password });
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search ?? ''}` : '/akun', {
        replace: true,
        state: { message: `Akun berhasil dibuat. Selamat datang, ${form.name.trim()}!` },
      });
    } catch (err) {
      justRegistered.current = false;
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  const passwordTooShort = form.password.length > 0 && form.password.length < MIN_PASSWORD;
  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <>
      <title>TokoKita | Daftar</title>

      <AuthCard
        icon="bi-person-plus"
        title="Buat akun baru"
        subtitle="Gratis, cuma butuh nama, email, dan password."
        footer={
          <>
            Sudah punya akun?{' '}
            <Link to="/login" state={location.state}>
              Masuk di sini
            </Link>
          </>
        }
      >
        {error && (
          <div className="alert alert-danger small py-2 d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nama</label>
            <input
              id="name"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={50}
              autoFocus
              required
            />
          </div>
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
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control ${passwordTooShort ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              maxLength={72}
              required
            />
            <div className={passwordTooShort ? 'invalid-feedback' : 'form-text'}>
              Minimal {MIN_PASSWORD} karakter.
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">Ulangi password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control ${passwordMismatch ? 'is-invalid' : ''}`}
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {passwordMismatch && <div className="invalid-feedback">Password belum sama.</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {submitting ? 'Membuat akun...' : 'Daftar'}
          </button>
        </form>
      </AuthCard>
    </>
  );
}
