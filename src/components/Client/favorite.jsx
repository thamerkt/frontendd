import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiShare2, 
  FiShoppingCart, 
  FiX,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { FaHeart, FaSearch, FaTimes } from 'react-icons/fa';
import EquipmentService from '../../services/EquipmentService';

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [detailedItems, setDetailedItems] = useState({});
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' or 'row'

  // Function to get the first image for a product
  const getProductImage = useCallback((productId) => {
    if (!Array.isArray(images) || images.length === 0) return null;
  
    const productImages = images.filter(img => img?.stuff === productId);
    if (productImages.length === 0) return null;
  
    const mainImage = productImages.find(img => img?.position === 1);
    let url = mainImage?.url || productImages[0]?.url || null;
    
    if (url && url.includes('localhost')) {
      url = url.replace('localhost', 'localhost:8000');
    }
  
    return url;
  }, [images]);

  const removeFavorite = async (id) => {
    try {
      await EquipmentService.removeFromWishlist(id);
      setFavorites(prev => prev.filter(item => item.id !== id));
      const newDetailedItems = {...detailedItems};
      delete newDetailedItems[id];
      setDetailedItems(newDetailedItems);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [favoritesData, imagesData] = await Promise.all([
        EquipmentService.fetchWishlist(),
        EquipmentService.fetchImages()
      ]);
      
      if (favoritesData) {
        const favoritesWithImages = favoritesData.map(item => ({
          ...item,
          image: getProductImage(item.id) || '/placeholder-image.jpg'
        }));
        setFavorites(favoritesWithImages);

        // Pre-fetch detailed data for all items
        const detailedData = {};
        for (const item of favoritesWithImages) {
          try {
            const data = await EquipmentService.fetchRentalById(item.id);
            detailedData[item.id] = data;
          } catch (error) {
            console.error(`Error fetching details for item ${item.id}:`, error);
          }
        }
        setDetailedItems(detailedData);
      }
      
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailedItem = async (id) => {
    if (detailedItems[id]) return; // Already fetched
    
    setIsModalLoading(true);
    try {
      const data = await EquipmentService.fetchRentalById(id);
      setDetailedItems(prev => ({...prev, [id]: data}));
    } catch (error) {
      console.error('Error fetching detailed item:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
    await fetchDetailedItem(item.id);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'grid' ? 'row' : 'grid');
  };

  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites;
    
    return favorites.filter(item => 
      item.stuffname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 ml-20 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-10 bg-white shadow-sm py-4 px-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiHeart className="text-red-500 mr-2" size={24} />
                My Favorites
              </h1>
              <button 
                onClick={toggleDisplayMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                title={displayMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
              >
                {displayMode === 'grid' ? <FiList size={20} /> : <FiGrid size={20} />}
              </button>
            </div>
            
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {filteredFavorites.length === 0 ? (
            <EmptyState 
              searchQuery={searchQuery} 
            />
          ) : displayMode === 'grid' ? (
            <FavoritesGrid 
              items={filteredFavorites} 
              detailedItems={detailedItems}
              removeFavorite={removeFavorite} 
              onItemClick={handleItemClick}
            />
          ) : (
            <FavoritesList 
              items={filteredFavorites} 
              detailedItems={detailedItems}
              removeFavorite={removeFavorite} 
              onItemClick={handleItemClick}
            />
          )}
        </main>

        <QuickViewModal 
          item={selectedItem} 
          detailedItem={selectedItem ? detailedItems[selectedItem.id] : null}
          isLoading={isModalLoading}
          onClose={handleCloseModal} 
        />
      </div>
    </div>
  );
};

const SearchBar = ({ searchQuery, setSearchQuery }) => (
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
);

const EmptyState = ({ searchQuery }) => (
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
        : "You haven't saved any items yet"}
    </p>
  </motion.div>
);

const FavoritesGrid = ({ items, detailedItems, removeFavorite, onItemClick }) => (
  <motion.div 
    layout
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    <AnimatePresence>
      {items.map((item) => (
        <FavoriteCard 
          key={item.id}
          item={item}
          detailedItem={detailedItems[item.id]}
          removeFavorite={removeFavorite}
          onClick={() => onItemClick(item)}
          displayMode="grid"
        />
      ))}
    </AnimatePresence>
  </motion.div>
);

const FavoritesList = ({ items, detailedItems, removeFavorite, onItemClick }) => (
  <motion.div 
    layout
    className="space-y-4"
  >
    <AnimatePresence>
      {items.map((item) => (
        <FavoriteCard 
          key={item.id}
          item={item}
          detailedItem={detailedItems[item.id]}
          removeFavorite={removeFavorite}
          onClick={() => onItemClick(item)}
          displayMode="row"
        />
      ))}
    </AnimatePresence>
  </motion.div>
);

const FavoriteCard = ({ item, detailedItem, removeFavorite, onClick, displayMode = 'grid' }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: displayMode === 'grid' ? -5 : 0 }}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group relative cursor-pointer ${
      displayMode === 'row' ? 'flex' : ''
    }`}
    onClick={onClick}
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md"
      onClick={(e) => {
        e.stopPropagation();
        removeFavorite(item.id);
      }}
    >
      <FaHeart className="text-red-500" size={18} />
    </motion.button>
    
    <div className={`${displayMode === 'row' ? 'w-1/3' : 'h-64'} overflow-hidden relative`}>
      <img
        src={item.image}
        alt={item.stuffname}
        className={`w-full ${displayMode === 'row' ? 'h-full' : 'h-64'} object-cover transition-transform duration-500 group-hover:scale-105`}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
    
    <div className={`p-5 ${displayMode === 'row' ? 'w-2/3' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{item.stuffname}</h3>
          <p className="text-sm text-gray-500">{detailedItem?.brand || item.brand}</p>
        </div>
        {item.rating && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
            {item.rating} ★
          </span>
        )}
      </div>
      
      <div className="mt-2">
        <span className="text-xl font-bold text-gray-900">
          ${detailedItem?.price_per_day?.toFixed(2) || item.price_per_day?.toFixed(2) || '0.00'}/day
        </span>
      </div>
      
      {displayMode === 'row' && detailedItem && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {detailedItem.short_description || item.short_description || 'No description available'}
          </p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>
              <span className="font-medium">Location:</span> {detailedItem.rental_location || 'N/A'}
            </span>
            <span>
              <span className="font-medium">Condition:</span> {detailedItem.state || item.state || 'N/A'}
            </span>
          </div>
        </div>
      )}
      
      <div className={`mt-4 flex items-center justify-between ${
        displayMode === 'row' ? 'absolute bottom-4 right-4' : ''
      }`}>
        {displayMode === 'grid' && (
          <div className="text-xs text-gray-500">
            {detailedItem?.state || item.state || 'N/A'} condition
          </div>
        )}
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <FiShare2 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-700"
            onClick={(e) => e.stopPropagation()}
          >
            <FiShoppingCart size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

const QuickViewModal = ({ item, detailedItem, isLoading, onClose }) => (
  <AnimatePresence>
    {item && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
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
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="h-64 md:h-full bg-gray-100 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.stuffname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{item.stuffname}</h2>
                      <p className="text-gray-500">{detailedItem?.brand || item.brand}</p>
                    </div>
                    {item.rating && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                        {item.rating} ★
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${detailedItem?.price_per_day?.toFixed(2) || item.price_per_day?.toFixed(2) || '0.00'}/day
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {detailedItem?.rental_location || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Posted on:</span> {detailedItem?.created_at || 'N/A'}
                    </p>
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
                      {detailedItem?.short_description || item.short_description || 'No description available for this equipment.'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900">Detailed Description</h3>
                    {detailedItem?.detailed_description ? (
                      <div 
                        className="mt-2 text-gray-600 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: detailedItem.detailed_description }}
                      />
                    ) : (
                      <p className="mt-2 text-gray-600">No detailed description available</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <span className="font-medium">Condition:</span> {detailedItem?.state || item.state || 'N/A'}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default FavoritesPage;