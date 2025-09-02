import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookie from "js-cookie";

const DealerHome = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealer, setDealer] = useState(null);

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
        // Get user id from cookie
        const userCookie = Cookie.get("user");
        console.log(userCookie);
        let user = null;
        let userId = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
          userId = user?._id;
        } catch (e) {
          user = null;
        }
        if (!userId) {
          setDealer(user);
          return;
        }
        const res = await axios.get(`${base}/api/user/user/${userId}`, { withCredentials: true });
        Cookie.set("user", JSON.stringify(res.data));
        setDealer(res.data);
        console.log("Fetched latest user data:", res.data);
      } catch (e) {
        // fallback to cookie if API fails
        const userCookie = Cookie.get("user");
        let user = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
        } catch (e) {
          user = null;
        }
        setDealer(user);
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

        // Fetch each store by id. Backend should expose GET /api/dealer/getStoreById/:id
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

  // Conditional rendering
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
            <h1 className="text-2xl font-bold text-gray-900">
              Dealer Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your stores and listings.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/dealer/create-store"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Register Store
            </Link>
            <Link
              to="/dealer/stores/new"
              className="inline-flex items-center px-3 py-2 bg-white border rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              New Store (wizard)
            </Link>
          </div>
        </header>

        <section>
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading stores...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
                  {error}
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Your stores
                </h2>
                <p className="text-sm text-gray-500">
                  {stores.length} store(s)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stores.length === 0 ? (
                  <Link
                    to="/store-signup"
                    className="bg-white p-8 rounded-lg shadow-sm border flex flex-col items-center justify-center hover:bg-blue-50 cursor-pointer"
                  >
                    <span className="text-4xl mb-2 text-blue-600">+</span>
                    <span className="font-semibold text-blue-700">Create Store</span>
                    <span className="text-sm text-gray-500 mt-2">No stores found. Click to register your first store.</span>
                  </Link>
                ) : (
                  stores.map((s) => (
                    <div
                      key={s._id}
                      className="bg-white p-4 rounded-lg shadow-sm border"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">
                            {s.businessName || s.name || "Untitled Store"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatAddress(s.address) || "No address provided"}
                          </p>
                          <p className="mt-3 text-sm">
                            <span
                              className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-2"
                              style={{
                                background:
                                  s.verificationStatus === "verified"
                                    ? "#ecfdf5"
                                    : "#fff7ed",
                              }}
                            >
                              {s.verificationStatus || "pending"}
                            </span>
                          </p>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <Link
                            to={`/dealer/stores/${s._id}`}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            View
                          </Link>
                          <Link
                            to={`/dealer/stores/${s._id}/edit`}
                            className="ml-2 inline-flex items-center px-2 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DealerHome;
