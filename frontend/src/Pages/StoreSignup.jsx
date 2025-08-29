import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const StoreSignup = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    open: '09:00',
    close: '18:00',
    daysOpen: [],
  })
  const [logo, setLogo] = useState(null)
  const [banner, setBanner] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleDay = (d) => {
    setForm(prev => {
      const next = prev.daysOpen.includes(d) ? prev.daysOpen.filter(x => x !== d) : [...prev.daysOpen, d]
      return { ...prev, daysOpen: next }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Store name is required'
    if (!form.street.trim()) e.street = 'Street is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.phone.trim()) e.phone = 'Contact phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)
    if (!validate()) return
    setLoading(true)

    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const url = `${base}/api/dealer/stores`

      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)

      const address = {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      }
      fd.append('address', JSON.stringify(address))

      const contactInfo = { phone: form.phone, email: form.email, website: form.website }
      fd.append('contactInfo', JSON.stringify(contactInfo))

      const operatingHours = { open: form.open, close: form.close, daysOpen: form.daysOpen }
      fd.append('operatingHours', JSON.stringify(operatingHours))

      if (logo) fd.append('logo', logo)
      if (banner) fd.append('banner', banner)

      // Assumption: backend will associate store with authenticated dealer (via session/JWT). If API needs dealerId here, adjust accordingly.

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: fd
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Status ${res.status}`)
      }

      // success
      navigate('/dealer-dashboard')
    } catch (err) {
      console.error('store signup error', err)
      setGeneralError(err.message || 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Register a Store</h2>
        <p className="text-sm text-gray-600 mb-6">Create a store under your dealer account. The store will be reviewed by admin.</p>

        {generalError && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{generalError}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <input name="street" value={form.street} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input name="state" value={form.state} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP</label>
              <input name="zipCode" value={form.zipCode} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input name="country" value={form.country} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact email</label>
              <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
            <input name="website" value={form.website} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Open</label>
              <input name="open" type="time" value={form.open} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Close</label>
              <input name="close" type="time" value={form.close} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Days open</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {days.map(d => (
                <label key={d} className={`inline-flex items-center px-2 py-1 border rounded ${form.daysOpen.includes(d) ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                  <input type="checkbox" checked={form.daysOpen.includes(d)} onChange={() => toggleDay(d)} className="mr-2" />
                  <span className="text-sm">{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Banner (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} className="mt-1" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StoreSignup
