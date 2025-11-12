import { Router } from 'express';
import Note from '../models/Note.js';  // ✅ Only import Note
import auth from '../middleware/auth.js';

const router = Router();

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });  // ✅ Use Note.find()
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create note
// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, steps } = req.body;
    const note = new Note({
      userId: req.userId,
      title,
      content,
      steps: steps || []
    });
    await note.save();
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, steps } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, steps: steps || [] },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note updated successfully', note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({  // ✅ Use Note.findOneAndDelete()
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;