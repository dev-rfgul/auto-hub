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
                       <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        Payment Method:
                      </div>
                      <div className="font-medium text-gray-900">
                        {order.metadata.paymentInfo?.method || "N/A"}
                      </div>
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
