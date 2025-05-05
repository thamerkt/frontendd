import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { categories } from "../data/categories";
import { products } from "../data/products";
import CategoryCard from "../components/CategoryCard";
import SubcategoryMenu from "../components/SubcategoryMenu";
import FilterSidebar from "../components/FilterSidebar";
import ProductGrid from "../components/ProductGrid";

const CategoriesPage = () => {
  const { categoryId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  useEffect(() => {
    if (categoryId) {
      const category = categories.find(cat => cat.id === parseInt(categoryId));
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    window.history.pushState({}, '', `/categories/${category.id}`);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.categoryId !== selectedCategory.id) return false;
    if (product.dailyRate < priceRange[0] || product.dailyRate > priceRange[1]) return false;
    if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategoryId)) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-teal-50">
      <div className="container mx-auto px-4 py-8">
        {!selectedCategory ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-teal-900 mb-2">Rent Professional Equipment</h1>
              <p className="text-teal-700 max-w-2xl mx-auto">Browse our wide selection of rental equipment</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onClick={handleCategorySelect}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4 space-y-6">
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategories([]);
                  window.history.pushState({}, '', '/categories');
                }}
                className="flex items-center text-teal-600 hover:text-teal-800 mb-4 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                All Categories
              </button>
              
              <SubcategoryMenu 
                subcategories={selectedCategory.subcategories} 
                activeCategory={selectedCategory.name}
                selectedSubcategories={selectedSubcategories}
                onSubcategoryToggle={(subId) => {
                  setSelectedSubcategories(prev => 
                    prev.includes(subId) 
                      ? prev.filter(id => id !== subId) 
                      : [...prev, subId]
                  );
                }}
              />
              
              <FilterSidebar 
                priceRange={priceRange}
                onPriceChange={setPriceRange}
              />
            </div>
            
            <div className="lg:w-3/4">
              <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-teal-100">
                <h1 className="text-2xl font-bold text-teal-900 mb-2">
                  {selectedCategory.name}
                </h1>
                <p className="text-teal-700 mb-4">
                  {filteredProducts.length} items available
                </p>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    className="w-full p-3 pl-10 rounded-lg border border-teal-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400 absolute left-3 top-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;