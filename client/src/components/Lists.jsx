import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, X, ShoppingCart, Heart } from 'lucide-react';
import api from '../utils/api.js';

const Lists = ({ onUpdate }) => {
  const [lists, setLists] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editingWishlist, setEditingWishlist] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'list' or 'wishlist'
  const [formData, setFormData] = useState({ 
    title: '', 
    items: [{ name: '', quantity: 1, price: 0 }] 
  });
  const [wishlistFormData, setWishlistFormData] = useState({
    title: '',
    items: [{ name: '', quantity: 1, price: 0, bought: false }]
  });

  useEffect(() => {
    fetchLists();
    fetchWishlists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await api.get('/lists');
      setLists(response.data);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to fetch lists');
    }
  };

  const fetchWishlists = async () => {
    try {
      const response = await api.get('/wishlists');
      setWishlists(response.data);
    } catch (error) {
      toast.error('Failed to fetch wishlists');
    }
  };

  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.price || 0);
  };

  const calculateListTotal = (items) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const openDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (deleteType === 'list') {
        await api.delete(`/lists/${itemToDelete._id}`);
        toast.success('Shopping list deleted successfully');
        fetchLists();
      } else if (deleteType === 'wishlist') {
        await api.delete(`/wishlists/${itemToDelete._id}`);
        toast.success('Wishlist deleted successfully');
        fetchWishlists();
      }
      closeDeleteDialog();
    } catch (error) {
      toast.error(`Failed to delete ${deleteType}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedItems = formData.items.filter((item) => item.name.trim() !== '');
    
    if (cleanedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      if (editingList) {
        await api.put(`/lists/${editingList._id}`, {
          ...formData,
          items: cleanedItems,
        });
        toast.success('List updated successfully');
      } else {
        await api.post('/lists', { ...formData, items: cleanedItems });
        toast.success('List created successfully');
      }
      setFormData({ title: '', items: [{ name: '', quantity: 1, price: 0 }] });
      setShowForm(false);
      setEditingList(null);
      fetchLists();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleWishlistSubmit = async (e) => {
    e.preventDefault();
    const cleanedItems = wishlistFormData.items.filter((item) => item.name.trim() !== '');
    
    if (cleanedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      if (editingWishlist) {
        await api.put(`/wishlists/${editingWishlist._id}`, {
          ...wishlistFormData,
          items: cleanedItems,
        });
        toast.success('Wishlist updated successfully');
      } else {
        await api.post('/wishlists', { ...wishlistFormData, items: cleanedItems });
        toast.success('Wishlist created successfully');
      }
      setWishlistFormData({ title: '', items: [{ name: '', quantity: 1, price: 0, bought: false }] });
      setShowWishlistForm(false);
      setEditingWishlist(null);
      fetchWishlists();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (list) => {
    setEditingList(list);
    setFormData({ 
      title: list.title, 
      items: list.items.length ? list.items : [{ name: '', quantity: 1, price: 0 }] 
    });
    setShowForm(true);
  };

  const handleWishlistEdit = (wishlist) => {
    setEditingWishlist(wishlist);
    setWishlistFormData({
      title: wishlist.title,
      items: wishlist.items.length ? wishlist.items : [{ name: '', quantity: 1, price: 0, bought: false }]
    });
    setShowWishlistForm(true);
  };

  const toggleBought = async (wishlistId, itemIndex) => {
    try {
      const wishlist = wishlists.find(w => w._id === wishlistId);
      const updatedItems = [...wishlist.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        bought: !updatedItems[itemIndex].bought
      };
      
      await api.put(`/wishlists/${wishlistId}`, {
        title: wishlist.title,
        items: updatedItems
      });
      toast.success('Item status updated');
      fetchWishlists();
    } catch (error) {
      toast.error('Failed to update item status');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingList(null);
    setFormData({ title: '', items: [{ name: '', quantity: 1, price: 0 }] });
  };

  const handleWishlistCancel = () => {
    setShowWishlistForm(false);
    setEditingWishlist(null);
    setWishlistFormData({ title: '', items: [{ name: '', quantity: 1, price: 0, bought: false }] });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { name: '', quantity: 1, price: 0 }] });
  };

  const addWishlistItem = () => {
    setWishlistFormData({ 
      ...wishlistFormData, 
      items: [...wishlistFormData.items, { name: '', quantity: 1, price: 0, bought: false }] 
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      items: newItems.length ? newItems : [{ name: '', quantity: 1, price: 0 }] 
    });
  };

  const removeWishlistItem = (index) => {
    const newItems = wishlistFormData.items.filter((_, i) => i !== index);
    setWishlistFormData({ 
      ...wishlistFormData, 
      items: newItems.length ? newItems : [{ name: '', quantity: 1, price: 0, bought: false }] 
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const updateWishlistItem = (index, field, value) => {
    const newItems = [...wishlistFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setWishlistFormData({ ...wishlistFormData, items: newItems });
  };

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  deleteType === 'list' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {deleteType === 'list' ? (
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  ) : (
                    <Heart className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete {deleteType === 'list' ? 'Shopping List' : 'Wishlist'}
                </h3>
              </div>
              <button
                onClick={closeDeleteDialog}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this {deleteType}? This action cannot be undone.
              </p>
              {itemToDelete && (
                <div className={`rounded-md p-3 border-2 ${
                  deleteType === 'list' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <p className="font-semibold text-gray-800 mb-2">
                    {itemToDelete.title}
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>{itemToDelete.items.length} items</p>
                    <p className="font-semibold mt-1">
                      Total: M {calculateListTotal(itemToDelete.items).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

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

      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowWishlistForm(false);
                setShowForm(false);
              }}
              className="text-lg font-semibold text-gray-800 hover:text-green-600 transition"
            >
              Shopping Lists
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setShowWishlistForm(false);
              }}
              className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition"
            >
              Wishlists
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowWishlistForm(false);
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
            >
              {showForm ? 'Cancel' : '+ Shopping List'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setShowWishlistForm(!showWishlistForm);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm"
            >
              {showWishlistForm ? 'Cancel' : '+ Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Shopping List Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-green-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {editingList ? 'Edit Shopping List' : 'Create New Shopping List'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="grid grid-cols-12 gap-2 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="col-span-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        min="1"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="Price (M)"
                        step="0.01"
                        min="0"
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="col-span-1 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-green-700">M {calculateItemTotal(item).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-3 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition text-sm"
              >
                + Add Item
              </button>
              <div className="mt-4 p-3 bg-green-100 rounded-md">
                <p className="text-lg font-semibold text-green-800">
                  Total Cost: M {calculateListTotal(formData.items).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                {editingList ? 'Update List' : 'Create List'}
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

      {/* Wishlist Form */}
      {showWishlistForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-purple-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {editingWishlist ? 'Edit Wishlist' : 'Create New Wishlist'}
          </h3>
          <form onSubmit={handleWishlistSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wishlist Title
              </label>
              <input
                type="text"
                value={wishlistFormData.title}
                onChange={(e) => setWishlistFormData({ ...wishlistFormData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <div className="space-y-3">
                {wishlistFormData.items.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="grid grid-cols-12 gap-2 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateWishlistItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="col-span-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateWishlistItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        min="1"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateWishlistItem(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="Price (M)"
                        step="0.01"
                        min="0"
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {wishlistFormData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWishlistItem(index)}
                          className="col-span-1 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-purple-700">M {calculateItemTotal(item).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addWishlistItem}
                className="mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition text-sm"
              >
                + Add Item
              </button>
              <div className="mt-4 p-3 bg-purple-100 rounded-md">
                <p className="text-lg font-semibold text-purple-800">
                  Total Cost: M {calculateListTotal(wishlistFormData.items).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                {editingWishlist ? 'Update Wishlist' : 'Create Wishlist'}
              </button>
              <button
                type="button"
                onClick={handleWishlistCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shopping Lists Display */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shopping Lists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">
              No shopping lists yet. Create your first list!
            </p>
          ) : (
            lists.map((list) => (
              <div
                key={list._id}
                className="bg-white border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {list.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {list.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-green-700 font-semibold">M {calculateItemTotal(item).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × M {item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {list.items.length > 3 && (
                    <p className="text-xs text-gray-400 italic">
                      + {list.items.length - 3} more items
                    </p>
                  )}
                </div>
                <div className="bg-green-100 p-2 rounded mb-3">
                  <p className="text-sm font-semibold text-green-800">
                    Total: M {calculateListTotal(list.items).toFixed(2)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(list.createdAt).toLocaleDateString()} • {list.items.length} items
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(list)}
                    className="flex-1 px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(list, 'list')}
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

      {/* Wishlists Display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Wishlists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlists.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">
              No wishlists yet. Create your first wishlist!
            </p>
          ) : (
            wishlists.map((wishlist) => (
              <div
                key={wishlist._id}
                className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {wishlist.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {wishlist.items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`text-sm p-2 rounded border ${
                        item.bought 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.bought}
                              onChange={() => toggleBought(wishlist._id, index)}
                              className="cursor-pointer"
                            />
                            <span className={`font-medium ${
                              item.bought ? 'line-through text-gray-500' : 'text-gray-700'
                            }`}>
                              {item.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 ml-6">
                            {item.quantity} × M {item.price.toFixed(2)}
                          </div>
                        </div>
                        <span className={`font-semibold ${
                          item.bought ? 'text-green-600' : 'text-purple-700'
                        }`}>
                          M {calculateItemTotal(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-100 p-2 rounded mb-3">
                  <p className="text-sm font-semibold text-purple-800">
                    Total: M {calculateListTotal(wishlist.items).toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600">
                    Bought: {wishlist.items.filter(i => i.bought).length} / {wishlist.items.length}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(wishlist.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWishlistEdit(wishlist)}
                    className="flex-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(wishlist, 'wishlist')}
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

export default Lists;