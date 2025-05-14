import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EquipmentService from "../../services/EquipmentService";
import { 
  CheckCircle, XCircle, Edit, Trash2, 
  Plus, ArrowUp, ArrowDown, Package, 
  Search, Filter, Layers, Tag, ChevronDown, ChevronUp
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A05195'];

const AdminCategoriesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalSubcategories: 0,
    mostUsedCategory: "N/A",
    leastUsedCategory: "N/A"
  });

  const [categoryData, setCategoryData] = useState([]);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, subcategoriesData] = await Promise.all([
        EquipmentService.fetchCategories(),
        EquipmentService.fetchsubcatgeory()
      ]);
      
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      
      // Calculate stats
      const totalCategories = categoriesData.length;
      const totalSubcategories = subcategoriesData.length;
      
      // Find most and least used categories
      const categoryUsage = {};
      subcategoriesData.forEach(subcat => {
        const categoryId = subcat.category;
        categoryUsage[categoryId] = (categoryUsage[categoryId] || 0) + 1;
      });

      let mostUsed = "N/A";
      let leastUsed = "N/A";
      if (Object.keys(categoryUsage).length > 0) {
        const sortedCategories = Object.entries(categoryUsage).sort((a, b) => b[1] - a[1]);
        mostUsed = categoriesData.find(c => c.id === parseInt(sortedCategories[0][0]))?.name || "N/A";
        leastUsed = categoriesData.find(c => c.id === parseInt(sortedCategories[sortedCategories.length - 1][0]))?.name || "N/A";
      }

      setStats({
        totalCategories,
        totalSubcategories,
        mostUsedCategory: mostUsed,
        leastUsedCategory: leastUsed
      });

      // Update category distribution data
      const categoryDistribution = {};
      subcategoriesData.forEach(subcat => {
        const categoryId = subcat.category;
        categoryDistribution[categoryId] = (categoryDistribution[categoryId] || 0) + 1;
      });

      const categoryData = categoriesData.map(category => ({
        name: category.name,
        value: categoryDistribution[category.id] || 0
      }));
      setCategoryData(categoryData);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch categories data");
      setLoading(false);
      toast.error("Failed to load categories data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(subcat => subcat.category === categoryId);
  };

  const handleAddCategory = async (categoryData) => {
    try {
      const newCategory = await EquipmentService.createCategory(categoryData);
      setCategories([...categories, newCategory]);
      setStats(prev => ({
        ...prev,
        totalCategories: prev.totalCategories + 1
      }));
      toast.success("Category added successfully");
      fetchAllData(); // Refresh data
      return newCategory;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
      throw error;
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await EquipmentService.updateCategory(id, categoryData);
      setCategories(categories.map(cat => 
        cat.id === id ? updatedCategory : cat
      ));
      toast.success("Category updated successfully");
      fetchAllData(); // Refresh data
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
      throw error;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // First delete all subcategories under this category
      const categorySubcategories = subcategories.filter(subcat => subcat.category === id);
      await Promise.all(categorySubcategories.map(subcat => 
        EquipmentService.deletesubcatgeory(subcat.id)
      ));
      
      // Then delete the category
      await EquipmentService.deleteCategory(id);
      
      // Update state
      setCategories(categories.filter(cat => cat.id !== id));
      setSubcategories(subcategories.filter(subcat => subcat.category !== id));
      setStats(prev => ({
        ...prev,
        totalCategories: prev.totalCategories - 1,
        totalSubcategories: prev.totalSubcategories - categorySubcategories.length
      }));
      toast.success("Category and its subcategories deleted successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      throw error;
    }
  };

  const handleAddSubcategory = async (subcategoryData) => {
    try {
      const newSubcategory = await EquipmentService.createsubcatgeory(subcategoryData);
      setSubcategories([...subcategories, newSubcategory]);
      setStats(prev => ({
        ...prev,
        totalSubcategories: prev.totalSubcategories + 1
      }));
      
      // Update category distribution data
      const categoryId = newSubcategory.category;
      const newCategoryData = categoryData.map(item => 
        item.name === categories.find(c => c.id === categoryId)?.name
          ? { ...item, value: item.value + 1 }
          : item
      );
      setCategoryData(newCategoryData);
      
      toast.success("Subcategory added successfully");
      fetchAllData(); // Refresh data
      return newSubcategory;
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Failed to add subcategory");
      throw error;
    }
  };

  const handleUpdateSubcategory = async (id, subcategoryData) => {
    try {
      const updatedSubcategory = await EquipmentService.updatesubcatgeory(id, subcategoryData);
      setSubcategories(subcategories.map(subcat => 
        subcat.id === id ? updatedSubcategory : subcat
      ));
      toast.success("Subcategory updated successfully");
      fetchAllData(); // Refresh data
      return updatedSubcategory;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Failed to update subcategory");
      throw error;
    }
  };

  const handleDeleteSubcategory = async (id) => {
    try {
      const subcategoryToDelete = subcategories.find(subcat => subcat.id === id);
      await EquipmentService.deletesubcatgeory(id);
      
      setSubcategories(subcategories.filter(subcat => subcat.id !== id));
      setStats(prev => ({
        ...prev,
        totalSubcategories: prev.totalSubcategories - 1
      }));
      
      // Update category distribution data
      if (subcategoryToDelete) {
        const categoryId = subcategoryToDelete.category;
        const newCategoryData = categoryData.map(item => 
          item.name === categories.find(c => c.id === categoryId)?.name
            ? { ...item, value: Math.max(0, item.value - 1) }
            : item
        );
        setCategoryData(newCategoryData);
      }
      
      toast.success("Subcategory deleted successfully");
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Failed to delete subcategory");
      throw error;
    }
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const openSubcategoryModal = (category, subcategory = null) => {
    setCurrentCategory(category);
    setCurrentSubcategory(subcategory);
    setIsEditingSubcategory(!!subcategory);
    setShowSubcategoryModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentCategory(null);
              setIsEditing(false);
              setShowAddModal(true);
            }}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Category
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Categories", 
            value: stats.totalCategories, 
            icon: <Layers className="h-6 w-6" />
          },
          { 
            title: "Total Subcategories", 
            value: stats.totalSubcategories, 
            icon: <Tag className="h-6 w-6" />
          },
          { 
            title: "Most Used Category", 
            value: stats.mostUsedCategory, 
            icon: <ArrowUp className="h-6 w-6" />
          },
          { 
            title: "Least Used Category", 
            value: stats.leastUsedCategory, 
            icon: <ArrowDown className="h-6 w-6" />
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-xl font-semibold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className="p-2 rounded-md bg-teal-50 text-teal-600">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualizations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Main Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Monthly Spending Analysis</h2>
          <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Categories Section - Left Side */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-700 mb-4 pl-2 border-l-4 border-indigo-400">Categories Breakdown</h3>
            
            {/* Top 10 Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">TOP CATEGORIES</h4>
              <ul className="space-y-2">
                {categoryData.slice(0, 10).map((category, index) => (
                  <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{category.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Other Categories (if more than 10) */}
            {categoryData.length > 10 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-3">OTHER CATEGORIES</h4>
                <ul className="space-y-2">
                  {categoryData.slice(10).map((category, index) => (
                    <li key={index + 10} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[(index + 10) % COLORS.length] }}
                        ></span>
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                        <span className="text-gray-900 font-medium">{category.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Chart Section - Right Side */}
            <div className="lg:col-span-3">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Spending Distribution</h3>
                  <div className="flex space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {categoryData.length} categories
                    </span>
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                      {categoryData.reduce((sum, item) => sum + item.value, 0)} total
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} (${(props.payload.percent * 100).toFixed(1)}%)`,
                            props.payload.name
                          ]}
                          contentStyle={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: 'none'
                          }}
                        />
                        <Legend 
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{
                            paddingLeft: '20px',
                            overflowY: 'auto',
                            maxHeight: '300px'
                          }}
                          formatter={(value, entry, index) => (
                            <span className="text-gray-600 text-xs">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
                  <span>Hover segments for details</span>
                  <span>Updated: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Categories Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Categories List</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => {
                const categorySubcategories = getSubcategoriesForCategory(category.id);
                const isExpanded = expandedCategories[category.id];
                
                return (
                  <>
                    <motion.tr
                      key={`category-${category.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="group"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="mr-2 text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex-shrink-0 h-8 w-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.description || "No description"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span>{categorySubcategories.length}</span>
                          <button
                            onClick={() => openSubcategoryModal(category)}
                            className="ml-2 px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded hover:bg-teal-200 transition-colors"
                          >
                            + Add Subcategory
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-teal-600 hover:text-teal-900"
                            onClick={() => openEditModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Subcategories rows */}
                    {isExpanded && categorySubcategories.map((subcategory) => (
                      <motion.tr
                        key={`subcategory-${subcategory.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center pl-10">
                            <div className="flex-shrink-0 h-6 w-6 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                              <Tag className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-700">{subcategory.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          Subcategory
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subcategory.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-teal-600 hover:text-teal-900"
                              onClick={() => openSubcategoryModal(category, subcategory)}
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <CategoryModal 
            onClose={() => setShowAddModal(false)} 
            category={currentCategory}
            isEditing={isEditing}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
          />
        )}
      </AnimatePresence>

      {/* Add/Edit Subcategory Modal */}
      <AnimatePresence>
        {showSubcategoryModal && currentCategory && (
          <SubcategoryModal 
            onClose={() => setShowSubcategoryModal(false)}
            category={currentCategory}
            subcategory={currentSubcategory}
            isEditing={isEditingSubcategory}
            onAdd={handleAddSubcategory}
            onUpdate={handleUpdateSubcategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ onClose, category, isEditing, onAdd, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || ""
      });
    } else {
      setFormData({
        name: "",
        description: ""
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && category) {
        await onUpdate(category.id, formData);
      } else {
        await onAdd(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
              >
                {isEditing ? "Update" : "Add"} Category
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Subcategory Modal Component
const SubcategoryModal = ({ onClose, category, subcategory, isEditing, onAdd, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: category.id
  });

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        category: subcategory.category
      });
    } else {
      setFormData({
        name: "",
        category: category.id
      });
    }
  }, [subcategory, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && subcategory) {
        await onUpdate(subcategory.id, formData);
      } else {
        await onAdd(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting subcategory:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit Subcategory" : `Add New Subcategory to ${category.name}`}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-100"
                  value={category.name}
                  readOnly
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter subcategory name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm"
              >
                {isEditing ? "Update" : "Add"} Subcategory
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminCategoriesPage;