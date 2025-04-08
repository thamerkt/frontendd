import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      image: "/assets/bg1.jpg",
      title: "WELCOME",
      description: "Rent Camping, Fitness, Wedding and lot more other stuff",
    },
    {
      image: "/assets/bg2.jpg",
      title: "EXPLORE",
      description: "Find the best rental deals for your next adventure",
    },
    {
      image: "/assets/bg3.jpg",
      title: "DISCOVER",
      description: "Your one-stop shop for all rental needs",
    },
  ];

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Automatic background change every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 4000); // Changed to 4000 milliseconds (4 seconds)

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [currentIndex]); // Re-run effect when currentIndex changes

  return (
    <div className="relative w-full h-[70vh]"> {/* Reduced height to 70vh */}
      <img
        src={slides[currentIndex].image}
        alt="Banner"
        className="w-full h-full object-cover transition-opacity duration-1000"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <h1 className="text-5xl font-bold italic">{slides[currentIndex].title}</h1>
        <p className="text-xl italic mt-4">{slides[currentIndex].description}</p>
        <div className="mt-8 flex gap-6">
          <button className="bg-teal-600 w-52 py-3 text-white font-semibold text-lg rounded-none hover:bg-teal-700 transition-all duration-300 transform hover:scale-105">
            How It Works
          </button>
          <button className="bg-teal-600 w-52 py-3 text-white font-semibold text-lg rounded-none hover:bg-teal-700 transition-all duration-300 transform hover:scale-105">
            Add Product
          </button>
        </div>
        <div className="mt-8 flex items-center bg-white rounded-full overflow-hidden w-4/5 max-w-2xl shadow-lg">
          <input
            type="text"
            placeholder="What are you looking for"
            className="flex-1 px-6 py-3 outline-none text-gray-600 text-lg"
          />
          <button className="bg-teal-600 px-10 py-3 text-white flex items-center text-lg rounded-r-full hover:bg-teal-700 transition-all duration-300">
            <img src="/assets/loup.png" alt="Search" className="w-6 h-6 mr-2" />
            Search
          </button>
        </div>
      </div>
      <button
        className="absolute left-6 top-1/2 transform -translate-y-1/2"
        aria-label="Previous"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-12 h-12 text-white hover:text-teal-600 transition-all duration-300" />
      </button>
      <button
        className="absolute right-6 top-1/2 transform -translate-y-1/2"
        aria-label="Next"
        onClick={goToNext}
      >
        <ChevronRight className="w-12 h-12 text-white hover:text-teal-600 transition-all duration-300" />
      </button>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-teal-600" : "bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}