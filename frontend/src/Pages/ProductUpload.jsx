import React, { useState } from 'react';
import axios from 'axios';

// ProductUpload form for SparePart (frontend)
// Assumptions:
// - Backend POST endpoint: `${VITE_BACKEND_URL}/api/spareparts` accepts multipart/form-data
// - If your backend uses a different path, change `endpoint` variable accordingly.

const ProductUpload = () => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const endpoint = `${base}/api/product/add-spare-part`;

  const [form, setForm] = useState({
    name: '',
    partNumber: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    specifications: {
      dimensions: '',
      weight: '',
      material: '',
      compatibility: [''],
      warranty: '',
    },
    price: '',
    originalPrice: '',
    stockQuantity: '',
    storeId: '68b1303c643ac42101dff757',
    dealerId: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('spec_')) {
      const key = name.replace('spec_', '');
      setForm((p) => ({ ...p, specifications: { ...p.specifications, [key]: value } }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  // helper to read cookie by name
  const getCookie = (name) => {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  };

  const setCompatibilityAt = (index, value) => {
    setForm((p) => {
      const comp = Array.isArray(p.specifications.compatibility)
        ? [...p.specifications.compatibility]
        : [];
      comp[index] = value;
      return { ...p, specifications: { ...p.specifications, compatibility: comp } };
    });
  };

  const addCompatibility = () => {
    setForm((p) => ({ ...p, specifications: { ...p.specifications, compatibility: [...(p.specifications.compatibility || []), ''] } }));
  };

  const removeCompatibility = (index) => {
    setForm((p) => {
      const comp = [...(p.specifications.compatibility || [])];
      comp.splice(index, 1);
      return { ...p, specifications: { ...p.specifications, compatibility: comp } };
    });
  };

  const onImagesChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    // append new files to existing selection (file inputs replace by default)
    setImages((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const merged = [...existing];
      newFiles.forEach((f) => {
        const exists = merged.some(
          (m) => m.name === f.name && m.size === f.size && m.lastModified === f.lastModified
        );
        if (!exists) merged.push(f);
      });
      return merged;
    });

    setImagePreviews((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      return [...existing, ...newPreviews];
    });

    // clear the file input so the same file can be selected again if needed
    e.target.value = '';
  };

  const validate = () => {
    // prefer storeId from cookie (useful for later when store is selected in app)
    const storeIdFromCookie = getCookie('storeId');
    const storeIdToUse = storeIdFromCookie || form.storeId;

    if (!form.name || !form.partNumber || !form.brand || !form.category) {
      setError('Please fill required fields: name, part number, brand, category');
      return false;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Please provide a valid price');
      return false;
    }
    if (!storeIdToUse) {
      setError('storeId is required (set cookie "storeId" or enter it in the form)');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const data = new FormData();
      // primitive fields
      data.append('name', form.name);
      data.append('partNumber', form.partNumber);
      data.append('brand', form.brand);
      data.append('category', form.category);
      if (form.subcategory) data.append('subcategory', form.subcategory);
      if (form.description) data.append('description', form.description);
      if (form.price) data.append('price', String(form.price));
      if (form.originalPrice) data.append('originalPrice', String(form.originalPrice));
      if (form.stockQuantity) data.append('stockQuantity', String(form.stockQuantity));
  // Prefer storeId stored in cookie (cookie name: 'storeId'). If not present, fall back to the form input.
  const storeIdFromCookie = getCookie('storeId');
  const storeIdToSend = storeIdFromCookie || form.storeId;
  if (storeIdToSend) data.append('storeId', storeIdToSend);
      if (form.dealerId) data.append('dealerId', form.dealerId);

      // specifications: send as JSON string
      data.append('specifications', JSON.stringify(form.specifications || {}));

      // images
      images.forEach((file, idx) => {
        data.append('images', file);
      });
      // developer-friendly FormData inspection
      console.log('FormData entries:', [...data.entries()].map(([k, v]) => [k, v instanceof File ? v.name : v]));
      console.log('FormData images (file names):', data.getAll('images').map((f) => f.name));

      // Build a parsed object where repeated keys become arrays (images, etc.)
      const parsed = {};
      for (const [k, v] of data.entries()) {
        if (k === 'images') {
          parsed.images = parsed.images || [];
          parsed.images.push(v); // keep File objects; use v.name for filenames
          continue;
        }
        if (k === 'specifications') {
          try {
            parsed.specifications = JSON.parse(v);
          } catch (e) {
            parsed.specifications = v;
          }
          continue;
        }
        if (parsed[k] !== undefined) {
          // already exists -> ensure array
          if (!Array.isArray(parsed[k])) parsed[k] = [parsed[k]];
          parsed[k].push(v);
        } else {
          parsed[k] = v;
        }
      }

      // convert numeric fields
      if (parsed.price) parsed.price = Number(parsed.price);
      if (parsed.originalPrice) parsed.originalPrice = Number(parsed.originalPrice);
      if (parsed.stockQuantity) parsed.stockQuantity = Number(parsed.stockQuantity);

      // convenience: image file names
      if (parsed.images) parsed.imageNames = parsed.images.map((f) => f.name);

      console.log('Parsed payload object:', parsed);

      // send - DO NOT set Content-Type manually so browser/axios can add the multipart boundary
      const res = await axios.post(endpoint, data, { withCredentials: true });


      setSuccess(res.data?.message || 'Product uploaded');
      setForm({
        name: '',
        partNumber: '',
        brand: '',
        category: '',
        subcategory: '',
        description: '',
        specifications: { dimensions: '', weight: '', material: '', compatibility: [''], warranty: '' },
        price: '',
        originalPrice: '',
        stockQuantity: '',
        storeId: '',
        dealerId: '',
      });
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Upload failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Spare Part</h2>
      {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name *</label>
            <input name="name" value={form.name} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Part Number *</label>
            <input name="partNumber" value={form.partNumber} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Brand *</label>
            <input name="brand" value={form.brand} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Category *</label>
            <input name="category" value={form.category} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Subcategory</label>
            <input name="subcategory" value={form.subcategory} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Stock Quantity</label>
            <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} className="mt-1 block w-full border rounded p-2" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Price (required)</label>
            <input type="number" step="0.01" name="price" value={form.price} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Original Price</label>
            <input type="number" step="0.01" name="originalPrice" value={form.originalPrice} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Dimensions</label>
              <input name="spec_dimensions" value={form.specifications.dimensions} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm">Weight</label>
              <input name="spec_weight" value={form.specifications.weight} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm">Material</label>
              <input name="spec_material" value={form.specifications.material} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm">Warranty</label>
              <input name="spec_warranty" value={form.specifications.warranty} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium">Compatibility (vehicle models)</label>
            <div className="space-y-2">
              {Array.isArray(form.specifications.compatibility) && form.specifications.compatibility.map((c, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input value={c} onChange={(e) => setCompatibilityAt(idx, e.target.value)} className="flex-1 border rounded p-2" />
                  <button type="button" onClick={() => removeCompatibility(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addCompatibility} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Add compatibility</button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium">Images</label>
          <input type="file" accept="image/*" multiple onChange={onImagesChange} className="mt-1" />
          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt={`preview-${i}`} className="h-24 w-full object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">Endpoint: <code className="bg-gray-100 px-1 rounded">{endpoint}</code></div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
            {loading ? 'Uploading...' : 'Upload Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductUpload;
