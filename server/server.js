import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';  
import listsRoutes from './routes/lists.js';  
import todosRoutes from './routes/todos.js';  

dotenv.config();

const app = express();

// CORS
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);  
app.use('/lists', listsRoutes);  
app.use('/todos', todosRoutes);  

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running', 
    status: 'healthy',
    routes: ['/auth/login', '/auth/register', '/notes', '/lists', '/todos']
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    env: {
      hasJWT: !!process.env.JWT_SECRET,
      hasMongoDB: !!process.env.MONGODB_URI
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    availableRoutes: ['/auth/login', '/auth/register', '/notes', '/lists', '/todos']
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;