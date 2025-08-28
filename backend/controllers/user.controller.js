import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  const { username, email, password, role, address, phone } = req.body;
  console.log('Registering user:', req.body);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role,address,phone });
  const newUser = await User.create(user);
  if (!newUser) {
    return res.status(400).json({ message: 'Failed to register user' });
  }
  res.status(201).json(newUser);
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
