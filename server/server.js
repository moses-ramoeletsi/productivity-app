import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import listRoutes from './routes/lists.js';
import todoRoutes from './routes/todos.js';
import whishlistRoutes from './routes/wishlists.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/wishlists', whishlistRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Productivity API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});