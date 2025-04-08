import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import EquipmentService from "../../services/EquipmentService.js";

export default function CategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState("2");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await EquipmentService.fetchCategories();
        setCategories(categoriesData);
      } catch (e) {
        console.error("Error fetching categories data:", e.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const filter = `category=${selectedCategory}`;
        const itemsData = await EquipmentService.fetchRentalsBy(filter);
        setItems((prevItems) => ({
          ...prevItems,
          [selectedCategory]: itemsData,
        }));
      } catch (e) {
        console.error("Error fetching items data:", e.message);
      }
    };

    fetchItems();
  }, [selectedCategory]);

  const cardsToShow = 4;

  const handleNext = () => {
    setCurrentIndex((prev) =>
      items[selectedCategory]?.length ? (prev + 1) % items[selectedCategory].length : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      items[selectedCategory]?.length ? (prev === 0 ? items[selectedCategory].length - 1 : prev - 1) : 0
    );
  };

  const getCurrentCards = () => {
    const categoryItems = items[selectedCategory] || [];
    return categoryItems.slice(currentIndex, currentIndex + cardsToShow);
  };

  return (
    <div className="text-center py-10">
      <h2 className="text-gray-600 uppercase">Our Stuff Categories</h2>
      <h1 className="text-3xl font-bold italic">Explore Our Categories</h1>
      <div className="flex justify-center gap-2 mt-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-lg ${
              cat.name === selectedCategory
                ? "bg-teal-600 text-white"
                : "bg-white border border-teal-600 text-teal-600"
            }`}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <p className="text-gray-500 mt-3">
        Tech moves fast—don’t get left behind. Rent the latest gadgets without the cost of keeping up.
      </p>
      <div className="relative flex items-center justify-center mt-6">
        <button
          onClick={handlePrev}
          className="absolute left-2 bg-white p-2 rounded-full shadow-md"
        >
          <ChevronLeft className="text-gray-800" />
        </button>
        <div className="flex gap-6">
          {getCurrentCards().map((item, index) => (
            <div key={index} className="p-4 border rounded-lg w-48 text-center">
              <img
                src={item.img}
                alt={item.name}
                className="w-40 h-40 object-cover mx-auto"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="italic">{item.name}</p>
                <Heart className="text-gray-500" size={20} />
              </div>
              <p className="font-semibold">50DT per day</p>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg mt-2">
                Rent Now
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="absolute right-2 bg-white p-2 rounded-full shadow-md"
        >
          <ChevronRight className="text-gray-800" />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {(items[selectedCategory] || []).map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-teal-500" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>

      {/* "More Categories" Button */}
      <div className="flex justify-center mt-6">
        <button className="bg-[#0F0D23] text-white px-6 py-3 text-lg font-semibold rounded-none shadow-md hover:bg-[#0F0D23] transition-all duration-300 transform hover:scale-105 opacity-100">
          More Categories
        </button>
      </div>
    </div>
  );
}