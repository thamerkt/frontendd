import { useState } from "react";

const FilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-teal-50">
      <h3 className="font-bold text-lg mb-4 text-teal-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        Filters
      </h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-teal-700">Price Range</h4>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
            className="w-full accent-teal-600 mb-2"
          />
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
            className="w-full accent-teal-600"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-teal-700">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-teal-700">Rental Duration</h4>
        <div className="space-y-2">
          {['Hourly', 'Daily', 'Weekly', 'Monthly'].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
              <span className="text-teal-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterSidebar;