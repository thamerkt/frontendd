const CategoryCard = ({ category, onClick }) => {
    return (
      <div 
        onClick={() => onClick(category)}
        className="group relative block overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 via-teal-800/30 to-transparent flex items-end p-4">
            <div>
              <h3 className="text-white text-xl font-bold">{category.name}</h3>
              <p className="text-teal-100 text-sm mt-1">
                {category.subcategories.length} subcategories
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default CategoryCard;