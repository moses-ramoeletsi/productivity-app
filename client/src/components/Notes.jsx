import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

const Notes = ({ onUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted successfully');
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
                  onClick={() => handleDelete(note._id)}
                  className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;