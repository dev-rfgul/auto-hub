import React, { useEffect, useState } from 'react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dealers')
  const [dealers, setDealers] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND_URL || ''

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [dRes, sRes] = await Promise.all([
          fetch(`${base}/api/admin/dealers`, { credentials: 'include' }),
          fetch(`${base}/api/admin/stores`, { credentials: 'include' })
        ])

        if (!dRes.ok || !sRes.ok) throw new Error('Failed to fetch')

        const dData = await dRes.json()
        const sData = await sRes.json()

        setDealers(dData.dealers || dData || [])
        setStores(sData.stores || sData || [])
      } catch (err) {
        console.warn('admin fetch error', err)
        setError('Could not load admin data — showing sample data')
        setDealers([
          { _id: 'd1', username: 'dealer1', email: 'deal1@example.com', phone: '123', isVerified: false },
          { _id: 'd2', username: 'dealer2', email: 'deal2@example.com', phone: '456', isVerified: true }
        ])
        setStores([
          { _id: 's1', businessName: 'Store One', address: '123 Road', verificationStatus: 'pending', dealerId: 'd1' },
          { _id: 's2', businessName: 'Store Two', address: '456 Ave', verificationStatus: 'verified', dealerId: 'd2' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const performAction = async ({ type, resource, id, value }) => {
    // type: approve|reject, resource: dealers|stores
    const base = import.meta.env.VITE_BACKEND_URL || ''
    setActionLoading(id)
    setError(null)
    try {
      const endpoint = `${base}/api/admin/${resource}/${id}/${type}`
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error(`Status ${res.status}`)

      // optimistic update in UI
      if (resource === 'dealers') {
        setDealers((prev) => prev.map((d) => (d._id === id ? { ...d, isVerified: type === 'approve' } : d)))
      } else {
        setStores((prev) => prev.map((s) => (s._id === id ? { ...s, verificationStatus: type === 'approve' ? 'verified' : 'rejected' } : s)))
      }
    } catch (err) {
      console.error('admin action error', err)
      setError('Action failed; try again')
    } finally {
      setActionLoading(null)
    }
  }

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
            <button onClick={() => setActiveTab('dealers')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'dealers' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              Dealers
            </button>
            <button onClick={() => setActiveTab('stores')} className={`px-4 py-2 rounded ${activeTab === 'stores' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              Stores
            </button>
          </nav>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {error && <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 p-3 rounded">{error}</div>}

              {activeTab === 'dealers' && (
                <div className="grid grid-cols-1 gap-4">
                  {dealers.map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium text-gray-900">{d.username || d.email}</div>
                        <div className="text-sm text-gray-600">{d.email}</div>
                        <div className="text-sm text-gray-500">{d.phone || '—'}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm px-2 py-1 rounded text-white" style={{ background: d.isVerified ? '#10b981' : '#f59e0b' }}>
                          {d.isVerified ? 'Verified' : 'Unverified'}
                        </div>

                        {!d.isVerified && (
                          <>
                            <button disabled={actionLoading === d._id} onClick={() => performAction({ type: 'approve', resource: 'dealers', id: d._id })} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                              Approve
                            </button>
                            <button disabled={actionLoading === d._id} onClick={() => performAction({ type: 'reject', resource: 'dealers', id: d._id })} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'stores' && (
                <div className="grid grid-cols-1 gap-4">
                  {stores.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium text-gray-900">{s.businessName || s.name}</div>
                        <div className="text-sm text-gray-600">{s.address || '—'}</div>
                        <div className="text-sm text-gray-500">Dealer: {s.dealerId || '—'}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm px-2 py-1 rounded text-white" style={{ background: s.verificationStatus === 'verified' ? '#10b981' : s.verificationStatus === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                          {s.verificationStatus || 'pending'}
                        </div>

                        {s.verificationStatus !== 'verified' && (
                          <>
                            <button disabled={actionLoading === s._id} onClick={() => performAction({ type: 'approve', resource: 'stores', id: s._id })} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                              Approve
                            </button>
                            <button disabled={actionLoading === s._id} onClick={() => performAction({ type: 'reject', resource: 'stores', id: s._id })} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
