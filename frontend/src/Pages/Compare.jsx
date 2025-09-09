import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [list, setList] = useState([]);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'table'

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

  const addToCart = (product) => {
    // Add to cart functionality
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const getCompatibilityMatch = (products) => {
    if (products.length < 2) return null;
    const [a, b] = products;
    const aCompat = a.specifications?.compatibility || [];
    const bCompat = b.specifications?.compatibility || [];
    const common = aCompat.filter(item => bCompat.includes(item));
    return common.length > 0 ? common : null;
  };

  const getBetterValue = (a, b, field) => {
    if (field === 'price') {
      return parseFloat(a.price) < parseFloat(b.price) ? 'a' : 'b';
    }
    if (field === 'rating') {
      return (a.rating || 0) > (b.rating || 0) ? 'a' : 'b';
    }
    if (field === 'stock') {
      return (a.stockQuantity || 0) > (b.stockQuantity || 0) ? 'a' : 'b';
    }
    return null;
  };

  if (!list || list.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Spare Parts Selected for Comparison</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Find the perfect automotive parts by comparing specifications, compatibility, and prices. 
            Select up to 4 products to compare side by side.
          </p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Browse Spare Parts
          </Link>
        </div>
      </div>
    );
  }

  const compatibilityMatch = getCompatibilityMatch(list.slice(0, 2));

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Compare Spare Parts</h1>
          <p className="text-gray-600 mt-1">Compare {list.length} selected automotive parts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'side-by-side' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Table View
            </button>
          </div>
          <button onClick={clearAll} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium">
            Clear All
          </button>
          <Link to="/" className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Compatibility Alert */}
      {compatibilityMatch && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Compatible with: {compatibilityMatch.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Main Comparison Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {viewMode === 'side-by-side' ? (
          <SideBySideView list={list} remove={remove} addToCart={addToCart} getBetterValue={getBetterValue} />
        ) : (
          <TableView list={list} remove={remove} addToCart={addToCart} getBetterValue={getBetterValue} />
        )}
      </div>

      {/* Add More Products Hint */}
      {list.length < 4 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <strong>Tip:</strong> You can compare up to 4 products. Add {4 - list.length} more product{4 - list.length > 1 ? 's' : ''} to get a comprehensive comparison.
          </p>
        </div>
      )}
    </div>
  );
};

