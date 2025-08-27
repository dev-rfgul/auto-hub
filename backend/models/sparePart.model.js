import mongoose from 'mongoose';
const sparePartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    partNumber: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    description: String,
    specifications: {
      dimensions: String,
      weight: String,
      material: String,
      compatibility: [String], // vehicle models
      warranty: String
    },
    images: [String],
    price: { type: Number, required: true },
    originalPrice: Number,
    stockQuantity: { type: Number, required: true, min: 0 },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
    approvalStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: Date,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const SparePart = mongoose.model('SparePart', sparePartSchema);
  export default SparePart;