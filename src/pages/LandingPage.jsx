import {
  HeroSection,
  PopularRentalsSection,
  WhyChooseUsSection,
  CategoriesSection,
  FAQSection,
  BlogSection, // Import the BlogSection
} from "../components/LandingPage";
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // Import the up arrow icon
import EquipmentService from "../services/EquipmentService";

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rentals, setRentals] = useState([]);
  const [showButton, setShowButton] = useState(false); // State to control button visibility

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % rentals.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? rentals.length - 1 : prev - 1));
  };

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  };

  // Effect to show/hide the button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch rentals data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await EquipmentService.fetchRentals();
        setRentals(data);
      } catch (e) {
        console.error("Error fetching history data:", e.message);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative w-full h-auto">
      {/* Hero Section */}
      <HeroSection />

      {/* Popular Rentals Section */}
      <div className="mt-24"> {/* Increased margin-top */}
        <PopularRentalsSection
          rentals={rentals}
          currentIndex={currentIndex}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />
      </div>

      {/* Why Choose Us Section */}
      <div className="mt-24"> {/* Increased margin-top */}
        <WhyChooseUsSection />
      </div>

      {/* Categories Section */}
      <div className="mt-24"> {/* Increased margin-top */}
        <CategoriesSection />
      </div>

      {/* FAQ Section */}
      <div className="mt-24"> {/* Increased margin-top */}
        <FAQSection />
      </div>

      {/* Blog Section */}
      <div className="mt-24"> {/* Added margin-top */}
        <BlogSection />
      </div>

      {/* Back to Top Button */}
      {showButton && (
        <div className="fixed right-8 bottom-8 z-50">
          <button
            onClick={scrollToTop}
            className="bg-teal-600 p-3 rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300"
          >
            <ArrowUp className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;