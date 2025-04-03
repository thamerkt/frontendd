import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Store, MapPin, Upload, Heart, ChevronDown } from "lucide-react";
import EquipmentService from "../services/EquipmentService";
import {PopularRentals,Banner,Features,FAQSection} from "../Customcss/landingpage"




const faqs = [
  { question: "How does renting work on your platform?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What happens if an item gets damaged?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Can I cancel or modify a rental request?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Is it safe to rent from strangers?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Do you offer customer support?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What payment methods do you accept?", answer: "Lorem ipsum dolor sit amet." } // Added 6th question
];

const CategoriesSection = () => {
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
            className={`px-4 py-2 rounded-lg ${cat.name === selectedCategory
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
            className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-teal-500" : "bg-gray-300"
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
};




const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rentals, setRentals] = useState([])
  const [categories, setCategories] = useState([])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : rentals.length - 3));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < rentals.length - 3 ? prev + 1 : 0));
  };

  const bannerProps = {
    title: "WELCOME",
    description: "Rent Camping, Fitness, Wedding and lot more other stuff",
    buttons: [
      { label: "How It Works" },
      { label: "Add Product" }
    ],
    searchPlaceholder: "What are you looking for",
    onSearch: () => console.log("Search clicked")
  };

  const popularRentalsProps = {
    title: "POPULAR RENTALS",
    subtitle: "OUR STUFFES",
    rentals: rentals, // Assuming rentals is defined somewhere
    currentIndex,
    handlePrev,
    handleNext
  };

  const featuresProps = {
    title: "Our Features",
    subtitle: "Why Choose Us",
    description: "Discover, Rent, Enjoy – Your go-to platform for hassle-free rentals of anything, anytime, from anyone. Secure, simple, and seamless.",
    features: [
      {
        icon: "/assets/multi.png",
        title: "Rent from Real People, Anywhere",
        description: "Connect with a community of renters and lenders near you. Whether you’re looking for something local or unique, our platform lets you rent directly from individuals, ensuring a personalized and trustworthy experience."
      },
      {
        icon: "/assets/lock.png",
        title: "Secure and Hassle-Free Transactions",
        description: "We prioritize your safety with secure payments, verified users, and clear rental agreements. Enjoy peace of mind knowing every transaction is protected, so you can focus on what matters most—your experience."
      },
      {
        icon: "/assets/bonus.png",
        title: "Save Money, Live Smarter",
        description: "Why buy when you can rent? Save money by renting items only when you need them. It’s a smarter, more sustainable way to access the things you love without the long-term costs or clutter."
      }
    ],
    onExploreMore: () => console.log("Explore More clicked")
  };
  


  
  useEffect(() => {

    const fetchData = async () => {
      try {
        const data = await EquipmentService.fetchRentals();
        const categoriesdata = await EquipmentService.fetchCategories()
        setCategories(categoriesdata)
        setRentals(data);

        console.log(rentals)
      } catch (e) {
        console.error("Error fetching history data:", e.message);
      }
    };


    fetchData();
  }, []);
  return (
    <div className="relative w-full h-auto">
      <Banner {...bannerProps} />
      <PopularRentals {...popularRentalsProps} />
      <div className="mb-20"></div>
      <Features {...featuresProps} />
      <CategoriesSection />
      <FAQSection />
    </div>
  );
};

export default LandingPage;