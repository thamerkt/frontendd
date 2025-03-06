import { useState } from "react";
import { ChevronLeft, ChevronRight, Store, MapPin, Upload, Heart, ChevronDown } from "lucide-react";

const rentals = [
  {
    id: 1,
    title: "WEDDING ESSENTIALS",
    description: "brief description about wedding essentials",
    store: "Ilyass store",
    location: "Nabeul 8000",
    price: "500DT/DAY",
    image: "/assets/wedding-essentials.jpg",
    rating: 4,
  },
  {
    id: 2,
    title: "WEDDING ESSENTIALS",
    description: "brief description about wedding essentials",
    store: "Ilyass store",
    location: "Nabeul 8000",
    price: "500DT/DAY",
    image: "/assets/wedding-essentials.jpg",
    rating: 4,
  },
  {
    id: 3,
    title: "WEDDING ESSENTIALS",
    description: "brief description about wedding essentials",
    store: "Ilyass store",
    location: "Nabeul 8000",
    price: "500DT/DAY",
    image: "/assets/wedding-essentials.jpg",
    rating: 4,
  },
  {
    id: 5,
    title: "WEDDING ESSENTIALS",
    description: "brief description about wedding essentials",
    store: "Ilyass store",
    location: "Nabeul 8000",
    price: "500DT/DAY",
    image: "/assets/wedding-essentials.jpg",
    rating: 4,
  },
];

