import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-meta">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>${product.price.toFixed(2)}</strong>
          <Link to={`/product/${product.id}`} className="button">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
