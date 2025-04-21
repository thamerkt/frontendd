import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Store, MapPin, Upload, Heart, ChevronDown,
  DollarSign, Shield, Zap, CheckCircle, Building2, BarChart2, Users,
  BadgeDollarSign, ArrowRight, Star
} from "lucide-react";
import { motion, useAnimation, useInView } from 'framer-motion';
import { Banner, PopularRentals, Features, ProcessSection, RentEquipmentChoice, FAQSection } from '../Customcss/landingpage';
import EquipmentService from '../services/EquipmentService';

const LandingPagee = () => {
  const [rentalsData, setRentaldata] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Data
  const faqs = [
    { question: "How does renting work on your platform?", answer: "Lorem ipsum dolor sit amet." },
    { question: "What happens if an item gets damaged?", answer: "Lorem ipsum dolor sit amet." },
    { question: "Can I cancel or modify a rental request?", answer: "Lorem ipsum dolor sit amet." },
    { question: "Is it safe to rent from strangers?", answer: "Lorem ipsum dolor sit amet." },
    { question: "Do you offer customer support?", answer: "Lorem ipsum dolor sit amet." },
    { question: "What payment methods do you accept?", answer: "Lorem ipsum dolor sit amet." }
  ];

  const processSteps = [
    {
      title: "List Your Equipment",
      description: "Create your listing in minutes with our simple process",
      image: "/assets/listing-product.jpg",
      features: [
        "Upload photos and details of your equipment",
        "Set your own rental price and availability",
        "Add custom rental terms and requirements"
      ]
    },
    {
      title: "Manage Bookings",
      description: "We handle the logistics so you don't have to",
      image: "/assets/book.jpg",
      features: [
        "Get booking requests from verified renters",
        "Automated scheduling calendar",
        "Secure messaging system"
      ]
    },
    {
      title: "Get Paid Securely",
      description: "Receive payments directly to your account",
      image: "/assets/Credit Card Security.jpg",
      features: [
        "Protected by our $1M damage guarantee",
        "Direct deposit to your bank account",
        "Detailed earnings reports"
      ]
    }
  ];

  const bannerData = {
    title: "Your Tools Are Wasting Money. Rent Them Out!",
    description: "Connect with Customers around the world and list your own items for rent",
    buttons: [
      { label: "List Your Equipment" },
      { label: "Browse Rentals" }
    ],
    searchPlaceholder: "Search for equipment, tools, or vehicles..."
  };

  const featuresData = [
    {
      icon: "/assets/Credit Card Security.png",
      title: "Rent from Real People, Anywhere",
      description: "Connect with a community of renters and lenders near you. Whether you're looking for something local or unique, our platform lets you rent directly from individuals, ensuring a personalized and trustworthy experience."
    },
    {
      icon: "/assets/lock.png",
      title: "Secure and Hassle-Free Transactions",
      description: "We prioritize your safety with secure payments, verified users, and clear rental agreements. Enjoy peace of mind knowing every transaction is protected, so you can focus on what matters most—your experience."
    },
    {
      icon: "/assets/bonus.png",
      title: "Save Money, Live Smarter",
      description: "Why buy when you can rent? Save money by renting items only when you need them. It's a smarter, more sustainable way to access the things you love without the long-term costs or clutter."
    }
  ];

  // Handlers
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? rentalsData.length - 3 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= rentalsData.length - 3 ? 0 : prev + 1));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isInView) controls.start("visible");
      try {
        const data = await EquipmentService.fetchRentals();
        setRentaldata(data);
      } catch (error) {
        console.error("Error fetching rental data:", error);
      }
    };
    fetchData();
  }, [isInView, controls]);

  return (
    <div className="overflow-hidden">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Banner
          {...bannerData}
          onSearch={() => console.log("Search initiated")}
        />
      </motion.div>

      {/* Equipment Choice */}
      <RentEquipmentChoice/>

      {/* Process Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProcessSection sections={processSteps} />
      </motion.div>

      {/* Benefits Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              MONETIZE YOUR ASSETS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Turn Your Idle Equipment <span className="text-teal-600">Into Income</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Your unused tools and equipment could be earning you money right now
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <DollarSign className="w-6 h-6 text-teal-600" />,
                title: "Earn Passive Income",
                description: "Make money from equipment that's sitting idle. The average user earns $300+/month per listed item.",
                cta: "See earnings calculator"
              },
              {
                icon: <Shield className="w-6 h-6 text-teal-600" />,
                title: "Full Protection",
                description: "Our $1M damage protection and verified renter system gives you peace of mind.",
                cta: "How protection works"
              },
              {
                icon: <Zap className="w-6 h-6 text-teal-600" />,
                title: "Easy Management",
                description: "List in under 5 minutes. Our tools handle scheduling and payments automatically.",
                cta: "Start listing now"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                whileHover={{ y: -8 }}
              >
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 mb-6">{benefit.description}</p>
                <button className="text-teal-600 font-semibold flex items-center group">
                  {benefit.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Popular Rentals */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <PopularRentals
          title="Trending Rentals"
          subtitle="Find what you need"
          rentals={rentalsData}
          currentIndex={currentIndex}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      </motion.section>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Features
          title="Why Choose Our Platform"
          subtitle="Benefits"
          description="We connect equipment owners with renters in a secure, efficient marketplace"
          features={featuresData}
          onExploreMore={() => console.log("Explore more clicked")}
        />
      </motion.div>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gray-50 relative"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-4xl mx-auto px-6"
          >
            <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands of <span className="text-teal-600">Satisfied Users</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "This platform helped me monetize my construction equipment during downtime. The process was seamless and profitable.",
                author: "Mohamed K.",
                role: "Equipment Owner",
                rating: 5
              },
              {
                quote: "Finding quality equipment rentals has never been easier. Saved me time and money on my latest project.",
                author: "Sarah L.",
                role: "Contractor",
                rating: 5
              },
              {
                quote: "The platform's verification system gave me confidence in renting from other users. Excellent service all around.",
                author: "James T.",
                role: "Project Manager",
                rating: 4
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                whileHover={{ y: -8 }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <div className="text-teal-600 text-3xl mb-4">"</div>
                <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 bg-gradient-to-r from-teal-600 to-teal-500 text-white py-16 rounded-xl mx-6"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              whileHover={{ scale: 1.02 }}
            >
              Ready to Get Started?
            </motion.h2>
            <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
              Join thousands of equipment owners and renters in our growing community
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-teal-600 px-8 py-3.5 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                List Your Equipment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white px-8 py-3.5 text-lg font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Browse Rentals
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* FAQ Section */}
      <FAQSection faqs={faqs}/>
    </div>
  );
};

export default LandingPagee;