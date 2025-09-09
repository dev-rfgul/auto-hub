import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('compareList') || '[]');
        setList(saved);
      } catch (e) {
        setList([]);
      }
    };
    load();
    // listen to storage events (other tabs/components)
    const onStorage = () => load();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const remove = (id) => {
    const updated = list.filter((p) => p._id !== id);
    localStorage.setItem('compareList', JSON.stringify(updated));
    setList(updated);
  };

  const clearAll = () => {
    localStorage.removeItem('compareList');
    setList([]);
  };

  if (!list || list.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No products selected for comparison</h2>
          <p className="text-sm text-gray-600 mb-4">Go to a product page and click "Add to Compare" to select up to 2 products.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Browse products</Link>
        </div>
      </div>
    );
  }

  // show only first two for comparison UI
  const [a, b] = [list[0], list[1]];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Compare Products</h1>
        <div className="flex items-center gap-3">
          <button onClick={clearAll} className="px-3 py-2 bg-gray-100 rounded">Clear All</button>
          <Link to="/" className="px-3 py-2 text-blue-600 hover:underline">Continue shopping</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Column: Labels */}
          <div className="p-4 border rounded">
            <div className="font-medium mb-3">Property</div>
            <div className="py-2 text-sm text-gray-600">Image</div>
            <div className="py-2 text-sm text-gray-600">Name</div>
            <div className="py-2 text-sm text-gray-600">Brand</div>
            <div className="py-2 text-sm text-gray-600">Price</div>
            <div className="py-2 text-sm text-gray-600">Rating</div>
            <div className="py-2 text-sm text-gray-600">Availability</div>
            <div className="py-2 text-sm text-gray-600">Warranty</div>
            <div className="py-2 text-sm text-gray-600">Material</div>
            <div className="py-2 text-sm text-gray-600">Compatibility</div>
            <div className="py-2 text-sm text-gray-600">Store</div>
          </div>

          {/* Product A */}
          <div className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div className="font-medium mb-3">Product A</div>
              <button onClick={() => remove(a._id)} className="text-xs text-red-600">Remove</button>
            </div>
            <div className="py-2">
              <img src={(a.images && a.images[0]) || '/vite.svg'} alt={a.name} className="w-full h-36 object-cover rounded" />
            </div>
            <div className="py-2 font-medium">{a.name}</div>
            <div className="py-2 text-sm text-gray-700">{a.brand}</div>
            <div className="py-2 text-sm text-green-600 font-bold">${a.price}</div>
            <div className="py-2 text-sm">{a.rating ?? '—'}</div>
            <div className="py-2 text-sm">{a.stockQuantity > 0 ? `${a.stockQuantity} in stock` : 'Out of stock'}</div>
            <div className="py-2 text-sm">{a.specifications?.warranty || '—'}</div>
            <div className="py-2 text-sm">{a.specifications?.material || '—'}</div>
            <div className="py-2 text-sm">{Array.isArray(a.specifications?.compatibility) ? a.specifications.compatibility.join(', ') : '—'}</div>
            <div className="py-2 text-sm">
              {a.storeId ? <Link to={`/store/${a.storeId}`} className="text-blue-600 hover:underline">View Store</Link> : '—'}
            </div>
          </div>

          {/* Product B */}
          <div className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div className="font-medium mb-3">Product B</div>
              <button onClick={() => remove(b._id)} className="text-xs text-red-600">Remove</button>
            </div>
            <div className="py-2">
              <img src={(b && b.images && b.images[0]) || '/vite.svg'} alt={b?.name} className="w-full h-36 object-cover rounded" />
            </div>
            <div className="py-2 font-medium">{b?.name}</div>
            <div className="py-2 text-sm text-gray-700">{b?.brand}</div>
            <div className="py-2 text-sm text-green-600 font-bold">${b?.price}</div>
            <div className="py-2 text-sm">{b?.rating ?? '—'}</div>
            <div className="py-2 text-sm">{b?.stockQuantity > 0 ? `${b.stockQuantity} in stock` : 'Out of stock'}</div>
            <div className="py-2 text-sm">{b?.specifications?.warranty || '—'}</div>
            <div className="py-2 text-sm">{b?.specifications?.material || '—'}</div>
            <div className="py-2 text-sm">{Array.isArray(b?.specifications?.compatibility) ? b.specifications.compatibility.join(', ') : '—'}</div>
            <div className="py-2 text-sm">
              {b?.storeId ? <Link to={`/store/${b.storeId}`} className="text-blue-600 hover:underline">View Store</Link> : '—'}
            </div>
          </div>
        </div>

        {/* If only one item selected show a hint */}
        {list.length < 2 && (
          <div className="mt-4 text-sm text-gray-600">
            Add one more product to compare. Go to a product page and click "Add to Compare".
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;