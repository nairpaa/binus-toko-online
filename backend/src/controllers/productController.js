import Product from '../models/Product.js';

// Catatan: di Express 5, error yang muncul dari fungsi async otomatis
// dilempar ke error handler (lihat middleware/errorHandler.js).
// Jadi di sini tidak perlu try/catch satu per satu.

// Hanya field ini yang boleh dikirim dari client. Field lain seperti _id
// atau createdAt kita abaikan supaya tidak bisa diubah sembarangan.
const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'stock', 'image'];

function pickAllowedFields(body = {}) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

// GET /api/products
export async function getProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
}

// GET /api/products/:id
export async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan' });
  }

  res.json(product);
}

// POST /api/products
export async function createProduct(req, res) {
  const product = await Product.create(pickAllowedFields(req.body));
  res.status(201).json(product);
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, pickAllowedFields(req.body), {
    returnDocument: 'after', // yang dikirim balik data setelah diubah, bukan yang lama
    runValidators: true, // aturan di schema tetap berlaku saat update
  });

  if (!product) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan' });
  }

  res.json(product);
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan' });
  }

  res.json({ message: 'Produk berhasil dihapus', product });
}
