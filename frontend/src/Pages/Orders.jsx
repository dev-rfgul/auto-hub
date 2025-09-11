// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Cookie from 'js-cookie';
// import { Link } from 'react-router-dom';
// import { Truck, Package, CheckCircle, XCircle, Clock } from 'lucide-react';

// const statusStyles = {
//   pending: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300',
//   processed: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
//   shipped: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300',
//   delivered: 'bg-green-100 text-green-700 ring-1 ring-green-300',
//   cancelled: 'bg-red-100 text-red-700 ring-1 ring-red-300',
//   cart: 'bg-gray-100 text-gray-700 ring-1 ring-gray-300'
// };

// const statusIcons = {
//   pending: Clock,
//   processed: Package,
//   shipped: Truck,
//   delivered: CheckCircle,
//   cancelled: XCircle
// };

// const formatDate = (iso) => {
//   try {
//     return new Date(iso).toLocaleString();
//   } catch {
//     return iso;
//   }
// };

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       setError('');
//       let userId = null;
//       try {
//         const u = Cookie.get('user');
//         if (u) userId = JSON.parse(u)._id;
//       } catch (e) {}

//       const base = import.meta.env.VITE_BACKEND_URL || '';
//       const url = `${base}/api/orders/getOrderByUserId/${userId}`;

//       try {
//         const res = await axios.get(url, { withCredentials: true });
//         const data = res.data?.orders ?? res.data ?? [];
//         setOrders(Array.isArray(data) ? data : []);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to load orders');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   if (loading) return <div className="p-6 text-gray-500">Loading orders…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   if (!orders || orders.length === 0) {
//     return (
//       <div className="max-w-4xl mx-auto p-10 text-center bg-white rounded-xl shadow-sm">
//         <h2 className="text-2xl font-semibold text-gray-800">No orders yet</h2>
//         <p className="text-gray-600 mt-2">You haven’t placed any orders.</p>
//         <Link
//           to="/"
//           className="mt-5 inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
//         >
//           Browse products
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Orders</h1>

//       {orders.map((order) => {
//         const Icon = statusIcons[order.status] || Package;
//         return (
//           <div
//             key={order._id}
//             className="bg-white border rounded-xl shadow hover:shadow-md transition p-6"
//           >
//             {/* Order Header */}
//             <div className="flex items-start justify-between border-b pb-4">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Order ID: <span className="font-mono">{order._id}</span>
//                 </p>
//                 <p className="mt-1 text-lg font-semibold text-gray-900">
//                   ${(order.totalAmount || 0).toFixed(2)}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Placed: {formatDate(order.orderDate || order.createdAt)}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <span
//                   className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyles[order.status]}`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {order.status}
//                 </span>
//                 <p className="text-xs text-gray-400 mt-2">
//                   Updated: {formatDate(order.updatedAt)}
//                 </p>
//               </div>
//             </div>

//             {/* Order Content */}
//             <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Items */}
//               <div className="md:col-span-2">
//                 <h3 className="font-semibold text-gray-800 text-sm mb-3">Items</h3>
//                 <div className="space-y-3">
//                   {Array.isArray(order.items) && order.items.length > 0 ? (
//                     order.items.map((it, idx) => {
//                       const prod = it.sparePartId || {};
//                       return (
//                         <div
//                           key={idx}
//                           className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
//                         >
//                           <div className="flex items-center gap-3 min-w-0">
//                             {/* <img
//                               src={prod.images?.[0] || '/vite.svg'}
//                               alt={it.name || prod.name}
//                               className="w-14 h-14 object-cover rounded-md border"
//                             /> */}
//                             <div className="min-w-0">
//                               <p className="text-sm font-medium text-gray-800 truncate">
//                                 {it.name || prod.name}
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 {it.brand || prod.brand}
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 Qty: {it.quantity}
//                               </p>
//                             </div>
//                           </div>
//                           <p className="text-sm font-semibold text-gray-900">
//                             ${(it.price * it.quantity).toFixed(2)}
//                           </p>
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <p className="text-sm text-gray-500">No items</p>
//                   )}
//                 </div>
//               </div>

//               {/* Shipping */}
//               <div>
//                 <h3 className="font-semibold text-gray-800 text-sm mb-3">Shipping</h3>
//                 <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-1">
//                   <p>{order.shippingAddress?.fullName}</p>
//                   <p>{order.shippingAddress?.street}</p>
//                   <p>
//                     {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
//                     {order.shippingAddress?.zipCode}
//                   </p>
//                   <p>{order.shippingAddress?.country}</p>
//                   {order.metadata && (
//                     <p className="text-xs text-gray-500 pt-2">
//                       Metadata: {JSON.stringify(order.metadata)}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Orders;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import { Link } from "react-router-dom";

const statusStyles = {
  pending:
    "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200",
  processed:
    "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
  shipped:
    "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200",
  delivered:
    "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200",
  cancelled:
    "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200",
  cart: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200",
};

const statusIcons = {
  pending: "⏳",
  processed: "⚙️",
  shipped: "🚚",
  delivered: "✅",
  cancelled: "❌",
  cart: "🛒",
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      let userId = null;
      try {
        const u = Cookie.get("user");
        if (u) userId = JSON.parse(u)._id;
      } catch (e) {
        /* ignore */
      }

      const base = import.meta.env.VITE_BACKEND_URL || "";
      const url = `${base}/api/orders/getOrderByUserId/${userId}`;

      try {
        const res = await axios.get(url, { withCredentials: true });
        const data = res.data?.orders ?? res.data ?? [];
        console.log("Fetched orders:", data);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-lg">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders. Start shopping to see your order
            history here!
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">🛍️</span>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">
                        Order ID
                      </div>
                      <div className="font-mono text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded mt-1">
                        {order._id}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.orderDate || order.createdAt)}
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                        statusStyles[order.status] || statusStyles.cart
                      }`}
                    >
                      <span className="mr-2">
                        {statusIcons[order.status] || statusIcons.cart}
                      </span>
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Items Section */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900">
                        Order Items
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const prod = item.sparePartId || {};
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                  <span className="text-2xl">📦</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {item.name || prod.name || "Unknown Item"}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.brand ||
                                    prod.brand ||
                                    "No brand specified"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="bg-white px-2 py-1 rounded-full">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="bg-white px-2 py-1 rounded-full">
                                    Unit: ${item.price?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📭</div>
                          <p>No items found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900">
                        Shipping Details
                      </h3>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-5 rounded-xl border border-green-100">
                      {order.shippingAddress ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">👤</span>
                            <span className="font-medium text-gray-900">
                              {order.shippingAddress.fullName}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">📍</span>
                            <div className="text-sm text-gray-700">
                              <div>{order.shippingAddress.street}</div>
                              <div>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.zipCode}
                              </div>
                              <div className="font-medium">
                                {order.shippingAddress.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <div className="text-2xl mb-2">📭</div>
                          <p className="text-sm">No shipping address</p>
                        </div>
                      )}

                      {order.metadata && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Metadata:</span>
                            <div className="mt-1 p-2 bg-white rounded text-gray-500 font-mono text-xs break-all">
                              {JSON.stringify(order.metadata, null, 2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-400 text-center">
                      Last updated: {formatDate(order.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
