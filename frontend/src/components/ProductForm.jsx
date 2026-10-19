import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { getErrorMessage } from '../api/client';

const EMPTY_FORM = { name: '', price: '', stock: '', category: '', image: '', description: '' };

const CATEGORY_SUGGESTIONS = ['Gadget', 'Laptop', 'Aksesoris', 'Fashion', 'Rumah Tangga'];

// Form ini dipakai bareng oleh halaman Tambah dan Edit.
// Bedanya cuma di nilai awal dan apa yang dilakukan saat disimpan (onSubmit).
export default function ProductForm({ initialValues, submitLabel, cancelTo, onSubmit }) {
  const [form, setForm] = useState(() => {
    // Ambil field yang dibutuhkan form saja, _id dan createdAt tidak perlu.
    const values = { ...EMPTY_FORM };
    for (const key of Object.keys(EMPTY_FORM)) {
      values[key] = initialValues?.[key] ?? '';
    }
    return values;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pratinjau gambar baru dimuat setelah berhenti mengetik setengah detik. Kalau langsung,
  // browser akan mencoba memuat "https://c", "https://cd", dst. di setiap ketikan.
  const [previewUrl, setPreviewUrl] = useState(form.image);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewUrl(form.image), 500);
    return () => clearTimeout(timer);
  }, [form.image]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Input type="number" tetap menghasilkan string, jadi diubah dulu ke angka.
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger d-flex align-items-start" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nama produk</label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Contoh: Sepatu Lari Pria"
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label htmlFor="price" className="form-label">Harga (Rp)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="150000"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="stock" className="form-label">Stok</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    className="form-control"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">Kategori</label>
                <input
                  id="category"
                  name="category"
                  className="form-control"
                  value={form.category}
                  onChange={handleChange}
                  list="category-options"
                  placeholder="Pilih atau ketik kategori baru"
                />
                <datalist id="category-options">
                  {CATEGORY_SUGGESTIONS.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">URL gambar</label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  className="form-control"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">Deskripsi</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="5"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ceritakan sedikit tentang produk ini"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="small text-body-secondary mb-2">Pratinjau gambar</p>
              <div className="product-img-box rounded">
                <ProductImage src={previewUrl} alt={form.name || 'Pratinjau gambar produk'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {saving ? 'Menyimpan...' : submitLabel}
        </button>
        <Link to={cancelTo} className="btn btn-outline-secondary">
          Batal
        </Link>
      </div>
    </form>
  );
}
