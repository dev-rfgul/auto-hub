import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const StoreProduct = ({ storeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        // try known endpoint pattern
        let res = await fetch(`${base}/api/store/getProductsByStoreId/${storeId}`, { credentials: 'include' });
        if (!res.ok) {
          // try alternate endpoint
          res = await fetch(`${base}/api/spareparts/getByStore/${storeId}`, { credentials: 'include' });
        }

        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data = await res.json();
        // backend may return array or { products: [] }
        const list = Array.isArray(data) ? data : data.products || data.items || data;
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.debug('Could not load store products:', err);
        setError('Unable to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) fetchProducts();
  }, [storeId]);

  if (loading) return <div className="p-4 text-gray-500">Loading products...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <p className="text-sm text-gray-500">{products.length} item(s)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link to={`/product/${p._id}`} key={p._id}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {p.images && p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">No image</div>}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-1 truncate">{p.short || p.description || ''}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">${p.price?.toFixed ? p.price.toFixed(2) : (p.price || '—')}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StoreProduct;
