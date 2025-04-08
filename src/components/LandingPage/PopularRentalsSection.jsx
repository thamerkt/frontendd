import { ChevronLeft, ChevronRight, Store, MapPin } from "lucide-react";
import { useState } from "react";

export default function PopularRentalsSection({ rentals }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSets = Math.ceil(rentals.length / 3);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSets);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSets) % totalSets);
  };

  return (
    <div className="mt-16 px-8">
      {/* Section Header */}
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h3 className="text-gray-500 uppercase text-sm font-bold">OUR STUFFES</h3>
          <h2 className="text-3xl font-bold italic text-gray-800 relative inline-block">
            POPULAR RENTALS
            <span className="block w-16 h-1 bg-teal-600 mt-2"></span>
          </h2>
        </div>
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalSets }).map((_, index) => (
            <span
              key={index}
              className={`w-4 h-4 rounded-full ${
                index === currentIndex ? "bg-teal-600" : "border border-teal-600"
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* Rental Cards */}
      <div className="relative mt-10 flex flex-col items-center">
        <div className="flex gap-6 max-w-6xl">
          {rentals.slice(currentIndex * 3, currentIndex * 3 + 3).map((rental) => (
            <div
              key={rental.id}
              className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl bg-white shadow-lg rounded-lg overflow-hidden w-80 mx-4"
            >
              {/* Rental Image */}
              <img
                src={rental.image}
                alt={rental.title}
                className="w-full h-48 object-cover"
              />
              {/* Rental Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold italic">{rental.stuffname}</h3>
                {/* Rating Stars */}
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(rental.stuff_management?.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                {/* Short Description */}
                <p className="text-gray-600 mt-2 text-sm">{rental.short_description}</p>
                {/* Store Name */}
                <div className="flex items-center gap-2 mt-3">
                  <Store className="text-red-500" size={18} />
                  <span className="text-gray-700 text-sm">{rental.store}</span>
                </div>
                {/* Location */}
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="text-blue-500" size={18} />
                  <span className="text-gray-700 text-sm">{rental.location}</span>
                </div>
              </div>
              {/* Price Button */}
              <button className="bg-teal-600 text-white text-center py-3 text-lg font-semibold w-full">
                STARTING FROM {rental.price_per_day} $
              </button>
            </div>
          ))}
        </div>
        {/* Navigation Buttons */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
          aria-label="Previous"
          onClick={handlePrev}
        >
          <ChevronLeft className="w-8 h-8 text-gray-800" />
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
          aria-label="Next"
          onClick={handleNext}
        >
          <ChevronRight className="w-8 h-8 text-gray-800" />
        </button>
      </div>
    </div>
  );
}