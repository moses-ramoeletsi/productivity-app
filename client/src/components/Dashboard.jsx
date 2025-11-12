import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Notes from './Notes';
import Lists from './Lists';
import Todos from './Todos';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [counts, setCounts] = useState({ notes: 0, lists: 0, todos: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const [notesRes, listsRes, todosRes] = await Promise.all([
        api.get('/notes'),
        api.get('/lists'),
        api.get('/todos'),
      ]);
      setCounts({
        notes: notesRes.data.length,
        lists: listsRes.data.length,
        todos: todosRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Productivity Dashboard
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="text-3xl font-bold text-blue-600">{counts.notes}</p>
            <p className="text-sm text-gray-500 mt-1">
              You have {counts.notes} {counts.notes === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Lists</h3>
            <p className="text-3xl font-bold text-green-600">{counts.lists}</p>
            <p className="text-sm text-gray-500 mt-1">
              You have {counts.lists} {counts.lists === 1 ? 'list' : 'lists'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Todos</h3>
            <p className="text-3xl font-bold text-purple-600">{counts.todos}</p>
            <p className="text-sm text-gray-500 mt-1">
              You have {counts.todos} {counts.todos === 1 ? 'todo' : 'todos'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('lists')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'lists'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lists
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'todos'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todos
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'notes' && <Notes onUpdate={fetchCounts} />}
            {activeTab === 'lists' && <Lists onUpdate={fetchCounts} />}
            {activeTab === 'todos' && <Todos onUpdate={fetchCounts} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;