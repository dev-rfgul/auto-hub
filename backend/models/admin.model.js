import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permissions: [{
      type: String,
      enum: ['verify_dealers', 'approve_stores', 'approve_parts', 'manage_users', 'view_analytics', 'manage_feedback']
    }],
    assignedRegions: [String],
    lastActivity: Date,
    createdAt: { type: Date, default: Date.now }
  });

  const Admin = mongoose.model('Admin', adminSchema);
  export default Admin;