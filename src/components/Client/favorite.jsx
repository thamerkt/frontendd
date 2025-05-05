import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShare2, FiShoppingCart, FiX, FiFilter, FiChevronDown } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaSearch, FaTimes } from 'react-icons/fa';


const favoriteItems = [
  {
    id: 1,
    title: "Sony A7 IV Mirrorless",
    category: "Camera",
    price: "$2499",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29ueSUyMGE3fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=80",
    saved: "2023-12-10"
  },
  {
    id: 2,
    title: "DJI Mavic 3 Pro",
    category: "Drone",
    price: "$2199",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGpvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80",
    saved: "2023-11-28"
  },
  {
    id: 3,
    title: "Canon 24-70mm f/2.8",
    category: "Lens",
    price: "$1799",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhbm9uJTIwbGVuc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
    saved: "2023-12-05"
  },
  {
    id: 4,
    title: "Profoto A10 Flash",
    category: "Lighting",
    price: "$995",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1517971053561-8f4a6ef72a90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxpZ2h0aW5nJTIwa2l0fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=80",
    saved: "2023-11-15"
  },
  {
    id: 5,
    title: "Manfrotto Carbon Tripod",
    category: "Support",
    price: "$649",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1608340830226-97d2f465a9a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyaXBvZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
    saved: "2023-12-12"
  },
  {
    id: 6,
    title: "Rode Wireless Pro",
    category: "Audio",
    price: "$799",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pY3JvcGhvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80",
    saved: "2023-12-01"
  }
];

const FavoritesPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(favoriteItems);
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', 'Camera', 'Drone', 'Lens', 'Lighting', 'Support', 'Audio'];

  const filteredItems = favorites.filter(item => {
    const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
     
      <ClientSidebar/>
      {/* Main Content */}
      <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-10 bg-white shadow-sm py-4 px-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiHeart className="text-red-500 mr-2" size={24} />
              My Favorites
            </h1>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Filter Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-b border-gray-200 py-3 px-6 sticky top-16 z-10"
        >
          <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2">
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeFilter === category 
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </motion.button>
              ))}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 flex items-center text-sm font-medium"
            >
              <FiFilter className="mr-2" />
              Sort
              <FiChevronDown className="ml-1" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery 
                  ? "Try a different search term" 
                  : activeFilter !== 'All' 
                    ? `No items in ${activeFilter} category` 
                    : "You haven't saved any items yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group relative"
                  >
                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <FaHeart className="text-red-500" size={18} />
                    </motion.button>
                    
                    {/* Product Image */}
                    <div className="h-64 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {item.rating} ★
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">{item.price}</span>
                        
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <FiShare2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-700"
                          >
                            <FiShoppingCart size={18} />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Saved on {item.saved}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Quick View Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md z-10"
                  onClick={() => setSelectedItem(null)}
                >
                  <FiX size={20} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="h-64 md:h-full bg-gray-100 overflow-hidden">
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                        <p className="text-gray-500">{selectedItem.category}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                        {selectedItem.rating} ★
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">{selectedItem.price}</span>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart size={18} />
                        Add to Cart
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FiShare2 size={18} />
                        Share
                      </motion.button>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900">Details</h3>
                      <p className="mt-2 text-gray-600">
                        Professional-grade equipment with warranty. Includes all original accessories and carrying case.
                      </p>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Saved on {selectedItem.saved}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoritesPage;