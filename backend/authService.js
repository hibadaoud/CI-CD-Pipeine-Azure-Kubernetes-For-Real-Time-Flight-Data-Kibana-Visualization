// authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

function validatePassword(password) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

async function registerUser(email, password) {
  const existingUser = await User.findOne({ email });
  if (existingUser) return { error: 'Email already exists' };

  if (!validatePassword(password)) {
    return { error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  return { message: 'User registered successfully' };
}

async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) return { error: 'Invalid email' };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return { error: 'Wrong password' };

  const token = jwt.sign({ email: user.email }, SECRET_KEY);
  return { token, message: 'Login successful ' };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Token is required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

module.exports = {
  validatePassword,
  registerUser,
  loginUser,
  authenticateToken
};
