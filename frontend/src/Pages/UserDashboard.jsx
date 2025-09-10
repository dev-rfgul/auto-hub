import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';

const UserDashboard = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from cookie
    let userData = null;
    try {
      const userCookie = Cookie.get('user');
      console.log('User cookie:', JSON.parse(userCookie));
      if (userCookie) {
        userData = JSON.parse(userCookie);
        setUser(userData);
      }
    } catch (e) {
      console.error('Error parsing user cookie:', e);
    }

    // Fetch cart only if user data is available
    if (userData && userData._id) {
      fetchCart(userData._id);
    }
  }, []);

  const fetchCart = async (userId) => {
    if (!userId) {
      console.log('No userId provided to fetchCart');
      setLoading(false);
      return;
    }
    
    console.log('Fetching cart for user ID:', userId);
    try {
      setLoading(true);
      const base = import.meta.env.VITE_BACKEND_URL || '';
      const response = await axios.get(`${base}/api/spareparts/cart/${userId}`, {
        withCredentials: true
      });
      
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productOrId) => {
    setError('');
    if (!user || !user._id) {
      setError('User not authenticated');
      return;
    }

    // normalize id (handles populated objects)
    const productId =
      productOrId && typeof productOrId === 'object'
        ? productOrId._id || productOrId.id || productOrId.sparePartId || (productOrId.sparePartId && productOrId.sparePartId._id)
        : productOrId;

    if (!productId) {
      setError('Invalid product id');
      return;
    }

    try {
      const base = import.meta.env.VITE_BACKEND_URL || '';
      // send body as second arg, config (withCredentials) as third arg
      const res = await axios.post(
        `${base}/api/spareparts/removeFromCart`,
        { userId: user._id, productId },
        { withCredentials: true }
      );

      if (res?.status === 200) {
        setCart(res.data?.cart || null);
      } else {
        setError(res?.data?.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || err.message || 'Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const base = import.meta.env.VITE_BACKEND_URL || '';
      // Remove the item first, then add with new quantity
      await axios.delete(`${base}/api/spareparts/remove-from-cart`, {
        data: { productId },
        withCredentials: true
      });
      
      await axios.post(`${base}/api/spareparts/add-to-cart`, {
        productId,
        quantity: newQuantity
      }, {
        withCredentials: true
      });
      
      // Refresh cart
      if (user && user._id) {
        fetchCart(user._id);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    }
  };

  const checkout = async () => {
    try {
      const base = import.meta.env.VITE_BACKEND_URL || '';
      const response = await axios.post(`${base}/api/spareparts/checkout`, {
        shippingAddress: {
          street: "123 Main St", // You can add a form for this
          city: "City",
          state: "State",
          zipCode: "12345",
          country: "Country"
        },
        paymentInfo: {
          method: "cod" // Cash on delivery for now
        }
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        alert('Order placed successfully!');
        if (user && user._id) {
          fetchCart(user._id); // Refresh to show empty cart
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        {user && (
          <p className="text-gray-600 mt-2">Welcome back, {user.username || user.email}!</p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Cart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
            {cart && cart.items && cart.items.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m3.6 8L9 13m0 0L7 13m2 0v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4m2 0V9a1 1 0 011-1h2a1 1 0 011 1v4.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Start shopping to add items to your cart</p>
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.sparePartId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src={item.sparePartId?.images?.[0] || '/vite.svg'} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-green-600">${item.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.sparePartId, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300 min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sparePartId, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.sparePartId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between text-xl font-bold text-gray-900 mb-4">
                  <span>Total</span>
                  <span className="text-green-600">${cart.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={checkout}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/orders" 
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order History</h3>
          <p className="text-gray-600 text-sm">View your past orders and track deliveries</p>
        </Link>
        
        <Link 
          to="/profile" 
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h3>
          <p className="text-gray-600 text-sm">Update your personal information</p>
        </Link>
        
        <Link 
          to="/compare" 
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compare Products</h3>
          <p className="text-gray-600 text-sm">Compare your saved products</p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;