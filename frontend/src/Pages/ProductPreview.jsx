import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';


const PlaceholderImages = ({ images = [], onThumbnailClick = () => {} }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded">
        <div className="text-gray-400">No images</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {images.slice(0, 4).map((src, i) => (
        <button key={i} type="button" onClick={() => onThumbnailClick(src)} className="overflow-hidden rounded">
          <img src={src} alt={`img-${i}`} className="h-24 w-full object-cover rounded cursor-pointer hover:opacity-90" />
        </button>
      ))}
    </div>
  );
};

const SpecRow = ({ name, value }) => (
  <div className="flex justify-between py-2 border-b">
    <div className="text-sm text-gray-600">{name}</div>
    <div className="text-sm text-gray-800">{value ?? '-'}</div>
  </div>
);

const ProductPreview = ({ product: initialProduct = null }) => {
  const { id } = useParams();
  console.log(id)
  const [product, setProduct] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState((initialProduct && initialProduct.images && initialProduct.images[0]) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (product || !id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await axios.get(`${base}/api/spareParts/getSparePartById/${id}`);
        setProduct(res.data);
          if (res.data && res.data.images && res.data.images.length > 0) {
            setSelectedImage(res.data.images[0]);
          }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, product]);

  // fallback demo product when nothing provided (useful for UI development)
  const demo = {
    name: 'Generic Brake Pad Set',
    partNumber: 'BP-12345',
    brand: 'AutoPro',
    category: 'Brakes',
    subcategory: 'Pads',
    description:
      'High-performance brake pads engineered for longevity and low dust. Fits many sedan and hatch models.',
    specifications: {
      dimensions: '120 x 50 x 20 mm',
      weight: '0.8 kg',
      material: 'Ceramic composite',
      compatibility: ['Model A 2010-2015', 'Model B 2012-2019'],
      warranty: '1 year',
    },
    images: ['/vite.svg'],
    price: 49.99,
    originalPrice: 69.99,
    stockQuantity: 24,
    rating: 4.6,
    reviewCount: 12,
    storeId: null,
  };

  const p = product || demo;
  useEffect(() => {
    if (!selectedImage && p && p.images && p.images.length > 0) {
      setSelectedImage(p.images[0]);
    }
  }, [p, selectedImage]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded shadow p-4 md:flex md:space-x-6">
        {/* left column: images */}
        <div className="md:w-1/2">
          <div className="rounded overflow-hidden">
            <button type="button" onClick={() => setShowModal(true)} className="w-full block">
              <img src={selectedImage || (p.images && p.images[0]) || '/vite.svg'} alt={p.name} className="w-full h-64 object-cover rounded" />
            </button>
          </div>

          <div className="mt-3">
            <PlaceholderImages images={p.images} onThumbnailClick={(src) => setSelectedImage(src)} />
          </div>
        </div>

        {/* right column: details */}
        <div className="md:w-1/2 mt-4 md:mt-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold">{p.name}</h1>
              <div className="text-sm text-gray-500 mt-1">Part No: {p.partNumber}</div>
              <div className="mt-2 flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-700">{p.brand}</div>
                <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">{p.category}</div>
                {p.subcategory && <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{p.subcategory}</div>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${p.price?.toFixed(2)}</div>
              {p.originalPrice && <div className="text-sm text-gray-500 line-through">${p.originalPrice.toFixed(2)}</div>}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-yellow-500">{Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(p.rating || 0) ? '★' : '☆'}</span>
              ))}</div>
              <div className="text-sm text-gray-600">{p.rating ?? '—'} ({p.reviewCount ?? 0} reviews)</div>
            </div>

            <p className="mt-3 text-sm text-gray-700">{p.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Availability</div>
                <div className={`text-sm font-medium ${p.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Warranty</div>
                <div className="text-sm font-medium text-gray-800">{p.specifications?.warranty || '—'}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded">Add to Cart</button>
              <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded">View Details</button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Specifications</h3>
              <div className="bg-white border rounded">
                <SpecRow name="Dimensions" value={p.specifications?.dimensions} />
                <SpecRow name="Weight" value={p.specifications?.weight} />
                <SpecRow name="Material" value={p.specifications?.material} />
                <SpecRow name="Warranty" value={p.specifications?.warranty} />
                <div className="py-2 px-3 border-b">
                  <div className="text-sm text-gray-600">Compatibility</div>
                  <div className="text-sm text-gray-800 mt-1">
                    {Array.isArray(p.specifications?.compatibility) && p.specifications.compatibility.length > 0
                      ? p.specifications.compatibility.join(', ')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <div>Sold by: <Link to={`/store/${p.storeId}`} className="text-blue-600 hover:underline">Store</Link></div>
            </div>
          </div>
        </div>
      </div>

      {/* Image modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowModal(false)}>
          <div className="relative max-w-3xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-white bg-black bg-opacity-30 rounded-full p-1" onClick={() => setShowModal(false)}>✕</button>
            <img src={selectedImage || (p.images && p.images[0]) || '/vite.svg'} alt={p.name} className="max-w-full max-h-[80vh] rounded" />
            {p.images && p.images.length > 1 && (
              <div className="mt-3 grid grid-cols-6 gap-2">
                {p.images.map((src, i) => (
                  <button key={i} type="button" onClick={() => setSelectedImage(src)} className="overflow-hidden rounded">
                    <img src={src} alt={`modal-thumb-${i}`} className="h-16 w-full object-cover rounded cursor-pointer" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

        {/* small footer note */}
        <div className="mt-4 text-xs text-gray-500">Preview UI based on DESIGN_INSTRUCTIONS.md • Mobile-first responsive</div>
    </div>
  );
};

export default ProductPreview;
