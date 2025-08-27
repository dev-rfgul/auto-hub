import mongoose from 'mongoose';
const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    description: String,
    logo: String,
    banner: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String
    },
    operatingHours: {
      open: String,
      close: String,
      daysOpen: [String]
    },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    approvalStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: Date,
    createdAt: { type: Date, default: Date.now }
  });

  const Store = mongoose.model('Store', storeSchema);
  export default Store;