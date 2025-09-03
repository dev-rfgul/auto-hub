import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Home - product listing page
// Fetches all spare parts and renders responsive grid of product cards

const ProductCard = ({ p }) => (
  <div className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition">
    <Link to={`/product/${p._id || p.id}`} className="block">
      <div className="h-44 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={(p.images && p.images[0]) || '/vite.svg'} alt={p.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-500">{p.brand}</div>
        <div className="mt-1 font-medium text-gray-900 truncate">{p.name}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600">${p.price?.toFixed(2)}</div>
          <div className="text-sm text-gray-500">{p.stockQuantity > 0 ? 'In stock' : 'Out'}</div>
        </div>
      </div>
    </Link>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await axios.get(`${base}/api/spareParts/getAllSpareParts`);
        setProducts(res.data || []);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">All Products</h2>
        <div className="text-sm text-gray-500">{products.length} items</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-56 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-gray-600">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id || p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
