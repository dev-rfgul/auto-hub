import React, { useEffect, useState } from 'react';

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
};

const StoreOrder = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
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
                  <div className="text-sm flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      View
                    </button>
                  
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">{order.status}</span>
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          setUpdating((s) => ({ ...s, [order._id]: true }));
                          const base = import.meta.env.VITE_BACKEND_URL || '';
                          const res = await fetch(`${base}/api/orders/updateOrderStatus/${order._id}`, {
                            method: 'PATCH',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          if (!res.ok) throw new Error(`Status ${res.status}`);
                          const updated = await res.json();
                          setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
                        } catch (err) {
                          console.error('Failed to update order status', err);
                          // optionally show a toast or setError
                        } finally {
                          setUpdating((s) => ({ ...s, [order._id]: false }));
                        }
                      }}
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      disabled={!!updating[order._id]}
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    {updating[order._id] && <span className="text-xs text-gray-500">Updating...</span>}
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

        {/* Order details modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">Order Details — #{selectedOrder._id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-800">Close</button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <div className="font-medium">Customer</div>
                  <div>{selectedOrder.userId || (selectedOrder.user && selectedOrder.user.name) || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{selectedOrder.user && selectedOrder.user.email}</div>
                </div>

                <div>
                  <div className="font-medium">Shipping Address</div>
                  <div>{formatAddress(selectedOrder.shippingAddress || selectedOrder.shipping)}</div>
                </div>

                <div>
                  <div className="font-medium">Items</div>
                  <div className="mt-2 space-y-2">
                    {(selectedOrder.items || [])
                      .filter((it) => String(it.storeId) === String(storeId) || (it.store && String(it.store._id) === String(storeId)))
                      .map((it) => (
                        <div key={it._id || it.sparePartId || it.sparePart} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{it.name || (it.sparePart && it.sparePart.name) || 'Item'}</div>
                            <div className="text-xs text-gray-500">Qty: {it.quantity || 1}</div>
                          </div>
                          <div className="font-semibold">${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">Order status: <span className="font-medium">{selectedOrder.status}</span></div>
                  <div className="text-lg font-bold">Total: ${(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default StoreOrder;
