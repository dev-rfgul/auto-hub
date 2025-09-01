import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, address, phone } = req.body || {};

    // basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    console.log('Registering user:', req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = { username, email, password: hashedPassword, role, address, phone };

    const newUser = await User.create(userObj);
    if (!newUser) {
      return res.status(400).json({ message: 'Failed to register user' });
    }

    // Set cookies to send to frontend
    const cookieOptions = {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // httpOnly cookie with user id (for server-side auth)
    res.cookie('user', newUser.toString(), cookieOptions);



    // Return user without password
    const userSafe = newUser.toObject();
    delete userSafe.password;

    return res.status(201).json(userSafe);
  } catch (err) {
    console.error('registerUser error', err);
    return res.status(500).json({ message: 'Error registering user', error: err.message || err });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // add validation for the request body
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // on successful login, set same cookies as registration
    const cookieOptions = {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    };

    const userSafe = user.toObject();
    delete userSafe.password;
    res.cookie('user', JSON.stringify(userSafe), cookieOptions);

    return res.status(200).json(userSafe);
  } catch (err) {
    console.error('loginUser error', err);
    return res.status(500).json({ message: 'Login error', error: err.message || err });
  }
};
