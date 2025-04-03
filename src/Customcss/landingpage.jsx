
import { ChevronLeft, ChevronRight, Store, MapPin, Upload, Heart, ChevronDown } from "lucide-react";
const Banner = ({ title, description, buttons, searchPlaceholder, onSearch }) => {
  return (
    <div className="relative w-full h-[90vh]">
      <img src="/assets/bg1.jpg" alt="Banner" className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <h1 className="text-5xl font-bold italic">{title}</h1>
        <p className="text-xl italic mt-4">{description}</p>
        <div className="mt-8 flex gap-6">
          {buttons.map((button, index) => (
            <button key={index} className="bg-teal-600 w-52 py-3 text-white font-semibold text-lg rounded-none">
              {button.label}
            </button>
          ))}
        </div>
        <div className="mt-8 flex items-center bg-white rounded-full overflow-hidden w-4/5 max-w-2xl shadow-lg">
          <input type="text" placeholder={searchPlaceholder} className="flex-1 px-6 py-3 outline-none text-gray-600 text-lg" />
          <button className="bg-teal-600 px-10 py-3 text-white flex items-center text-lg rounded-r-full" onClick={onSearch}>
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
  );
};
import { motion } from 'framer-motion';



import { ArrowDown } from "lucide-react";

const ProcessSection = ({ sections }) => {
  return (
    <motion.section 
      className="py-20 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className=" mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">How Renting Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to start earning from your equipment
          </p>
          <div className="w-16 h-1 bg-teal-600 mx-auto mt-6"></div>
        </div>

        <div className="flex flex-col items-center">
          {sections.map((step, index) => (
            <div key={index} className="w-full max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-white rounded-xl ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Image container with fixed aspect ratio */}
                <div className="relative w-full md:w-2/5 h-64 md:h-80 flex-shrink-0">
                  <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 md:hidden">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <motion.img
                    src={step.image}
                    alt={step.title}
                    className="rounded-lg object-cover w-full h-full"
                    whileHover={{ scale: 1.03 }}
                  />
                </div>

                {/* Content container */}
                <div className="w-full md:w-3/5">
                  <div className="hidden md:flex items-center mb-4">
                    <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                  </div>
                  <div className="md:hidden text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-teal-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {index < sections.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex justify-center my-4"
                >
                  <ArrowDown className="text-teal-600 w-8 h-8 animate-bounce" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const PopularRentals = ({ title, subtitle, rentals, currentIndex, handlePrev, handleNext }) => {
  return (
    <div className="mt-16 px-8">
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h3 className="text-gray-500 uppercase text-sm font-bold">{subtitle}</h3>
          <h2 className="text-3xl font-bold italic text-gray-800 relative inline-block">
            {title}
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
                <h3 className="text-lg font-semibold italic">{rental.stuffname}</h3>
                <div className="flex items-center mt-2">
                  {rental?.stuff_management?.rating !== undefined ? (
                    [...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(rental.stuff_management.rating) ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-300">No rating available</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2 text-sm">{rental.short_description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Store className="text-red-500" size={18} />
                  <span className="text-gray-700 text-sm">{rental.store}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="text-blue-500" size={18} />
                  <span className="text-gray-700 text-sm">{rental.location}</span>
                </div>
              </div>
              <button className="bg-teal-600 text-white text-center py-3 text-lg font-semibold w-full">STARTING FROM {rental.price_per_day} $</button>
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
  );
};


const Features = ({ title, subtitle, description, features, onExploreMore }) => {
  return (
    <div className="bg-gray-900 text-white py-20 text-center relative">
      <h2 className="text-teal-400 text-lg font-semibold uppercase">{subtitle}</h2>
      <h3 className="text-4xl font-bold italic">{title}</h3>
      <p className="text-gray-400 mt-4 max-w-3xl mx-auto italic">{description}</p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="bg-teal-600 p-4 rounded-lg">
              <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-semibold mt-4 italic">{feature.title}</h4>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">{feature.description}</p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 right-6">
        <button className="bg-teal-600 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:bg-teal-700 transition" onClick={onExploreMore}>
          Explore More
        </button>
      </div>
    </div>
  );
};

import { Building2, User } from "lucide-react"; // Using Lucide icons for consistency

const RentEquipmentChoice = () => (
  <div className="max-w-4xl mx-auto my-20 text-center">
    <h2 className="text-4xl font-bold italic mb-6 text-gray-800">
      You Have Any Equipment? <span className="text-teal-600">Choose Your Style</span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
      {/* Individual Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-teal-400"
      >
        <User className="w-14 h-14 mx-auto mb-6 text-teal-600" />
        <h3 className="text-2xl font-bold mb-3">For Individuals & Creators</h3>
        <p className="text-gray-600 mb-6">
          Rent tools for personal projects with <span className="font-semibold">no business requirements</span>. 
          Perfect for home renovations, events, or creative work.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
        >
          Start Personal Rental
        </motion.button>
      </motion.div>

      {/* Business Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-400"
      >
        <Building2 className="w-14 h-14 mx-auto mb-6 text-blue-600" />
        <h3 className="text-2xl font-bold mb-3">For Businesses & Teams</h3>
        <p className="text-gray-600 mb-6">
          <span className="font-semibold">Scale operations flexibly</span> with corporate accounts, 
          volume discounts, and dedicated support for your team.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
        >
          Explore Business Plans
        </motion.button>
      </motion.div>
    </div>

    <p className="mt-12 text-gray-500 italic">
      Join 25,000+ individuals and 3,500 businesses who rent smarter with us
    </p>
  </div>
);
import { useState } from "react";
const FAQSection = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-900 text-white py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our services
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-700 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? "rotate-180 text-teal-400" : "text-gray-400"}`} 
                />
              </button>
              
              <motion.div
                id={`faq-answer-${index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="px-4 overflow-hidden"
              >
                <div className="pb-4 text-gray-300">
                  <p>{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="text-center bg-gray-800 p-8 rounded-xl">
          <h3 className="text-teal-400 text-xl font-bold mb-3">Still have questions?</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            If you need further assistance, our team is ready to help you 24/7.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-teal-600 hover:bg-teal-500 px-8 py-3 rounded-lg text-white font-semibold transition-colors"
          >
            Contact Support
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export  {PopularRentals,Banner,Features,ProcessSection,RentEquipmentChoice,FAQSection};


