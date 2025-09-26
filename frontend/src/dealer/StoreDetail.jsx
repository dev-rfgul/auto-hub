import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// import ProductList from '../../components/ProductList';

import ProductList from '../components/ProductList';
const StoreDetail = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/api/store/getStoreById/${storeId}`, {
        withCredentials: true
      });
      
      // Handle different response formats
      const storeData = res.data.store || res.data;
      setStore(storeData);
      setError(null);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading store details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested store could not be found.'}</p>
            <Link 
              to="/dealer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const displayText = {
      approved: 'Approved',
      verified: 'Verified',
      pending: 'Pending',
      rejected: 'Rejected'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.pending}`}>
        {displayText[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Store Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dealer"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {store.businessName || store.name || 'Store Details'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Store ID: {store._id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(store.approvalStatus || 'pending')}
              <Link
                to={`/product-upload/${storeId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                  <dd className="text-sm text-gray-900">{store.businessName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">{formatAddress(store.address)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{store.phone || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{store.email || 'N/A'}</dd>
                </div>
                {store.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{store.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Store Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Stats</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {store.sparePartsId?.length || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Products</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {store.rating || '0.0'}
                  </div>
                  <div className="text-sm text-green-800">Rating</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-purple-800">Created</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <ProductList storeId={storeId} isAdmin={false} showStoreInfo={false} />
      </div>
    </div>
  );
};

export default StoreDetail;
