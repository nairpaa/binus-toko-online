import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { deleteProduct } from '../api/productApi';
import { getErrorMessage } from '../api/client';
import { trackEvent } from '../lib/analytics';
import { formatDate, formatRupiah } from '../utils/format';
import ProductImage from '../components/ProductImage';
import Loading from '../components/Loading';
import FlashMessage from '../components/FlashMessage';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error } = useProduct(id);
  const { isAdmin } = useAuth();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Catat produk yang dilihat. Formatnya mengikuti event "view_item" bawaan GA4,
  // jadi otomatis masuk laporan produk yang paling sering dilihat.
  useEffect(() => {
    if (!product) return;
    trackEvent('view_item', {
      currency: 'IDR',
      value: product.price,
      items: [
        { item_id: product._id, item_name: product.name, item_category: product.category, price: product.price },
      ],
    });
  }, [product]);

  async function handleDelete() {
    if (!window.confirm(`Yakin mau menghapus "${product.name}"? Data yang dihapus tidak bisa dikembalikan.`)) {
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteProduct(product._id);
      navigate('/produk', { state: { message: `Produk "${product.name}" sudah dihapus.` } });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <Loading text="Memuat detail produk..." />;

  if (error) {
    return (
      <div className="text-center py-5">
        <title>TokoKita | Produk tidak ditemukan</title>
        <i className="bi bi-emoji-frown display-4 text-body-secondary d-block mb-3" />
        <p className="lead">{error}</p>
        <Link to="/produk" className="btn btn-primary">
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <>
      <title>{`TokoKita | ${product.name}`}</title>

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Beranda</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/produk">Produk</Link>
          </li>
          <li className="breadcrumb-item active text-truncate" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <FlashMessage />
      {deleteError && <div className="alert alert-danger">{deleteError}</div>}

      {/* Layout detail pakai Flexbox: gambar di kiri, info di kanan.
          Di layar sempit otomatis turun jadi atas-bawah karena flex-wrap. */}
      <div className="product-detail card border-0 shadow-sm p-3 p-md-4">
        <div className="product-detail__image">
          <div className="product-img-box product-img-box--large rounded-3">
            <ProductImage src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="product-detail__info">
          <span className="badge text-bg-light text-primary align-self-start mb-2">{product.category}</span>
          <h1 className="h2 fw-bold">{product.name}</h1>
          <p className="display-6 fw-bold text-primary my-3">{formatRupiah(product.price)}</p>

          <p className="mb-4">
            {inStock ? (
              <span className="badge text-bg-success">
                <i className="bi bi-check-circle me-1" />
                Stok tersedia: {product.stock}
              </span>
            ) : (
              <span className="badge text-bg-secondary">
                <i className="bi bi-x-circle me-1" />
                Stok habis
              </span>
            )}
          </p>

          <h2 className="h6 fw-semibold">Deskripsi produk</h2>
          <p className="text-body-secondary product-description">
            {product.description || 'Belum ada deskripsi untuk produk ini.'}
          </p>

          <div className="d-flex flex-wrap gap-2 mt-4">
            {/* Tombol Edit & Hapus cuma muncul untuk admin */}
            {isAdmin && (
              <>
                <Link to={`/produk/${product._id}/edit`} className="btn btn-primary">
                  <i className="bi bi-pencil-square me-1" /> Edit
                </Link>
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                  <i className="bi bi-trash me-1" />
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </>
            )}
            <Link to="/produk" className={`btn text-decoration-none ${isAdmin ? 'btn-link ms-auto' : 'btn-outline-secondary'}`}>
              <i className="bi bi-arrow-left me-1" /> Kembali
            </Link>
          </div>

          <hr className="my-4" />
          <small className="text-body-secondary d-block">
            Ditambahkan {formatDate(product.createdAt)}
            {product.updatedAt !== product.createdAt && ` · Terakhir diubah ${formatDate(product.updatedAt)}`}
          </small>
        </div>
      </div>
    </>
  );
}
