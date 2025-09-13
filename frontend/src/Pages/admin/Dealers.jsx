import React, { useEffect, useState } from "react";

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_BACKEND_URL || "";

  const fetchDealers = async () => {
    try {
      const res = await fetch(`${base}/api/admin/getAllDealers`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dealers");
      const data = await res.json();
      setDealers(data.dealers || data || []);
    } catch (err) {
      console.warn("fetchDealers error", err);
      setError("Could not load dealers. Showing sample data.");
      setDealers([
        {
          _id: "d1",
          username: "dealer1",
          email: "deal1@example.com",
          phone: "123",
          isVerified: false,
        },
        {
          _id: "d2",
          username: "dealer2",
          email: "deal2@example.com",
          phone: "456",
          isVerified: true,
        },
      ]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchDealers();
      setLoading(false);
    };
    load();
  }, []);

  const dealersVerified = dealers.filter(
    (d) => d.dealer?.verificationStatus === "verified" || d.isVerified === true
  );
  const dealersPending = dealers.filter(
    (d) =>
      (d.dealer?.verificationStatus === "pending" ||
        d.dealer?.verificationStatus === undefined) &&
      d.isVerified !== true
  );
  const dealersRejected = dealers.filter((d) => d.dealer?.verificationStatus === "rejected");

  const performAction = async ({ action, id }) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch(`${base}/api/admin/verify-dealer/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchDealers();
    } catch (err) {
      console.error('dealer action error', err);
      setError('Action failed; try again');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Loading dealers...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">{error}</div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Pending Dealers</h2>
        {dealersPending.length === 0 ? (
          <div className="text-sm text-gray-500">No pending dealers</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {dealersPending.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium text-gray-900">{d.dealer?.name || d.email}</div>
                  <div className="text-sm text-gray-600">{d.email}</div>
                  <div className="text-sm text-gray-600">{d.dealer?.cnic}</div>
                  <div className="text-sm text-gray-600">{d.phone}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={actionLoading === d._id}
                    onClick={() => performAction({ action: 'verified', id: d._id })}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    {actionLoading === d._id ? '...' : 'Verify'}
                  </button>
                  <button
                    disabled={actionLoading === d._id}
                    onClick={() => performAction({ action: 'rejected', id: d._id })}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    {actionLoading === d._id ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Verified Dealers</h2>
        {dealersVerified.length === 0 ? (
          <div className="text-sm text-gray-500">No verified dealers</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {dealersVerified.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium text-gray-900">{d.dealer?.name || d.email}</div>
                  <div className="text-sm text-gray-600">{d.email}</div>
                  <div className="text-sm text-gray-600">{d.dealer?.cnic}</div>
                  <div className="text-sm text-gray-600">{d.phone}</div>
                </div>
                <div className="text-sm px-2 py-1 rounded text-white" style={{ background: '#10b981' }}>Verified</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {dealersRejected.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Rejected Dealers</h2>
          <div className="grid grid-cols-1 gap-4">
            {dealersRejected.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium text-gray-900">{d.dealer?.name || d.email}</div>
                  <div className="text-sm text-gray-600">{d.email}</div>
                </div>
                <div className="text-sm px-2 py-1 rounded text-white" style={{ background: '#ef4444' }}>Rejected</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dealers;
