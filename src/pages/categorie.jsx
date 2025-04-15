import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const CATEGORIES_URL = `${API_BASE_URL}/categories/`;
const SUBCATEGORIES_URL = `${API_BASE_URL}/subcatgeory/`;

const EquipmentCategories = () => {
  const [categories, setCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch both categories and subcategories in parallel
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          axios.get(CATEGORIES_URL),
          axios.get(SUBCATEGORIES_URL)
        ]);

        const categoriesData = categoriesResponse.data;
        const subcategoriesData = subcategoriesResponse.data;

        // Process the data into the required structure
        const processedCategories = {};

        // First filter out categories with empty names
        const validCategories = categoriesData.filter(cat => cat.name.trim() !== '');

        validCategories.forEach(category => {
          // Get all subcategories for this category
          const categorySubs = subcategoriesData
            .filter(sub => sub.category === category.id)
            .map(sub => sub.name);

          // Only add to our structure if there are subcategories
          if (categorySubs.length > 0) {
            processedCategories[category.name] = {
              // For now we'll just use the subcategory names as both keys and values
              // You might want to adjust this based on your actual needs
              ...categorySubs.reduce((acc, sub) => {
                acc[sub] = [sub]; // Using sub as both the key and the single item
                return acc;
              }, {})
            };
          }
        });

        setCategories(processedCategories);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle category selection
  const handleCategorySelect = (mainCat, subCat, item) => {
    setSelectedCategories(prev => {
      const newSelection = { ...prev };
      
      if (!newSelection[mainCat]) newSelection[mainCat] = {};
      if (!newSelection[mainCat][subCat]) newSelection[mainCat][subCat] = [];
      
      const index = newSelection[mainCat][subCat].indexOf(item);
      if (index > -1) {
        newSelection[mainCat][subCat].splice(index, 1);
        // Clean up empty categories
        if (newSelection[mainCat][subCat].length === 0) {
          delete newSelection[mainCat][subCat];
          if (Object.keys(newSelection[mainCat]).length === 0) {
            delete newSelection[mainCat];
          }
        }
      } else {
        newSelection[mainCat][subCat].push(item);
      }
      
      return newSelection;
    });
  };

  // Check if a category item is selected
  const isCategorySelected = (mainCat, subCat, item) => {
    return selectedCategories[mainCat]?.[subCat]?.includes(item) || false;
  };

  if (loading) return <div className="p-4 text-center">Loading categories...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (Object.keys(categories).length === 0) return <div className="p-4 text-center">No categories found</div>;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Equipment Categories</h2>
      <div className="space-y-3">
        {Object.entries(categories).map(([mainCategory, subCategories]) => (
          <div key={mainCategory} className="border-b border-gray-100 pb-2 last:border-0">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Object.keys(selectedCategories).includes(mainCategory)}
                  onChange={() => {}}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 font-medium text-gray-700">{mainCategory}</span>
              </label>
              <button
                onClick={() => toggleCategory(mainCategory)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${expandedCategories[mainCategory] ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {expandedCategories[mainCategory] && (
              <div className="ml-6 mt-2 space-y-3">
                {Object.entries(subCategories).map(([subCategory, items]) => (
                  <div key={subCategory} className="border-l border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories[mainCategory]?.[subCategory]?.length === items.length}
                          onChange={() => {}}
                          className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 font-medium text-gray-600">{subCategory}</span>
                      </label>
                    </div>

                    <div className="ml-6 mt-1 space-y-1">
                      {items.map(item => (
                        <label key={item} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCategorySelected(mainCategory, subCategory, item)}
                            onChange={() => handleCategorySelect(mainCategory, subCategory, item)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-500">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected categories summary */}
      {Object.keys(selectedCategories).length > 0 && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Filters</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedCategories).map(([mainCat, subCats]) =>
              Object.entries(subCats).map(([subCat, items]) =>
                items.map(item => (
                  <span 
                    key={`${mainCat}-${subCat}-${item}`} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {item}
                    <button 
                      onClick={() => handleCategorySelect(mainCat, subCat, item)}
                      className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )
            )}
            <button 
              onClick={() => setSelectedCategories({})}
              className="text-xs text-blue-600 hover:text-blue-800 ml-auto"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentCategories;