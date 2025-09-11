import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';


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
  const [orders, setOrders] = useState([]);
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
            console.log(pData)
            setProducts(pData);
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
    // also fetch store orders
    const fetchOrders = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${base}/api/orders/getOrdersByStoreId/${id}`, { credentials: 'include' });
        if (!res.ok) {
          // ignore 404/empty responses gracefully
          return setOrders([]);
        }
        const data = await res.json();
        const list = data.orders || data || [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        console.debug('Could not load store orders:', err);
        setOrders([]);
      }
    };
    fetchOrders();
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
              <Link to={`/product/${p._id}`} key={p._id}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">No image</div>}
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
      </div>

      {/* Store Orders Section */}
      <div className="mt-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold">Store Orders</h2>
        {orders == null || orders.length === 0 ? (
          <p className="mt-2 text-gray-600">No orders for this store yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => {
              // filter items for this store only
              const storeItems = (order.items || []).filter(
                (it) => String(it.storeId) === String(id) || (it.store && String(it.store._id) === String(id))
              );
              if (!storeItems || storeItems.length === 0) return null;

              // compute subtotal for just this store's items
              const subtotal = storeItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

              return (
                <div key={order._id} className="border rounded p-4 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-medium">Order #{order._id}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt || order.orderDate || order.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">{order.status}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-semibold">Items from your store</div>
                    <div className="mt-2 space-y-2">
                      {storeItems.map((it) => (
                        <div key={it._id || it.sparePartId || it.sparePart} className="flex items-center space-x-3">
                          <img src={it.image || (it.sparePart && it.sparePart.image) || '/vite.svg'} alt="item" className="w-14 h-14 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{it.name || (it.sparePart && it.sparePart.name) || 'Item'}</div>
                            <div className="text-sm text-gray-500">Qty: {it.quantity || 1}</div>
                          </div>
                          <div className="font-semibold">${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-600">Shipping: {order.shippingAddress ? `${order.shippingAddress.address || order.shippingAddress.line1 || ''}, ${order.shippingAddress.city || ''}` : '—'}</div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Subtotal</div>
                        <div className="text-lg font-bold">${subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreHome;
