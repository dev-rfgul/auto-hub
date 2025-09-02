import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookie from 'js-cookie';

const dummyProducts = [
  {
    _id: 'd1',
    name: 'Premium Brake Pads',
    price: 49.99,
    image: '/vite.svg',
    short: 'High-performance ceramic brake pads for reliable stopping power.',
  },
  {
    _id: 'd2',
    name: 'Alloy Wheel (17")',
    price: 129.99,
    image: '/vite.svg',
    short: 'Lightweight 17-inch alloy wheel with modern design.',
  },
  {
    _id: 'd3',
    name: 'Engine Oil 5W-30 (4L)',
    price: 34.5,
    image: '/vite.svg',
    short: 'Fully synthetic engine oil for extended engine life.',
  },
];

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
};

const StoreHome = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        // Try to fetch store using the same endpoint pattern used elsewhere
        const res = await fetch(`${base}/api/store/getStoreById/${id}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        const s = data.store || data;
        setStore(s);

        // Try to fetch products for the store. backend route may vary so we try a couple patterns
        try {
          const pRes = await fetch(`${base}/api/store/getProductsByStoreId/${id}`, { credentials: 'include' });
          if (pRes.ok) {
            const pData = await pRes.json();
            const pList = pData.products || pData || [];
            console.log(pList);
            console.log(pData)
            setProducts(pList.length ? pList : dummyProducts);
          } else {
            // fallback to dummy
            setProducts(dummyProducts);
          }
        } catch (err) {
          setProducts(dummyProducts);
        }
      } catch (err) {
        console.warn('Could not load store:', err);
        setError('Unable to load store.');
        setStore(null);
        setProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading store...</div>;

  if (!store) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Store</h2>
        <p className="text-red-600">{error || 'Store not found.'}</p>
      </div>
    );
  }

  const approval = store.approvalStatus || store.status || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        {store.banner ? (
          <div className="w-full h-40 rounded-lg overflow-hidden mb-6">
            <img src={store.banner} alt="banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center mb-6">
            <span className="text-gray-400">No banner</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-28 h-28 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
              {store.logo ? (
                <img src={store.logo} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No logo</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">{store.businessName || store.name}</h1>
              <p className="text-sm text-gray-600 mt-2">{store.description}</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                <div>
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="font-medium">{formatAddress(store.address) || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Contact</div>
                  <div className="font-medium">{(store.contactInfo && (store.contactInfo.phone || store.contactInfo.email)) || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Hours</div>
                  <div className="font-medium">{store.operatingHours ? `${store.operatingHours.open || ''} - ${store.operatingHours.close || ''}` : '—'}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${approval === 'approved' || approval === 'verified' ? 'text-green-700 bg-green-50' : approval === 'rejected' ? 'text-red-700 bg-red-50' : 'text-yellow-800 bg-yellow-50'}`}>
                    {approval}
                  </span>

                  <span className="text-sm text-gray-500">Created: {new Date(store.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link to={`/product-upload/${id}`} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Upload Product</Link>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-sm text-gray-500">{products.length} item(s)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">No image</div>}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{p.short || p.description || ''}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">${p.price?.toFixed ? p.price.toFixed(2) : (p.price || '—')}</div>
                    <Link to={`/product/${p._id}`} className="text-xs text-blue-600">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHome;
