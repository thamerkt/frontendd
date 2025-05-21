import { useState, useEffect } from 'react';
import EquipmentService from '../../services/EquipmentService';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', category: '' });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await EquipmentService.fetchsubcatgeory();
      setSubcategories(data);
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await EquipmentService.createCategory(newCategory);
      await fetchCategories();
      setNewCategory({ name: '', description: '' });
      setIsAddingCategory(false);
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      await EquipmentService.createsubcatgeory(newSubcategory);
      await fetchSubcategories();
      setNewSubcategory({ name: '', description: '', category: '' });
      setIsAddingSubcategory(false);
    } catch (err) {
      setError('Failed to add subcategory');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all associated subcategories.')) {
      try {
        await EquipmentService.deleteCategory(id);
        await fetchCategories();
        await fetchSubcategories();
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      }
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await EquipmentService.deletesubcatgeory(id);
        await fetchSubcategories();
      } catch (err) {
        setError('Failed to delete subcategory');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setIsAddingSubcategory(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subcategory</span>
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddingSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Subcategory</h2>
            <form onSubmit={handleAddSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newSubcategory.category}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newSubcategory.description}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingSubcategory(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div key={category.id}>
              <div
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-center space-x-3">
                  {expandedCategory === category.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-teal-600 hover:text-teal-900">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {expandedCategory === category.id && (
                <div className="pl-12 pr-4 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Subcategories</h4>
                  <div className="space-y-2">
                    {subcategories
                      .filter(sub => sub.category === category.id)
                      .map(subcategory => (
                        <div
                          key={subcategory.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{subcategory.name}</p>
                            <p className="text-xs text-gray-500">{subcategory.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-teal-600 hover:text-teal-900">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 