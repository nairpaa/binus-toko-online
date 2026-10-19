import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
      maxlength: [100, 'Nama produk maksimal 100 karakter'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Lainnya',
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stok tidak boleh negatif'],
      validate: {
        validator: Number.isInteger,
        message: 'Stok harus berupa bilangan bulat',
      },
    },
    // Cukup simpan URL gambarnya, file-nya tidak ikut disimpan di database.
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  // createdAt dan updatedAt diisi otomatis oleh Mongoose.
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
