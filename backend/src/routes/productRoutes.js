import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Melihat produk boleh siapa saja.
// Menambah, mengubah, dan menghapus harus login DAN berperan sebagai admin.
const adminOnly = [requireAuth, requireAdmin];

router.route('/').get(getProducts).post(adminOnly, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(adminOnly, updateProduct)
  .delete(adminOnly, deleteProduct);

export default router;
