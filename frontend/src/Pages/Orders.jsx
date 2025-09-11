import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Link } from 'react-router-dom';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  cart: 'bg-gray-100 text-gray-800'
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      let userId = null;
      try {
        const u = Cookie.get('user');
        if (u) userId = JSON.parse(u)._id;
      } catch (e) { /* ignore */ }

      const base = import.meta.env.VITE_BACKEND_URL || '';
      // prefer user-specific route if we have userId
      const url =`${base}/api/orders/getOrderByUserId/${userId}`   // adjust if your backend route differs
            // fallback

      try {
        const res = await axios.get(url, { withCredentials: true });
        // server may return { orders } or an array directly
        const data = res.data?.orders ?? res.data ?? [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading orders…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold">No orders yet</h2>
        <p className="text-gray-600 mt-2">You haven't placed any orders.</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border rounded shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Order ID: <span className="font-mono">{order._id}</span></div>
                <div className="mt-1 text-lg font-medium">${(order.totalAmount || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-1">Placed: {formatDate(order.orderDate || order.createdAt)}</div>
              </div>

              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </div>
                <div className="text-xs text-gray-400 mt-2">{formatDate(order.updatedAt)}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="font-semibold text-sm mb-2">Items</div>
                <div className="space-y-2">
                  {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((it, idx) => {
                    const prod = it.sparePartId || {};
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <img src={prod.images?.[0] || '/vite.svg'} alt={it.name || prod.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{it.name || prod.name}</div>
                          <div className="text-xs text-gray-500">{it.brand || prod.brand}</div>
                          <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                        </div>
                        <div className="text-right text-sm font-medium">${(it.price * it.quantity).toFixed(2)}</div>
                      </div>
                    );
                  }) : <div className="text-sm text-gray-500">No items</div>}
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm mb-2">Shipping</div>
                <div className="text-sm text-gray-700">
                  <div>{order.shippingAddress?.fullName}</div>
                  <div>{order.shippingAddress?.street}</div>
                  <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                  <div>{order.shippingAddress?.country}</div>
                  <div className="text-xs text-gray-500 mt-2">Metadata: {order.metadata ? JSON.stringify(order.metadata) : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;