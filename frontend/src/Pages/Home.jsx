import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const CategoryPill = ({ name }) => (
  <button className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-blue-50">{name}</button>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await axios.get(`${base}/api/spareParts/getAllSpareParts`);
        const list = res.data || [];
        setProducts(list);
        setFeatured(list.slice(0, 6));
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['Brakes', 'Batteries', 'Filters', 'Lights', 'Tyres', 'Oil & Fluids'];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white mb-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-2/3">
            <h1 className="text-2xl md:text-4xl font-bold">Find spare parts for every vehicle</h1>
            <p className="mt-2 text-sm md:text-base text-blue-100">Search top-quality spare parts from verified dealers. Fast shipping. Easy returns.</p>

            <div className="mt-4 flex items-center space-x-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search spare parts, brands, models..." className="w-full md:w-2/3 px-4 py-2 rounded shadow-sm text-gray-800" />
              <button className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold">Search</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => <CategoryPill key={c} name={c} />)}
            </div>
          </div>

          <div className="hidden md:block md:w-1/3">
            <img src="/vite.svg" alt="hero" className="w-full h-44 object-contain" />
          </div>
        </div>
      </div>

      {/* Featured strip */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Featured Parts</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-24 rounded" />
            ))
          ) : (
            featured.map((p) => (
              <Link key={p._id || p.id} to={`/product-preview/${p._id || p.id}`} className="bg-white rounded p-2 shadow-sm hover:shadow">
                <img src={(p.images && p.images[0]) || '/vite.svg'} alt={p.name} className="h-20 w-full object-cover rounded" />
                <div className="text-xs mt-1 text-gray-700 truncate">{p.name}</div>
                <div className="text-sm font-semibold text-green-600">${p.price?.toFixed(2)}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="md:flex md:space-x-6">
        {/* Left: filters (sticky on md) */}
        <aside className="md:w-1/4 mb-6 md:mb-0">
          <div className="bg-white p-4 rounded shadow-sm sticky top-20">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">Brand</label>
                <input className="mt-1 block w-full border rounded p-2" placeholder="e.g. Bosch" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Price range</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input className="w-1/2 border rounded p-2" placeholder="Min" />
                  <input className="w-1/2 border rounded p-2" placeholder="Max" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: products grid */}
        <main className="md:flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Showing <strong>{products.length}</strong> results</div>
            <div className="text-sm">
              <label className="mr-2 text-gray-600">Sort</label>
              <select className="border rounded p-1">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
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
        </main>
      </div>

    </div>
  );
};

export default Home;
