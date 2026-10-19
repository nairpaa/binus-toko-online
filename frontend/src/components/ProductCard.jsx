import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatRupiah } from '../utils/format';

export default function ProductCard({ product }) {
  const soldOut = product.stock <= 0;

  return (
    <article className="card h-100 border-0 shadow-sm product-card">
      <div className="product-img-box rounded-top">
        <ProductImage src={product.image} alt={product.name} />
        {soldOut && <span className="badge text-bg-dark position-absolute top-0 start-0 m-2">Stok habis</span>}
      </div>

      {/* card-body dibuat flex kolom supaya harga selalu nempel di bawah,
          walaupun panjang nama produknya beda-beda */}
      <div className="card-body d-flex flex-column">
        <span className="badge text-bg-light text-primary align-self-start mb-2">{product.category}</span>

        <h3 className="h6 card-title text-clamp-2 mb-3">
          {/* stretched-link bikin satu kartu penuh bisa diklik */}
          <Link to={`/produk/${product._id}`} className="stretched-link text-reset text-decoration-none">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto d-flex flex-wrap justify-content-between align-items-end column-gap-2">
          <span className="fw-bold text-primary text-nowrap">{formatRupiah(product.price)}</span>
          {!soldOut && <small className="text-body-secondary text-nowrap">Stok {product.stock}</small>}
        </div>
      </div>
    </article>
  );
}
