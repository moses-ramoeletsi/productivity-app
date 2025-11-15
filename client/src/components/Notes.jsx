import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, X } from 'lucide-react';
import api from '../utils/api.js';

const Notes = ({ onUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '',
    steps: []
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to fetch notes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, formData);
        toast.success('Note updated successfully');
      } else {
        await api.post('/notes', formData);
        toast.success('Note created successfully');
      }
      setFormData({ title: '', content: '', steps: [] });
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({ 
      title: note.title, 
      content: note.content,
      steps: note.steps || []
    });
    setShowForm(true);
  };

  const openDeleteDialog = (note) => {
    setNoteToDelete(note);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setNoteToDelete(null);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await api.delete(`/notes/${noteToDelete._id}`);
      toast.success('Note deleted successfully');
      closeDeleteDialog();
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', steps: [] });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, '']
    });
  };

  const updateStep = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Notes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Note</h3>
              </div>
              <button
                onClick={closeDeleteDialog}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              {noteToDelete && (
                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-1">
                    {noteToDelete.title}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {noteToDelete.content}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteDialog}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Steps Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Steps (Optional)
                </label>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  + Add Step
                </button>
              </div>
              
              {formData.steps.length > 0 && (
                <div className="space-y-2">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="px-2 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium min-w-8 text-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {editingNote ? 'Update Note' : 'Create Note'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            No notes yet. Create your first note!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {note.content}
              </p>
              
              {/* Display Steps */}
              {note.steps && note.steps.length > 0 && (
                <div className="mb-3 bg-blue-50 rounded-md p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Steps:</p>
                  <ol className="space-y-1">
                    {note.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-semibold text-blue-600">{index + 1}.</span>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mb-3">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteDialog(note)}
                  className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Notes;