import React, { useState } from 'react';

// Category data structure
const EQUIPMENT_CATEGORIES = {
  'Sports Equipment': {
    'Team Sports': ['Football', 'Basketball', 'Baseball', 'Soccer', 'Volleyball'],
    'Individual Sports': ['Tennis', 'Golf', 'Boxing', 'Martial Arts', 'Cycling'],
    'Fitness': ['Cardio Machines', 'Strength Training', 'Yoga & Pilates', 'CrossFit', 'Recovery']
  },
  'Medical Equipment': {
    'Diagnostic': ['Stethoscopes', 'Blood Pressure Monitors', 'Thermometers', 'Otoscopes'],
    'Treatment': ['Nebulizers', 'Infusion Pumps', 'Surgical Instruments'],
    'Mobility Aids': ['Wheelchairs', 'Walkers', 'Canes', 'Crutches']
  },
  'Construction Equipment': {
    'Heavy Machinery': ['Excavators', 'Bulldozers', 'Cranes', 'Loaders'],
    'Tools': ['Power Tools', 'Hand Tools', 'Measuring Tools', 'Safety Equipment'],
    'Materials Handling': ['Forklifts', 'Hoists', 'Conveyors']
  },
  'Audio Equipment': {
    'Recording': ['Microphones', 'Audio Interfaces', 'Studio Monitors'],
    'Live Sound': ['PA Systems', 'Mixers', 'Amplifiers'],
    'DJ Equipment': ['Turntables', 'Controllers', 'Lighting']
  },
  'Kitchen Equipment': {
    'Commercial': ['Ovens', 'Refrigerators', 'Food Processors', 'Dishwashers'],
    'Home': ['Blenders', 'Coffee Makers', 'Toasters', 'Cookware'],
    'Baking': ['Mixers', 'Ovens', 'Measuring Tools', 'Decorating']
  }
};

const EquipmentCategories = () => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});

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

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Equipment Categories</h2>
      <div className="space-y-3">
        {Object.entries(EQUIPMENT_CATEGORIES).map(([mainCategory, subCategories]) => (
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