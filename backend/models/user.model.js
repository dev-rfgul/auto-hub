const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    role: { type: String, enum: ['user', 'dealer', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
  });

  const User = mongoose.model('User', userSchema);
  module.exports = User;