import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body);
    
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ name, email, password });
    await user.save();
    console.log('✅ User created:', user.email);
    
    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('👤 User found:', user.email);
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password matched');
    
    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;