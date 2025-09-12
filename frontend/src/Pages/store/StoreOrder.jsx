import React, { useEffect, useState } from 'react';

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
};

const StoreOrder = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${base}/api/orders/getOrdersByStoreId/${storeId}`, { credentials: 'include' });
        if (!res.ok) {
          setOrders([]);
          return;
        }
        const data = await res.json();
        const list = data.orders || data || [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        console.debug('Could not load store orders:', err);
        setError('Unable to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) fetchOrders();
  }, [storeId]);

  if (loading) return <div className="p-4 text-gray-500">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Store Orders</h2>
      {orders == null || orders.length === 0 ? (
        <p className="mt-2 text-gray-600">No orders for this store yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const storeItems = (order.items || []).filter(
              (it) => String(it.storeId) === String(storeId) || (it.store && String(it.store._id) === String(storeId))
            );
            if (!storeItems || storeItems.length === 0) return null;

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
  );
};

export default StoreOrder;
