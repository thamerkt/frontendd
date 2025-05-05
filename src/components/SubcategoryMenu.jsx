const SubcategoryMenu = ({ subcategories, activeCategory }) => {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-teal-50">
        <h3 className="font-bold text-lg mb-4 text-teal-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A1 1 0 019.293 9.293L11 11.586V3a1 1 0 112 0v8.586l1.707-1.707a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {activeCategory}
        </h3>
        <ul className="space-y-2">
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <a
                href="#"
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-teal-50 text-teal-700 hover:text-teal-900 transition-colors"
              >
                <span>{sub.name}</span>
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                  {sub.count}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default SubcategoryMenu;