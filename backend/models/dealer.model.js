import mongoose from 'mongoose';
const dealerSchema = new mongoose.Schema({
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    // businessLicense: { type: String, required: true },
    taxId: String,
    phone: String,
    address: {type:String,required:true},
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    verificationDate: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  });

  const Dealer = mongoose.model('Dealer', dealerSchema);
  export default Dealer;