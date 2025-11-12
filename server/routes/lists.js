import { Router } from 'express';
import List from '../models/List.js';  // ✅ Only import List
import auth from '../middleware/auth.js';

const router = Router();

// Get all lists
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId }).sort({ createdAt: -1 });  // ✅
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create list
router.post('/', auth, async (req, res) => {
  try {
    const { title, items } = req.body;
    const list = new List({
      userId: req.userId,
      title,
      items: items || []
    });
    await list.save();
    res.status(201).json({ message: 'List created successfully', list });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update list
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, items } = req.body;
    const list = await List.findOneAndUpdate(  // ✅
      { _id: req.params.id, userId: req.userId },
      { title, items },
      { new: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({ message: 'List updated successfully', list });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({  // ✅
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;