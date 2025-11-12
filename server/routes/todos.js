import { Router } from 'express';
import Todo from '../models/Todo.js';  // ✅ Only import Todo
import auth from '../middleware/auth.js';

const router = Router();

// Get all todos
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });  // ✅
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create todo
router.post('/', auth, async (req, res) => {
  try {
    const { task, completed } = req.body;
    const todo = new Todo({
      userId: req.userId,
      task,
      completed: completed || false
    });
    await todo.save();
    res.status(201).json({ message: 'Todo created successfully', todo });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update todo
router.put('/:id', auth, async (req, res) => {
  try {
    const { task, completed } = req.body;
    const todo = await Todo.findOneAndUpdate(  // ✅
      { _id: req.params.id, userId: req.userId },
      { task, completed },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json({ message: 'Todo updated successfully', todo });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({  // ✅
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;