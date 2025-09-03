
import { Link } from 'react-router-dom';

const ProductCard = ({ p }) => (
  <div className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition">
    <Link to={`/product/${p._id || p.id}`} className="block">
      <div className="h-44 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={(p.images && p.images[0]) } alt={p.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-500">{p.brand}</div>
        <div className="mt-1 font-medium text-gray-900 truncate">{p.name}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600">${p.price?.toFixed(2)}</div>
          <div className="text-sm text-gray-500">{p.stockQuantity > 0 ? 'In stock' : 'Out'}</div>
        </div>
      </div>
    </Link>
  </div>
);

export default ProductCard; 