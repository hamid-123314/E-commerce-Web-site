import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct } from '../services/api';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="centered">Loading product...</div>;
  if (error) return <div className="centered error">{error}</div>;

  return (
    <section className="product-detail">
      <img src={product.image} alt={product.name} />
      <div className="detail-copy">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong>${product.price.toFixed(2)}</strong>
        <button type="button" className="button">Add to cart</button>
      </div>
    </section>
  );
}
