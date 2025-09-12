import React from 'react'
import { Link } from 'react-router-dom'

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
};

const StoreBanner = ({ store, storeId }) => {
  if (!store) return null;

  const approval = store.approvalStatus || store.status || 'pending';

  return (
    <div>
      {store.banner ? (
        <div className="w-full h-40 rounded-lg overflow-hidden mb-6">
          <img src={store.banner} alt="banner" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center mb-6">
          <span className="text-gray-400">No banner</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-28 h-28 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {store.logo ? (
              <img src={store.logo} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">No logo</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">{store.businessName || store.name}</h1>
            <p className="text-sm text-gray-600 mt-2">{store.description}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-medium">{formatAddress(store.address) || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Contact</div>
                <div className="font-medium">{(store.contactInfo && (store.contactInfo.phone || store.contactInfo.email)) || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hours</div>
                <div className="font-medium">{store.operatingHours ? `${store.operatingHours.open || ''} - ${store.operatingHours.close || ''}` : '—'}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${approval === 'approved' || approval === 'verified' ? 'text-green-700 bg-green-50' : approval === 'rejected' ? 'text-red-700 bg-red-50' : 'text-yellow-800 bg-yellow-50'}`}>
                  {approval}
                </span>

                <span className="text-sm text-gray-500">Created: {new Date(store.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Link to={`/product-upload/${storeId}`} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Upload Product</Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreBanner