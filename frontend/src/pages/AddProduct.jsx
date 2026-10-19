import { useNavigate } from 'react-router-dom';
import { createProduct } from '../api/productApi';
import ProductForm from '../components/ProductForm';

export default function AddProduct() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    const created = await createProduct(data);
    navigate(`/produk/${created._id}`, { state: { message: 'Produk baru berhasil ditambahkan.' } });
  }

  return (
    <>
      <title>TokoKita | Tambah Produk</title>
      <h1 className="h3 fw-bold mb-1">Tambah Produk</h1>
      <p className="text-body-secondary mb-4">Nama dan harga wajib diisi, sisanya boleh dilengkapi nanti.</p>

      <ProductForm submitLabel="Simpan Produk" cancelTo="/produk" onSubmit={handleCreate} />
    </>
  );
}