// Side by Side View Component
const SideBySideView = ({ list, remove, addToCart, getBetterValue }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {list.slice(0, 4).map((product, index) => (
          <div key={product._id} className="border rounded-lg p-4 relative">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => remove(product._id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove from comparison"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Image */}
            <div className="mb-4">
              <img
                src={(product.images && product.images[0]) || '/vite.svg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
              <div className="text-sm text-gray-600">
                <div className="font-medium">Brand: {product.brand}</div>
                <div>Part #: {product.partNumber || 'N/A'}</div>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-green-600">
                ${product.price}
                {list.length >= 2 && getBetterValue(list[0], list[1], 'price') === (index === 0 ? 'a' : 'b') && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Best Price</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center">
                <StarRating rating={product.rating || 0} />
                <span className="ml-2 text-sm text-gray-600">({product.rating || 0})</span>
              </div>

              {/* Stock */}
              <div className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </div>

              {/* Automotive Specs */}
              <div className="space-y-2 text-sm">
                <div><strong>Warranty:</strong> {product.specifications?.warranty || 'N/A'}</div>
                <div><strong>Material:</strong> {product.specifications?.material || 'N/A'}</div>
                <div><strong>Weight:</strong> {product.specifications?.weight || 'N/A'}</div>
                <div><strong>Dimensions:</strong> {product.specifications?.dimensions || 'N/A'}</div>
              </div>

              {/* Compatibility */}
              <div className="text-sm">
                <strong>Compatible with:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.specifications?.compatibility?.slice(0, 3).map((compat, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {compat}
                    </span>
                  )) || <span className="text-gray-500">Not specified</span>}
                  {product.specifications?.compatibility?.length > 3 && (
                    <span className="text-xs text-blue-600">+{product.specifications.compatibility.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stockQuantity === 0}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <Link
                  to={`/product/${product._id}`}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table View Component
const TableView = ({ list, remove, addToCart, getBetterValue }) => {
  const properties = [
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Product Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'partNumber', label: 'Part Number' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'stock', label: 'Availability' },
    { key: 'warranty', label: 'Warranty' },
    { key: 'material', label: 'Material' },
    { key: 'weight', label: 'Weight' },
    { key: 'dimensions', label: 'Dimensions' },
    { key: 'compatibility', label: 'Compatibility' },
    { key: 'actions', label: 'Actions' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r">
              Property
            </th>
            {list.slice(0, 4).map((product, index) => (
              <th key={product._id} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-64">
                <div className="flex items-center justify-between">
                  <span>Product {index + 1}</span>
                  <button
                    onClick={() => remove(product._id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove from comparison"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {properties.map((prop, propIndex) => (
            <tr key={prop.key} className={propIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-gray-700 border-r">
                {prop.label}
              </td>
              {list.slice(0, 4).map((product, productIndex) => (
                <td key={product._id} className="px-4 py-3 text-sm text-gray-700">
                  <PropertyCell
                    property={prop.key}
                    product={product}
                    productIndex={productIndex}
                    allProducts={list.slice(0, 4)}
                    getBetterValue={getBetterValue}
                    addToCart={addToCart}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Property Cell Component
const PropertyCell = ({ property, product, productIndex, allProducts, getBetterValue, addToCart }) => {
  const renderProperty = () => {
    switch (property) {
      case 'image':
        return (
          <img
            src={(product.images && product.images[0]) || '/vite.svg'}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        );
      case 'name':
        return <div className="font-medium">{product.name}</div>;
      case 'brand':
        return product.brand;
      case 'partNumber':
        return product.partNumber || 'N/A';
      case 'price':
        const isBestPrice = allProducts.length >= 2 && getBetterValue(allProducts[0], allProducts[1], 'price') === (productIndex === 0 ? 'a' : 'b');
        return (
          <div className="font-bold text-green-600">
            ${product.price}
            {isBestPrice && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Best</span>}
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center">
            <StarRating rating={product.rating || 0} />
            <span className="ml-1">({product.rating || 0})</span>
          </div>
        );
      case 'stock':
        return (
          <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        );
      case 'warranty':
        return product.specifications?.warranty || 'N/A';
      case 'material':
        return product.specifications?.material || 'N/A';
      case 'weight':
        return product.specifications?.weight || 'N/A';
      case 'dimensions':
        return product.specifications?.dimensions || 'N/A';
      case 'compatibility':
        return (
          <div className="space-y-1">
            {product.specifications?.compatibility?.slice(0, 3).map((compat, i) => (
              <div key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs inline-block mr-1 mb-1">
                {compat}
              </div>
            )) || <span className="text-gray-500">Not specified</span>}
            {product.specifications?.compatibility?.length > 3 && (
              <div className="text-xs text-blue-600">+{product.specifications.compatibility.length - 3} more</div>
            )}
          </div>
        );
      case 'actions':
        return (
          <div className="space-y-2">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium"
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <Link
              to={`/product/${product._id}`}
              className="w-full py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block text-xs"
            >
              View Details
            </Link>
          </div>
        );
      default:
        return 'N/A';
    }
  };

  return renderProperty();
};

// Star Rating Component
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  return <div className="flex">{stars}</div>;
};

export default Compare;

// Enhanced Modal component
export const CompareModal = ({ baseProduct, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    compatibility: ''
  });

  const search = async (q) => {
    if (!q) return setResults([]);
    try {
      setLoading(true);
      const base = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${base}/api/spareparts/getAllSpareParts`);
      const list = await res.json();
      
      // Enhanced filtering
      let filtered = (list || []).filter(p => {
        const matchesQuery = p.name?.toLowerCase().includes(q.toLowerCase()) ||
                           p.brand?.toLowerCase().includes(q.toLowerCase()) ||
                           p.partNumber?.toLowerCase().includes(q.toLowerCase());
        
        const matchesBrand = !filters.brand || p.brand?.toLowerCase().includes(filters.brand.toLowerCase());
        const matchesMinPrice = !filters.minPrice || parseFloat(p.price) >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || parseFloat(p.price) <= parseFloat(filters.maxPrice);
        const matchesCompatibility = !filters.compatibility || 
                                   p.specifications?.compatibility?.some(c => 
                                     c.toLowerCase().includes(filters.compatibility.toLowerCase()));
        
        return matchesQuery && matchesBrand && matchesMinPrice && matchesMaxPrice && matchesCompatibility;
      });
      
      setResults(filtered.slice(0, 20));
    } catch (e) {
      console.error('Compare search failed', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    setShowComparison(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Compare Spare Parts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showComparison ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Base Product */}
              <div className="lg:col-span-1">
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <div className="font-semibold text-blue-800 mb-3">Base Product</div>
                  <img
                    src={(baseProduct?.images && baseProduct.images[0]) || '/vite.svg'}
                    alt={baseProduct?.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-800">{baseProduct?.name}</div>
                    <div className="text-sm text-gray-600">{baseProduct?.brand}</div>
                    <div className="text-lg font-bold text-green-600">${baseProduct?.price}</div>
                    <div className="text-xs text-gray-500">Part #: {baseProduct?.partNumber}</div>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search for parts to compare
                    </label>
                    <div className="flex">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') search(query); }}
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by name, brand, or part number"
                      />
                      <button
                        onClick={() => search(query)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 font-medium"
                      >
                        Search
                      </button>
                    </div>
                  </div>


                  {/* Results */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading && <div className="text-center py-8 text-gray-500">Searching for parts...</div>}
                    {!loading && results.length === 0 && query && (
                      <div className="text-center py-8 text-gray-500">No matching parts found</div>
                    )}
                    {results.map((result) => (
                      <div key={result._id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <img
                          src={(result.images && result.images[0]) || '/vite.svg'}
                          alt={result.name}
                          className="w-20 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{result.name}</div>
                          <div className="text-sm text-gray-600">{result.brand} • Part #: {result.partNumber}</div>
                          <div className="text-sm font-bold text-green-600">${result.price}</div>
                          {result.specifications?.compatibility && (
                            <div className="text-xs text-gray-500 mt-1">
                              Compatible: {result.specifications.compatibility.slice(0, 2).join(', ')}
                              {result.specifications.compatibility.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setSelected(result)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            selected?._id === result._id
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {selected?._id === result._id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Selected Product */}
                  {selected && (
                    <div className="mt-6 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-green-800">Selected for Comparison</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelected(null)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleCompare}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Compare Now
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <img
                          src={(selected.images && selected.images[0]) || '/vite.svg'}
                          alt={selected.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{selected.name}</div>
                          <div className="text-sm text-gray-600">{selected.brand} • ${selected.price}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Comparison View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Detailed Comparison</h4>
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Back to Search
                </button>
              </div>

              {/* Compatibility Check */}
              {baseProduct?.specifications?.compatibility && selected?.specifications?.compatibility && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">Compatibility Analysis</h5>
                  {(() => {
                    const baseCompat = baseProduct.specifications.compatibility || [];
                    const selectedCompat = selected.specifications.compatibility || [];
                    const common = baseCompat.filter(item => selectedCompat.includes(item));
                    return (
                      <div className="space-y-2">
                        {common.length > 0 ? (
                          <div>
                            <span className="text-green-600 font-medium">✓ Compatible with: </span>
                            <span className="text-sm">{common.join(', ')}</span>
                          </div>
                        ) : (
                          <div className="text-orange-600 font-medium">⚠ No common compatibility found</div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <strong>Base Product Compatible With:</strong>
                            <div className="text-gray-600">{baseCompat.join(', ') || 'Not specified'}</div>
                          </div>
                          <div>
                            <strong>Selected Product Compatible With:</strong>
                            <div className="text-gray-600">{selectedCompat.join(', ') || 'Not specified'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-1/3">
                        Specification
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-1/3">
                        {baseProduct?.name}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-1/3">
                        {selected?.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <ComparisonRow
                      label="Product Image"
                      baseValue={
                        <img
                          src={(baseProduct?.images && baseProduct.images[0]) || '/vite.svg'}
                          alt={baseProduct?.name}
                          className="w-32 h-24 object-cover rounded"
                        />
                      }
                      selectedValue={
                        <img
                          src={(selected?.images && selected.images[0]) || '/vite.svg'}
                          alt={selected?.name}
                          className="w-32 h-24 object-cover rounded"
                        />
                      }
                    />
                    <ComparisonRow label="Brand" baseValue={baseProduct?.brand} selectedValue={selected?.brand} />
                    <ComparisonRow label="Part Number" baseValue={baseProduct?.partNumber} selectedValue={selected?.partNumber} />
                    <ComparisonRow 
                      label="Price" 
                      baseValue={
                        <span className={`font-bold ${parseFloat(baseProduct?.price) < parseFloat(selected?.price) ? 'text-green-600' : 'text-gray-700'}`}>
                          ${baseProduct?.price}
                          {parseFloat(baseProduct?.price) < parseFloat(selected?.price) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Better Price</span>}
                        </span>
                      }
                      selectedValue={
                        <span className={`font-bold ${parseFloat(selected?.price) < parseFloat(baseProduct?.price) ? 'text-green-600' : 'text-gray-700'}`}>
                          ${selected?.price}
                          {parseFloat(selected?.price) < parseFloat(baseProduct?.price) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Better Price</span>}
                        </span>
                      }
                    />
                    <ComparisonRow 
                      label="Rating" 
                      baseValue={
                        <div className="flex items-center">
                          <StarRating rating={baseProduct?.rating || 0} />
                          <span className="ml-2">({baseProduct?.rating || 0})</span>
                        </div>
                      }
                      selectedValue={
                        <div className="flex items-center">
                          <StarRating rating={selected?.rating || 0} />
                          <span className="ml-2">({selected?.rating || 0})</span>
                        </div>
                      }
                    />
                    <ComparisonRow 
                      label="Stock Status" 
                      baseValue={
                        <span className={baseProduct?.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {baseProduct?.stockQuantity > 0 ? `${baseProduct.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                      }
                      selectedValue={
                        <span className={selected?.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {selected?.stockQuantity > 0 ? `${selected.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                      }
                    />
                    <ComparisonRow label="Warranty" baseValue={baseProduct?.specifications?.warranty || 'Not specified'} selectedValue={selected?.specifications?.warranty || 'Not specified'} />
                    <ComparisonRow label="Material" baseValue={baseProduct?.specifications?.material || 'Not specified'} selectedValue={selected?.specifications?.material || 'Not specified'} />
                    <ComparisonRow label="Weight" baseValue={baseProduct?.specifications?.weight || 'Not specified'} selectedValue={selected?.specifications?.weight || 'Not specified'} />
                    <ComparisonRow label="Dimensions" baseValue={baseProduct?.specifications?.dimensions || 'Not specified'} selectedValue={selected?.specifications?.dimensions || 'Not specified'} />
                    <ComparisonRow label="Country of Origin" baseValue={baseProduct?.specifications?.origin || 'Not specified'} selectedValue={selected?.specifications?.origin || 'Not specified'} />
                    <ComparisonRow label="Installation Difficulty" baseValue={baseProduct?.specifications?.installationDifficulty || 'Not specified'} selectedValue={selected?.specifications?.installationDifficulty || 'Not specified'} />
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                <button
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existing = cart.find(item => item._id === baseProduct._id);
                    if (existing) {
                      existing.quantity += 1;
                    } else {
                      cart.push({ ...baseProduct, quantity: 1 });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    alert(`${baseProduct.name} added to cart!`);
                  }}
                  disabled={baseProduct?.stockQuantity === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Add Base Product to Cart
                </button>
                <button
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existing = cart.find(item => item._id === selected._id);
                    if (existing) {
                      existing.quantity += 1;
                    } else {
                      cart.push({ ...selected, quantity: 1 });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    alert(`${selected.name} added to cart!`);
                  }}
                  disabled={selected?.stockQuantity === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Add Selected Product to Cart
                </button>
              </div>

              {/* Recommendation */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-2">💡 Our Recommendation</h5>
                <div className="text-sm text-yellow-700">
                  {(() => {
                    const basePrice = parseFloat(baseProduct?.price || 0);
                    const selectedPrice = parseFloat(selected?.price || 0);
                    const baseRating = parseFloat(baseProduct?.rating || 0);
                    const selectedRating = parseFloat(selected?.rating || 0);
                    
                    if (basePrice < selectedPrice && baseRating >= selectedRating) {
                      return `We recommend the ${baseProduct?.name} for better value - lower price with comparable or better rating.`;
                    } else if (selectedPrice < basePrice && selectedRating >= baseRating) {
                      return `We recommend the ${selected?.name} for better value - lower price with comparable or better rating.`;
                    } else if (baseRating > selectedRating) {
                      return `The ${baseProduct?.name} has a higher customer rating, which might indicate better quality and reliability.`;
                    } else if (selectedRating > baseRating) {
                      return `The ${selected?.name} has a higher customer rating, which might indicate better quality and reliability.`;
                    } else {
                      return "Both products have similar ratings and pricing. Consider compatibility with your vehicle and warranty terms when making your decision.";
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Comparison Row Component
const ComparisonRow = ({ label, baseValue, selectedValue }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-700">{label}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{baseValue || 'Not specified'}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{selectedValue || 'Not specified'}</td>
    </tr>
  );
};