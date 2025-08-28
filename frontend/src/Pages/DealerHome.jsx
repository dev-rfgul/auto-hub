import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DealerHome = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "";
        // Backend endpoint expectation: GET /api/dealer/stores or similar
        const res = await fetch(`${base}/api/dealer/stores`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }

        const data = await res.json();
        // backend may return { stores: [...] } or an array directly
        setStores(data.stores || data || []);
      } catch (err) {
        console.warn("Could not fetch stores:", err);
        setError("Unable to load stores from the server. Showing sample data.");
        // graceful fallback so the UI remains useful during early development
        setStores([
          {
            _id: "sample-1",
            businessName: "Sample Store A",
            address: "123 Main St",
            verificationStatus: "verified",
          },
          {
            _id: "sample-2",
            businessName: "Sample Store B",
            address: "456 Market Rd",
            verificationStatus: "pending",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

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
                {stores.map((s) => (
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
                          {s.address || "No address provided"}
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
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DealerHome;
