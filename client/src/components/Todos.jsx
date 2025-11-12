import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

const Todos = ({ onUpdate }) => {
  const [todos, setTodos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({ task: '', completed: false });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to fetch todos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await api.put(`/todos/${editingTodo._id}`, formData);
        toast.success('Todo updated successfully');
      } else {
        await api.post('/todos', formData);
        toast.success('Todo created successfully');
      }
      setFormData({ task: '', completed: false });
      setShowForm(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({ task: todo.task, completed: todo.completed });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    try {
      await api.delete(`/todos/${id}`);
      toast.success('Todo deleted successfully');
      fetchTodos();
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await api.put(`/todos/${todo._id}`, {
        task: todo.task,
        completed: !todo.completed,
      });
      fetchTodos();
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTodo(null);
    setFormData({ task: '', completed: false });
  };

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Todos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Todo'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {editingTodo ? 'Edit Todo' : 'Create New Todo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task
              </label>
              <input
                type="text"
                value={formData.task}
                onChange={(e) =>
                  setFormData({ ...formData, task: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) =>
                  setFormData({ ...formData, completed: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="completed" className="ml-2 text-sm text-gray-700">
                Mark as completed
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                {editingTodo ? 'Update Todo' : 'Create Todo'}
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

      {/* Todos List */}
      <div className="space-y-6">
        {/* Pending Todos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Pending ({pendingTodos.length})
          </h3>
          <div className="space-y-2">
            {pendingTodos.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No pending todos</p>
            ) : (
              pendingTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-gray-800">{todo.task}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Todos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Completed ({completedTodos.length})
          </h3>
          <div className="space-y-2">
            {completedTodos.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No completed todos</p>
            ) : (
              completedTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-gray-500 line-through">{todo.task}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todos;