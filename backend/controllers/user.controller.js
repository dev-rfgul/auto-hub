import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, address, phone, dealer, admin } = req.body || {};

    // basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    console.log('Registering user:', req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = { username, email, password: hashedPassword, role, address, phone };

    // Add dealer-specific fields if role is dealer
    if (role === 'dealer' && dealer) {
      userObj.dealer = dealer; // dealer should be an object with dealer fields
    }

    // Add admin-specific fields if role is admin
    if (role === 'admin' && admin) {
      userObj.admin = admin; // admin should be an object with admin fields
    }

    const newUser = await User.create(userObj);
    if (!newUser) {
      return res.status(400).json({ message: 'Failed to register user' });
    }

    // Return user without password
    const userSafe = newUser.toObject();
    delete userSafe.password;

    // Set cookies to send to frontend (stringified JSON so frontend can parse)
    const cookieOptions = {
      // httpOnly: true, // consider enabling for security and using a /me endpoint instead of reading cookies in client JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // set cookie with JSON string so client-side parsing works
    res.cookie('user', JSON.stringify(userSafe), cookieOptions);

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
      // httpOnly: true, // enable this for improved security and use a /me endpoint to fetch user in client
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

export const getUser=async(req,res)=>{
  try {
    const userId = req.params.id;
    console.log('Fetching user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error('getUser error', err);
    return res.status(500).json({ message: 'Error fetching user', error: err.message || err });
  }
}

export const getMe = async (req, res) => {
  try {
    // cookie 'user' set as JSON string by login/register
    const raw = req.cookies && req.cookies.user;
    if (!raw) return res.status(401).json({ message: 'Not authenticated' });
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // if cookie is not JSON, return it raw
      parsed = raw;
    }
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('getMe error', err);
    return res.status(500).json({ message: 'Error fetching current user', error: err.message || err });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear the cookie by setting it to empty and expiring immediately.
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 0,
    };
    res.cookie('user', '', cookieOptions);
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('logoutUser error', err);
    return res.status(500).json({ message: 'Logout failed', error: err.message || err });
  }
};