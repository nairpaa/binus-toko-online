import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

// Ikon untuk tiap kategori. Kategori baru yang belum ada di sini pakai ikon tag.
const CATEGORY_ICONS = {
  Gadget: 'bi-phone',
  Laptop: 'bi-laptop',
  Aksesoris: 'bi-headphones',
  Fashion: 'bi-handbag',
  'Rumah Tangga': 'bi-house-heart',
};

export default function Home() {
  const { data, loading, error } = useProducts();
  const { isAdmin } = useAuth();
  const products = data ?? [];

  // API sudah mengurutkan dari yang terbaru, jadi tinggal ambil 4 teratas.
  const latestProducts = products.slice(0, 4);

  // Hitung jumlah produk per kategori: { Gadget: 2, Fashion: 3, ... }
  const categoryCount = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <title>TokoKita | Beranda</title>

      <section className="hero rounded-4 p-4 p-md-5 mb-5">
        <div className="hero-content">
          <p className="text-uppercase small fw-semibold opacity-75 mb-2">Selamat datang di TokoKita</p>
          <h1 className="display-5 fw-bold mb-3">Mau belanja apa hari ini?</h1>
          <p className="lead mb-4 opacity-90">
            Dari gadget, fashion, sampai perlengkapan rumah. Cari yang kamu butuhkan, lihat detailnya, lalu
            putuskan dengan tenang.
          </p>
          <Link to="/produk" className="btn btn-light btn-lg fw-semibold">
            Lihat semua produk <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      </section>

      {loading && <Loading />}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {Object.keys(categoryCount).length > 0 && (
            <section className="mb-5">
              <h2 className="h4 fw-bold mb-3">Belanja per kategori</h2>
              <div className="category-list">
                {Object.entries(categoryCount).map(([category, count]) => (
                  <Link
                    key={category}
                    to={`/produk?kategori=${encodeURIComponent(category)}`}
                    className="category-tile card border-0 shadow-sm text-decoration-none"
                  >
                    <div className="card-body d-flex align-items-center gap-3">
                      <span className="category-icon">
                        <i className={`bi ${CATEGORY_ICONS[category] || 'bi-tag'}`} />
                      </span>
                      <div>
                        <div className="fw-semibold text-body">{category}</div>
                        <small className="text-body-secondary">{count} produk</small>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 fw-bold mb-0">Produk terbaru</h2>
              <Link to="/produk" className="link-primary text-decoration-none">
                Lihat semua <i className="bi bi-chevron-right small" />
              </Link>
            </div>

            {latestProducts.length > 0 ? (
              <div className="product-grid product-grid--home">
                {latestProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-body-secondary">
                Belum ada produk.
                {isAdmin && (
                  <>
                    {' '}
                    <Link to="/produk/tambah">Tambahkan produk pertama</Link>.
                  </>
                )}
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
