import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const ProductUpload = () => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const navigate = useNavigate();
  
  // Check if we're in edit mode
  const { id: storeId, productId } = useParams(); // /product-upload/:id/:productId for edit
  const location = useLocation();
  const isEditMode = Boolean(productId);
  
  console.log('storeIdFromPath:', storeId, 'productId:', productId, 'isEditMode:', isEditMode);

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
    storeId: storeId,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // For edit mode
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && productId) {
      fetchProductData();
    }
  }, [isEditMode, productId]);

  const fetchProductData = async () => {
    setLoadingProduct(true);
    try {
      const res = await axios.get(`${base}/api/product/spare-part/${productId}`, {
        withCredentials: true
      });
      const product = res.data;
      
      setForm({
        name: product.name || '',
        partNumber: product.partNumber || '',
        brand: product.brand || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        description: product.description || '',
        specifications: {
          dimensions: product.specifications?.dimensions || '',
          weight: product.specifications?.weight || '',
          material: product.specifications?.material || '',
          compatibility: product.specifications?.compatibility || [''],
          warranty: product.specifications?.warranty || '',
        },
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stockQuantity: product.stockQuantity || '',
        storeId: product.storeId?._id || storeId,
      });
      
      // Set existing images
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product data');
    } finally {
      setLoadingProduct(false);
    }
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('spec_')) {
      const key = name.replace('spec_', '');
      setForm((p) => ({ ...p, specifications: { ...p.specifications, [key]: value } }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
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
    if (!form.name || !form.partNumber || !form.brand || !form.category) {
      setError('Please fill required fields: name, part number, brand, category');
      return false;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Please provide a valid price');
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

      // specifications: send as JSON string
      data.append('specifications', JSON.stringify(form.specifications || {}));

      // images - only add if new images are selected
      if (images.length > 0) {
        images.forEach((file, idx) => {
          data.append('images', file);
        });
      }
      
      // include storeId from path or form
      data.append('storeId', storeId || form.storeId || '');

      // Choose endpoint based on mode
      const endpoint = isEditMode 
        ? `${base}/api/product/edit-spare-part/${productId}`
        : `${base}/api/product/add-spare-part`;
      
      const method = isEditMode ? 'put' : 'post';

      console.log('Submitting to:', endpoint, 'Method:', method);
      console.log('FormData entries:', [...data.entries()].map(([k, v]) => [k, v instanceof File ? v.name : v]));

      const res = await axios[method](endpoint, data, { withCredentials: true });

      setSuccess(res.data?.message || `Product ${isEditMode ? 'updated' : 'uploaded'} successfully`);
      
      if (!isEditMode) {
        // Reset form only for create mode
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
          storeId: storeId || '',
        });
        setImages([]);
        setImagePreviews([]);
        setExistingImages([]);
      } else {
        // In edit mode, refresh the product data to show updated info
        setTimeout(() => fetchProductData(), 1000);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || `${isEditMode ? 'Update' : 'Upload'} failed`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !productId) return;
    
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${base}/api/product/delete-spare-part/${productId}`, {
        withCredentials: true
      });
      
      setSuccess('Product deleted successfully');
      // Navigate back to products list or store page
      setTimeout(() => {
        navigate(`/store/${storeId}`); // Adjust this route as needed
      }, 1500);
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err?.response?.data?.message || err.message || 'Delete failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingProduct) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isEditMode ? 'Edit Spare Part' : 'Upload Spare Part'}
        </h2>
        {isEditMode && (
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        )}
      </div>
      
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
          <label className="block text-sm font-medium mb-2">Images</label>
          
          {/* Show existing images in edit mode */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Images:</p>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`existing-${i}`} className="h-24 w-full object-cover rounded" />
                    <button 
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={onImagesChange} 
            className="mt-1" 
          />
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode ? 'Select new images to replace existing ones' : 'Select multiple images for your product'}
          </p>
          
          {/* Show new image previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">New Images Preview:</p>
              <div className="grid grid-cols-4 gap-2">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} className="h-24 w-full object-cover rounded" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex space-x-3">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Product' : 'Upload Product')}
            </button>
            
            {isEditMode && (
              <button 
                type="button"
                onClick={() => navigate(`/store/${storeId}`)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
          
          {isEditMode && (
            <p className="text-sm text-gray-500">
              Product ID: {productId}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductUpload;
