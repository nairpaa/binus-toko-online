import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../lib/analytics';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import FlashMessage from '../components/FlashMessage';

const SORT_OPTIONS = {
  terbaru: { label: 'Terbaru', compare: null }, // urutan dari API sudah terbaru
  termurah: { label: 'Harga terendah', compare: (a, b) => a.price - b.price },
  termahal: { label: 'Harga tertinggi', compare: (a, b) => b.price - a.price },
  nama: { label: 'Nama (A-Z)', compare: (a, b) => a.name.localeCompare(b.name, 'id') },
};

export default function ProductList() {
  const { data, loading, error } = useProducts();
  const { isAdmin } = useAuth();

  // Kata kunci pencarian cukup di state biasa. Sempat dicoba disimpan di URL,
  // tapi kalau mengetik cepat ada huruf yang hilang karena update URL telat sedikit.
  const [keyword, setKeyword] = useState('');

  // Kirim event "search" ke analytics setelah user berhenti mengetik 1 detik, bukan tiap huruf.
  useEffect(() => {
    const term = keyword.trim();
    if (term.length < 2) return;
    const timer = setTimeout(() => trackEvent('search', { search_term: term }), 1000);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Kategori dan urutan disimpan di URL (?kategori=...&urut=...), jadi tombol
  // kategori di Beranda bisa langsung membuka daftar yang sudah terfilter.
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('kategori') ?? '';
  const sort = SORT_OPTIONS[searchParams.get('urut')] ? searchParams.get('urut') : 'terbaru';

  function updateParam(key, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  }

  function resetFilters() {
    setKeyword('');
    setSearchParams({}, { replace: true });
  }

  const products = useMemo(() => data ?? [], [data]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchKeyword = !term || product.name.toLowerCase().includes(term);
      const matchCategory = !category || product.category === category;
      return matchKeyword && matchCategory;
    });

    const { compare } = SORT_OPTIONS[sort];
    return compare ? [...filtered].sort(compare) : filtered;
  }, [products, keyword, category, sort]);

  const isFiltered = keyword || category;

  return (
    <>
      <title>TokoKita | Daftar Produk</title>

      <FlashMessage />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Daftar Produk</h1>
          {!loading && !error && (
            <p className="text-body-secondary mb-0">
              Menampilkan {visibleProducts.length} dari {products.length} produk
            </p>
          )}
        </div>
        {isAdmin && (
          <Link to="/produk/tambah" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1" /> Tambah Produk
          </Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Cari nama produk..."
                  aria-label="Cari produk"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                aria-label="Filter kategori"
                value={category}
                onChange={(e) => updateParam('kategori', e.target.value)}
              >
                <option value="">Semua kategori</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                aria-label="Urutkan produk"
                value={sort}
                onChange={(e) => updateParam('urut', e.target.value === 'terbaru' ? '' : e.target.value)}
              >
                {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading text="Mengambil daftar produk..." />}

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-wifi-off me-2" />
          {error}
        </div>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && visibleProducts.length === 0 && (
        <div className="text-center text-body-secondary py-5">
          <i className="bi bi-box-seam display-4 d-block mb-3" />
          {isFiltered ? (
            <>
              <p>Tidak ada produk yang cocok dengan pencarianmu.</p>
              <button type="button" className="btn btn-outline-primary" onClick={resetFilters}>
                Reset filter
              </button>
            </>
          ) : (
            <p>
              Belum ada produk.
              {isAdmin && (
                <>
                  {' '}
                  <Link to="/produk/tambah">Tambahkan sekarang</Link>.
                </>
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
}
