import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { trackPageView } from '../lib/analytics';

export default function Layout() {
  const { pathname, search } = useLocation();

  // Tanpa ini, buka detail produk dari bawah daftar bakal tetap di posisi scroll yang sama.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Lapor ke Google Analytics setiap kali pindah halaman.
  useEffect(() => {
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container py-4 flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
