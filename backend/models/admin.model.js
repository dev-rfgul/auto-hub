import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastActivity: Date,
    createdAt: { type: Date, default: Date.now }
  });

  const Admin = mongoose.model('Admin', adminSchema);
  export default Admin;