const categories = ["Technology", "Industries", "Vehicles", "Event", "Spaces"];
const items = {
  Technology: [
    { name: "Camera", img: "/assets/camera.jpg" },
    { name: "Laptop", img: "/assets/laptop.jpg" },
    { name: "Gaming Console", img: "/assets/console.jpg" },
    { name: "Drone", img: "/assets/drone.jpg" },
    { name: "Vacuum", img: "/assets/vacuum.jpg" },
    { name: "Projector", img: "/assets/projector.png" },
    { name: "Led-lighting", img: "/assets/led.jpg" },
  ],
  Industries: [
    { name: "Machine", img: "/assets/machine.png" },
    { name: "Equipment", img: "/assets/equipment.png" },
  ],
};
const faqs = [
  { question: "How does renting work on your platform?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What happens if an item gets damaged?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Can I cancel or modify a rental request?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Is it safe to rent from strangers?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Do you offer customer support?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What payment methods do you accept?", answer: "Lorem ipsum dolor sit amet." } // Added 6th question
];

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("Technology");
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardsToShow = 4;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items[selectedCategory].length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? items[selectedCategory].length - 1 : prev - 1
    );
  };

  const getCurrentCards = () => {
    const categoryItems = items[selectedCategory];
    const cards = [];

    for (let i = 0; i < cardsToShow; i++) {
      const index = (currentIndex + i) % categoryItems.length;
      cards.push(categoryItems[index]);
    }

    return cards;
  };

  return (
    <div className="text-center py-10">
      <h2 className="text-gray-600 uppercase">Our Stuff Categories</h2>
      <h1 className="text-3xl font-bold italic">Explore Our Categories</h1>
      <div className="flex justify-center gap-2 mt-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-lg ${
              cat === selectedCategory
                ? "bg-teal-600 text-white"
                : "bg-white border border-teal-600 text-teal-600"
            }`}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
          >
            {cat}
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
        {items[selectedCategory].map((_, index) => (
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
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold italic mb-6">Have Any Questions?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-700 py-3">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between w-full text-left font-medium"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              {openIndex === index && (
                <div className="mt-2 p-4 bg-teal-600 rounded-lg text-left">
                  <p className="text-white">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <h3 className="text-teal-400 text-lg font-semibold">DO YOU STILL HAVE QUESTIONS REGARDING OUR SERVICES?</h3>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto">
            If you have any other questions or need further assistance, feel free to contact us anytime.
          </p>
          <button className="mt-4 bg-teal-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-teal-600 transition">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % rentals.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? rentals.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative w-full h-auto">
      <div className="relative w-full h-[90vh]">
        <img src="/assets/bg.jpg" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold italic">WELCOME</h1>
          <p className="text-xl italic mt-4">Rent Camping, Fitness, Wedding and lot more other stuff</p>
          <div className="mt-8 flex gap-6">
            <button className="bg-teal-600 w-52 py-3 text-white font-semibold text-lg rounded-none">How It Works</button>
            <button className="bg-teal-600 w-52 py-3 text-white font-semibold text-lg rounded-none">Add Product</button>
          </div>
          <div className="mt-8 flex items-center bg-white rounded-full overflow-hidden w-4/5 max-w-2xl shadow-lg">
            <input type="text" placeholder="What are you looking for" className="flex-1 px-6 py-3 outline-none text-gray-600 text-lg" />
            <button className="bg-teal-600 px-10 py-3 text-white flex items-center text-lg rounded-r-full">
              <img src="/assets/loup.png" alt="Search" className="w-6 h-6 mr-2" />
              Search
            </button>
          </div>
        </div>
        <button className="absolute left-6 top-1/2 transform -translate-y-1/2" aria-label="Previous">
          <ChevronLeft className="w-12 h-12 text-white" />
        </button>
        <button className="absolute right-6 top-1/2 transform -translate-y-1/2" aria-label="Next">
          <ChevronRight className="w-12 h-12 text-white" />
        </button>
      </div>

      <div className="mt-16 px-8">
        <div className="flex justify-between items-start">
          <div className="text-left">
            <h3 className="text-gray-500 uppercase text-sm font-bold">OUR STUFFES</h3>
            <h2 className="text-3xl font-bold italic text-gray-800 relative inline-block">
              POPULAR RENTALS
              <span className="block w-16 h-1 bg-teal-600 mt-2"></span>
            </h2>
          </div>
          <div className="flex gap-2">
            <span className="w-4 h-4 bg-teal-600 rounded-full"></span>
            <span className="w-4 h-4 border border-teal-600 rounded-full"></span>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col items-center">
          <div className="flex gap-6 max-w-6xl">
            {rentals.slice(currentIndex, currentIndex + 3).map((rental) => (
              <div key={rental.id} className="bg-white shadow-lg rounded-lg overflow-hidden w-80 mx-4">
                <img src={rental.image} alt={rental.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold italic">{rental.title}</h3>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rental.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{rental.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Store className="text-red-500" size={18} />
                    <span className="text-gray-700 text-sm">{rental.store}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="text-blue-500" size={18} />
                    <span className="text-gray-700 text-sm">{rental.location}</span>
                  </div>
                </div>
                <button className="bg-teal-600 text-white text-center py-3 text-lg font-semibold w-full">STARTING FROM {rental.price}</button>
              </div>
            ))}
          </div>
          <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md" aria-label="Previous" onClick={handlePrev}>
            <ChevronLeft className="w-8 h-8 text-gray-800" />
          </button>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md" aria-label="Next" onClick={handleNext}>
            <ChevronRight className="w-8 h-8 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="mb-20"></div>

      <div className="bg-gray-900 text-white py-20 text-center relative">
        <h2 className="text-teal-400 text-lg font-semibold uppercase">Why Choose Us</h2>
        <h3 className="text-4xl font-bold italic">Our Features</h3>
        <p className="text-gray-400 mt-4 max-w-3xl mx-auto italic">
          Discover, Rent, Enjoy – Your go-to platform for hassle-free rentals of anything, anytime, from anyone. Secure, simple, and seamless.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-teal-600 p-4 rounded-lg">
              <img src="/assets/multi.png" alt="Rent from Real People" className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-semibold mt-4 italic">Rent from Real People, Anywhere</h4>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">
              Connect with a community of renters and lenders near you. Whether you’re looking for something local or unique, our platform lets you rent directly from individuals, ensuring a personalized and trustworthy experience.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-teal-600 p-4 rounded-lg">
              <img src="/assets/lock.png" alt="Secure Transactions" className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-semibold mt-4 italic">Secure and Hassle-Free Transactions</h4>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">
              We prioritize your safety with secure payments, verified users, and clear rental agreements. Enjoy peace of mind knowing every transaction is protected, so you can focus on what matters most—your experience.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-teal-600 p-4 rounded-lg">
              <img src="/assets/bonus.png" alt="Save Money" className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-semibold mt-4 italic">Save Money, Live Smarter</h4>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">
              Why buy when you can rent? Save money by renting items only when you need them. It’s a smarter, more sustainable way to access the things you love without the long-term costs or clutter.
            </p>
          </div>
        </div>
        <div className="absolute bottom-6 right-6">
          <button className="bg-teal-600 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:bg-teal-700 transition">
            Explore More
          </button>
        </div>
      </div>

      <CategoriesSection />
      <FAQSection />
    </div>
  );
};

export default LandingPage;