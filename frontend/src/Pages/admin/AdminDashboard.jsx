import React, { useState } from "react";
import Dealers from "./Dealers";
import Stores from "./Stores";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dealers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Review and manage dealers and stores.</p>
          </div>
        </header>

        <div className="bg-white p-4 rounded-md shadow-sm">
          <nav className="mb-4">
            <button
              onClick={() => setActiveTab("dealers")}
              className={`px-4 py-2 mr-2 rounded ${
                activeTab === "dealers" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Dealers
            </button>
            <button
              onClick={() => setActiveTab("stores")}
              className={`px-4 py-2 rounded ${
                activeTab === "stores" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Stores
            </button>
          </nav>

          {loading ? (
            <div className="py-8 text-center text-gray-500 flex items-center justify-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-6 w-6 text-gray-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading admin data...
              </div>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">{error}</div>}

              {activeTab === "dealers" && (
                <div>
                  <Dealers />
                </div>
              )}

              {activeTab === "stores" && (
                <div>
                  <Stores />
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
