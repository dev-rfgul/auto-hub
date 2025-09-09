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

// Modal component to compare current product with a searched product
export const CompareModal = ({ baseProduct, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q) return setResults([]);
    try {
      setLoading(true);
      const base = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${base}/api/spareparts/getAllSpareParts`);
      console.log('Fetched products for compare search',res);
      const list = await res.json();
      // simple client-side filter by name/brand/partNumber
      const filtered = (list || []).filter(p =>
        p.name?.toLowerCase().includes(q.toLowerCase()) ||
        p.brand?.toLowerCase().includes(q.toLowerCase()) ||
        p.partNumber?.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered.slice(0, 12));
    } catch (e) {
      console.error('Compare search failed', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4 mx-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Compare with another product</h3>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 p-2 border rounded">
            <div className="font-medium mb-2">Base Product</div>
            <img src={(baseProduct && baseProduct.images && baseProduct.images[0]) || '/vite.svg'} alt={baseProduct?.name} className="w-full h-36 object-cover rounded mb-2" />
            <div className="text-sm font-semibold">{baseProduct?.name}</div>
            <div className="text-sm text-gray-600">{baseProduct?.brand}</div>
            <div className="text-sm text-green-600 font-bold mt-2">${baseProduct?.price}</div>
          </div>

          <div className="md:col-span-2 p-2 border rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Search product to compare</label>
              <div className="mt-1 flex">
                <input value={query} onChange={(e) => { setQuery(e.target.value); }} onKeyDown={(e) => { if (e.key === 'Enter') search(query); }} className="w-full border rounded-l px-3 py-2" placeholder="Search by name, brand or part number" />
                <button onClick={() => search(query)} className="px-4 bg-blue-600 text-white rounded-r">Search</button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto">
              {loading && <div className="text-sm text-gray-500">Searching…</div>}
              {!loading && results.length === 0 && query && <div className="text-sm text-gray-500">No results</div>}
              {results.map((r) => (
                <div key={r._id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50">
                  <img src={(r.images && r.images[0]) || '/vite.svg'} alt={r.name} className="w-16 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.brand} • {r.partNumber}</div>
                  </div>
                  <div>
                    <button onClick={() => setSelected(r)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Select</button>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="mt-3 p-3 border rounded bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">Selected</div>
                    <div className="text-sm">{selected.name}</div>
                    <div className="text-xs text-gray-500">{selected.brand}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(null)} className="px-2 py-1 text-sm border rounded">Clear</button>
                    <button onClick={() => {
                      // open a simple inline compare table by replacing modal content
                      // we'll render a two-column table below by setting results to [baseProduct, selected]
                      // store as a small state variable
                      // For simplicity, replace results with the selected pair
                      setResults([selected]);
                    }} className="px-3 py-1 bg-green-600 text-white rounded">Compare</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inline compare table if results contains the selected */}
        {results && results.length > 0 && results[0]._id === (selected && selected._id) && (
          <div className="mt-4 overflow-auto">
            <table className="w-full table-auto text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Property</th>
                  <th className="p-2 text-left">Base</th>
                  <th className="p-2 text-left">Selected</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="p-2">Image</td><td className="p-2"><img src={(baseProduct.images && baseProduct.images[0]) || '/vite.svg'} alt="base" className="w-32 h-20 object-cover rounded"/></td><td className="p-2"><img src={(selected.images && selected.images[0]) || '/vite.svg'} alt="sel" className="w-32 h-20 object-cover rounded"/></td></tr>
                <tr className="border-t"><td className="p-2">Name</td><td className="p-2">{baseProduct.name}</td><td className="p-2">{selected.name}</td></tr>
                <tr className="border-t"><td className="p-2">Brand</td><td className="p-2">{baseProduct.brand}</td><td className="p-2">{selected.brand}</td></tr>
                <tr className="border-t"><td className="p-2">Price</td><td className="p-2">${baseProduct.price}</td><td className="p-2">${selected.price}</td></tr>
                <tr className="border-t"><td className="p-2">Warranty</td><td className="p-2">{baseProduct.specifications?.warranty || '—'}</td><td className="p-2">{selected.specifications?.warranty || '—'}</td></tr>
                <tr className="border-t"><td className="p-2">Material</td><td className="p-2">{baseProduct.specifications?.material || '—'}</td><td className="p-2">{selected.specifications?.material || '—'}</td></tr>
                <tr className="border-t"><td className="p-2">Compatibility</td><td className="p-2">{Array.isArray(baseProduct.specifications?.compatibility) ? baseProduct.specifications.compatibility.join(', ') : '—'}</td><td className="p-2">{Array.isArray(selected.specifications?.compatibility) ? selected.specifications.compatibility.join(', ') : '—'}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};