import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StoreOrder from './StoreOrder';
import StoreProduct from './StoreProduct';
import StoreBanner from './StoreBanner';


const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
};

const StoreHome = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${base}/api/store/getStoreById/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setStore(data.store || data);
      } catch (err) {
        console.warn('Could not load store:', err);
        setError('Unable to load store.');
        setStore(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading store...</div>;

  if (!store) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Store</h2>
        <p className="text-red-600">{error || 'Store not found.'}</p>
      </div>
    );
  }

  const approval = store.approvalStatus || store.status || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
  {/* Banner */}
  <StoreBanner store={store} storeId={id} />


        {/* Orders (delegated) */}
        <div className="mt-12">
          <StoreOrder storeId={id} />
        </div>
        {/* Products (delegated) */}
        <div>
          <StoreProduct storeId={id} />
        </div>

      </div>
    </div>
  );
};

export default StoreHome;
