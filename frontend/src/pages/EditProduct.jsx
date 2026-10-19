import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { updateProduct } from '../api/productApi';
import ProductForm from '../components/ProductForm';
import Loading from '../components/Loading';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error } = useProduct(id);

  async function handleUpdate(data) {
    await updateProduct(id, data);
    navigate(`/produk/${id}`, { state: { message: 'Perubahan produk sudah disimpan.' } });
  }

  if (loading) return <Loading text="Memuat data produk..." />;

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="lead">{error}</p>
        <Link to="/produk" className="btn btn-primary">
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  return (
    <>
      <title>{`TokoKita | Edit ${product.name}`}</title>
      <h1 className="h3 fw-bold mb-1">Edit Produk</h1>
      <p className="text-body-secondary mb-4">
        Sedang mengubah <strong>{product.name}</strong>.
      </p>

      {/* Form baru dirender setelah data ada, jadi nilai awalnya langsung terisi */}
      <ProductForm
        initialValues={product}
        submitLabel="Simpan Perubahan"
        cancelTo={`/produk/${id}`}
        onSubmit={handleUpdate}
      />
    </>
  );
}
