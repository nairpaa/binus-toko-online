import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  // Buka-tutup menu di layar kecil diatur pakai state React,
  // jadi tidak perlu JavaScript bawaan Bootstrap.
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  function handleLogout() {
    closeMenu();
    logout();
  }

  return (
    <nav className="navbar navbar-expand-md bg-white border-bottom sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-primary" onClick={closeMenu}>
          <i className="bi bi-bag-heart-fill me-2" />
          TokoKita
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          aria-controls="menu-utama"
          aria-expanded={open}
          aria-label="Buka menu"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="menu-utama" className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              {/* `end` supaya "Beranda" tidak ikut aktif di semua halaman */}
              <NavLink to="/" end className="nav-link" onClick={closeMenu}>
                Beranda
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/produk" className="nav-link" onClick={closeMenu}>
                Produk
              </NavLink>
            </li>
          </ul>

          <div className="d-flex flex-wrap align-items-center gap-2 my-2 my-md-0">
            {isAdmin && (
              <Link to="/produk/tambah" className="btn btn-primary btn-sm" onClick={closeMenu}>
                <i className="bi bi-plus-lg me-1" />
                Tambah Produk
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <NavLink to="/akun" className="btn btn-light btn-sm account-link" onClick={closeMenu}>
                  <i className="bi bi-person-circle me-1" />
                  {user.name.split(' ')[0]}
                  {isAdmin && <span className="badge text-bg-primary ms-1">Admin</span>}
                </NavLink>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm" onClick={closeMenu}>
                  Masuk
                </Link>
                <Link to="/daftar" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
