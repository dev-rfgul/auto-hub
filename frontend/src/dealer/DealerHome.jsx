import axios from "axios";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookie from "js-cookie";
import BlogForm from "../components/BlogForm";
import { useState, useEffect } from "react";

const DealerHome = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Helper to render address which may be a string or an object
  const formatAddress = (address) => {
    if (!address) return null;
    if (typeof address === "string") return address;
    const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
    return parts.join(", ");
  };

  useEffect(() => {
    // Always fetch latest user data from backend to get updated dealer status
    const fetchLatestUser = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "";
        // First try the authenticated /me endpoint on the backend. This works
        // when the backend sets httpOnly cookies (production behind proxy).
        try {
          const res = await axios.get(`${base}/api/user/me`, { withCredentials: true });
          if (res && res.data) {
            Cookie.set("user", JSON.stringify(res.data));
            setDealer(res.data);
            return;
          }
        } catch (meErr) {
          // /me may return 401 when not authenticated or CORS/preflight fails.
          // We'll fall back to reading the client-visible cookie below.
        }

        // Fallback: if /me did not return a user, try the client cookie (useful
        // for local dev or cases where cookie is available on frontend origin).
        const userCookie = Cookie.get("user");
        let user = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
        } catch (e) {
          user = null;
        }
        if (user) setDealer(user);
      } catch (e) {
        // fallback to cookie if API fails
        const userCookie = Cookie.get("user");
        let user = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
        } catch (e) {
          user = null;
        }
        if (user) setDealer(user);
        console.warn('DealerHome: fetchLatestUser error', e);
      } finally {
        // always turn off loading once we've attempted to resolve the dealer
        setLoading(false);
      }
    };
    fetchLatestUser();
  }, []);

  useEffect(() => {
    // Wait until dealer object is loaded
    if (!dealer || !dealer.dealer) {
      setLoading(false);
      return;
    }

    const storeIds = dealer.dealer.stores || [];
    if (!storeIds || storeIds.length === 0) {
      // No stores to fetch
      setStores([]);
      setLoading(false);
      return;
    }

    // Normalize to string ids (handle case where stores may be populated objects)
    const ids = storeIds.map((s) => (typeof s === "string" ? s : s?._id));

    const fetchStores = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "";

        // Fetch each store by id. Backend should expose GET /api/store/getStoreById/:id
        const promises = ids.map((id) =>
          fetch(`${base}/api/store/getStoreById/${id}`, { credentials: "include" })
            .then((r) => {
              if (!r.ok) throw new Error(`Status ${r.status}`);
              return r.json();
            })
        );

        const results = await Promise.all(promises);

        // Normalize results: API may return store object directly or { store }
        const normalized = results.map((res) => res.store || res || null).filter(Boolean);
        setStores(normalized);
      } catch (err) {
        console.warn("Could not fetch stores:", err);
        setError("Unable to load stores from the server.");
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [dealer]);

  // Show loading before we decide dealer presence
  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Dealer Dashboard</h2>
        <p className="text-gray-500">Loading dealer information...</p>
      </div>
    );
  }

  // Conditional rendering: if no dealer data or missing nested dealer object
  if (!dealer || !dealer.dealer) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Dealer Dashboard</h2>
        <p className="text-red-600">Dealer information not found.</p>
      </div>
    );
  }

  if (dealer.dealer.verificationStatus === "pending") {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Dealer Dashboard</h2>
        <p className="text-yellow-700 bg-yellow-50 p-4 rounded">
          Your request is pending.<br />
          Please wait for the admin to approve your account.<br />
          You can create stores after admin approves your request.
        </p>
      </div>
    );
  }

  if (
    dealer.dealer.verificationStatus !== "verified" &&
    dealer.dealer.verificationStatus !== "approved"
  ) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Dealer Dashboard</h2>
        <p className="text-red-600">Your account was rejected or is in an unknown state.</p>
      </div>
    );
  }

  // Main dashboard render (only if verified/approved)
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dealer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your stores and listings.</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/store-signup" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Register Store
            </Link>
            <button onClick={() => setShowBlogForm(true)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Blog</button>
          </div>
  {showBlogForm && <BlogForm onClose={() => setShowBlogForm(false)} onCreated={(b) => console.log('Blog created', b)} />}
        </header>

        <section>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading stores...</div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
                  {error}
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Your stores</h2>
                <p className="text-sm text-gray-500">{stores.length} store(s)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stores.length === 0 ? (
                  <Link to="/store-signup" className="bg-white p-8 rounded-lg shadow-sm border flex flex-col items-center justify-center hover:bg-blue-50 cursor-pointer">
                    <span className="text-4xl mb-2 text-blue-600">+</span>
                    <span className="font-semibold text-blue-700">Create Store</span>
                    <span className="text-sm text-gray-500 mt-2">No stores found. Click to register your first store.</span>
                  </Link>
                ) : (
                  stores.map((s) => {
                    const status = s.approvalStatus || 'pending';
                    const isApproved = status === 'verified' || status === 'approved';
                    const isRejected = status === 'rejected';

                    const badgeClass = isApproved ? 'text-green-700 bg-green-50' : isRejected ? 'text-red-700 bg-red-50' : 'text-yellow-800 bg-yellow-50';

                    return (
                      <div key={s._id} className="bg-white p-5 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          {/* Left: store info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight truncate">{s.businessName || s.name || 'Untitled Store'}</h3>
                            <p className="text-sm text-gray-600 mt-1 truncate">{formatAddress(s.address) || 'No address provided'}</p>

                            <div className="mt-3 flex items-center space-x-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass}`}>{isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}</span>
                              {s.rating ? <span className="text-xs text-gray-500">{s.rating} ★</span> : <span className="text-xs text-gray-400">No rating yet</span>}
                            </div>
                          </div>

                          {/* Right: actions */}
                          <div className="flex-shrink-0 w-36 text-right">
                            {isApproved ? (
                              <div className="flex flex-col items-end space-y-2">
                                <Link to={`/dealer/store/${s._id}`} className="w-full inline-flex justify-center items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Manage Store</Link>
                                <Link to={`/product-upload/${s._id}`} className="w-full inline-flex justify-center items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Add Product</Link>
                              </div>
                            ) : isRejected ? (
                              <div className="flex flex-col items-end space-y-2">
                                <button disabled className="w-full inline-flex justify-center items-center px-3 py-2 bg-gray-200 text-gray-500 rounded-md text-sm cursor-not-allowed">Manage Store</button>
                                <Link to={`/store-signup`} className="w-full inline-flex justify-center items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200">Resubmit</Link>
                                <p className="mt-1 text-xs text-red-700">Your store was rejected.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end space-y-2">
                                <button disabled className="w-full inline-flex justify-center items-center px-3 py-2 bg-gray-200 text-gray-500 rounded-md text-sm cursor-not-allowed">Manage Store</button>
                                <p className="mt-1 text-xs text-yellow-700">Not approved yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
  {showBlogForm && <BlogForm onClose={() => setShowBlogForm(false)} onCreated={(b) => console.log('dealer created blog', b)} />}
      </div>
    </div>
  );
};

export default DealerHome;
