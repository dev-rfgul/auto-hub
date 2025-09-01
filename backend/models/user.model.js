import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    String,
  address: {
    street:   String,
    city:     String,
    state:    String,
    zipCode:  String,
    country:  String
  },
  role: { type: String, enum: ['user', 'dealer', 'admin'], default: 'user' },
  createdAt:  { type: Date, default: Date.now },
  lastLogin:  Date,

  // Dealer-specific fields
  dealer: {
    name:               String,
    cnic:               String,
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verificationDate:   Date,
    verifiedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin user
    stores:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    rating:             { type: Number, default: 0 },
    totalSales:         { type: Number, default: 0 }
  },

});

const User = mongoose.model('User', userSchema);
export default User;