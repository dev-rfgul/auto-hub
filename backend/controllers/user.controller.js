import User from '../models/user.model.js';

export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }
  if (role !== 'dealer' && role !== 'customer') {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  if (await User.findOne({ username })) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role });
  await user.save();
  res.status(201).json(user);
};
export const loginUser = async (req, res) => {
  //add validation for the request body
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};
