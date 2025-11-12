import { Router } from 'express';
import Wishlist from '../models/Wishlist.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all wishlists
router.get('/', auth, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { title, items } = req.body;
    const wishlist = new Wishlist({
      userId: req.userId,
      title,
      items: items || []
    });
    await wishlist.save();
    res.status(201).json({ message: 'Wishlist created successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update wishlist
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, items } = req.body;
    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, items },
      { new: true }
    );
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    res.json({ message: 'Wishlist updated successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete wishlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    res.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;