import React, { useEffect, useState } from "react";
import axios from "axios";
import Dealers from './Dealers'
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dealers");
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_BACKEND_URL || "";

  // helpers to format nested store fields
  const formatAddress = (addr) => {
    if (!addr) return "";
    // backend returns { street, city, state, zipCode, country }
    const parts = [];
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.zipCode) parts.push(addr.zipCode);
    if (addr.country) parts.push(addr.country);
    return parts.join(", ");
  };

  const formatContact = (c) => {
    if (!c) return "";
    const parts = [];
    if (c.phone) parts.push(`Phone: ${c.phone}`);
    if (c.email) parts.push(`Email: ${c.email}`);
    if (c.website) parts.push(`Website: ${c.website}`);
    return parts.join(" • ");
  };

  const formatHours = (h) => {
    if (!h) return "";
    const open = h.open || h.opening || "";
    const close = h.close || h.closing || "";
    const days = Array.isArray(h.daysOpen) ? h.daysOpen.join(", ") : "";
    const parts = [];
    if (days) parts.push(`Days: ${days}`);
    if (open || close) parts.push(`Hours: ${open} - ${close}`);
    return parts.join(" • ");
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${base}/api/admin/getAllStores`, {
        withCredentials: true,
      });
      if (res.status !== 200) throw new Error("Failed to fetch stores");
      const data = res.data;
      setStores(data.stores || data || []);
    } catch (err) {
      console.warn("fetchStores error", err);
      setError("Could not load stores. Showing sample data.");
      setStores([
        {
          _id: "s1",
          businessName: "Store One",
          address: "123 Road",
          verificationStatus: "pending",
          dealerId: "d1",
        },
        {
          _id: "s2",
          businessName: "Store Two",
          address: "456 Ave",
          verificationStatus: "verified",
          dealerId: "d2",
        },
      ]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
  await fetchStores();
      setLoading(false);
    };
    load();
  }, []);

  // helpers to categorize (dealer fields are nested under d.dealer)
  // Removed dealer-related filtering logic

  // backend returns `approvalStatus` for stores (pending|approved|rejected)
  const storesVerified = stores.filter((s) => s.approvalStatus === "approved");
  const storesPending = stores.filter(
    (s) => s.approvalStatus === "pending" || !s.approvalStatus
  );
  const storesRejected = stores.filter((s) => s.approvalStatus === "rejected");

  const performAction = async ({ action, resource, id }) => {
    setActionLoading(id);
    setError(null);
    try {
      const res=await axios.post(`${base}/api/admin/verify-${resource}/${id}/${action}`,{},{withCredentials: true})
      console.log(res)
      // refetch the affected list so front-end stays in sync
  if (resource.includes("store")) await fetchStores();
    } catch (err) {
      console.error("admin action error", err);
      setError("Action failed; try again");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and manage dealers and stores.
            </p>
          </div>
        </header>

        <div className="bg-white p-4 rounded-md shadow-sm">
          <nav className="mb-4">
            <button
              onClick={() => setActiveTab("dealers")}
              className={`px-4 py-2 mr-2 rounded ${
                activeTab === "dealers"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Dealers
            </button>
            <button
              onClick={() => setActiveTab("stores")}
              className={`px-4 py-2 rounded ${
                activeTab === "stores"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Stores
            </button>
          </nav>

          {loading ? (
            <div className="py-8 text-center text-gray-500 flex items-center justify-center">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin h-6 w-6 text-gray-600 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Loading admin data...
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">
                  {error}
                </div>
              )}

              {activeTab === "dealers" && (
                <div>
                  <Dealers />
                </div>
              )}

              {activeTab === "stores" && (
                <div className="space-y-6">
                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                      Pending Stores
                    </h2>
                    {storesPending.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No pending stores
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {storesPending.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between p-4 border rounded"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {s.businessName || s.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatAddress(s.address) || "—"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatContact(s.contactInfo)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatHours(s.operatingHours)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                disabled={actionLoading === s._id}
                                onClick={() =>
                                  performAction({
                                    action: "approved",
                                    resource: "store",
                                    id: s._id,
                                  })
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                              >
                                {actionLoading === s._id ? "..." : "Approve"}
                              </button>
                              <button
                                disabled={actionLoading === s._id}
                                onClick={() =>
                                  performAction({
                                    action: "rejected",
                                    resource: "store",
                                    id: s._id,
                                  })
                                }
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                              >
                                {actionLoading === s._id ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                      Verified Stores
                    </h2>
                    {storesVerified.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No verified stores
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {storesVerified.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between p-4 border rounded"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {s.businessName || s.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatAddress(s.address) || "—"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatContact(s.contactInfo)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatHours(s.operatingHours)}
                              </div>
                            </div>
                            <div
                              className="text-sm px-2 py-1 rounded text-white"
                              style={{ background: "#10b981" }}
                            >
                              Approved
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {storesRejected.length > 0 && (
                    <section>
                      <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Rejected Stores
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {storesRejected.map((s) => (
                          <div
                            key={s._id}
                            className="flex items-center justify-between p-4 border rounded"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {s.businessName || s.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatAddress(s.address) || "—"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatContact(s.contactInfo)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatHours(s.operatingHours)}
                              </div>
                            </div>
                            <div
                              className="text-sm px-2 py-1 rounded text-white"
                              style={{ background: "#ef4444" }}
                            >
                              Rejected
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
