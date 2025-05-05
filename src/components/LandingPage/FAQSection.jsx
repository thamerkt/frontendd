import { useState } from "react";
import { 
  Mail, Phone, MessageCircle, HelpCircle, Shield, CreditCard,
  Calendar, UserCheck, RefreshCw, Lock, ChevronDown, ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  // Getting Started
  { 
    question: "How does renting work on your platform?", 
    answer: "Our platform connects renters with owners. Simply browse items, select your rental dates, and make a booking request. The owner will confirm, and you'll arrange pickup or delivery details.",
    icon: <HelpCircle className="w-6 h-6 text-teal-400" />,
    category: "Getting Started"
  },
  { 
    question: "How do I create an account?", 
    answer: "Click the 'Sign Up' button in the top right corner and follow the prompts. You'll need to provide some basic information and verify your email address.",
    icon: <HelpCircle className="w-6 h-6 text-teal-400" />,
    category: "Getting Started"
  },
  { 
    question: "Is there a mobile app available?", 
    answer: "Yes, our platform is available as both a web app and native mobile apps for iOS and Android devices.",
    icon: <HelpCircle className="w-6 h-6 text-teal-400" />,
    category: "Getting Started"
  },

  // Safety
  { 
    question: "What happens if an item gets damaged?", 
    answer: "We require all renters to treat items with care. Any damages should be reported immediately. Our protection plan helps cover accidental damage, subject to terms and conditions.",
    icon: <Shield className="w-6 h-6 text-teal-400" />,
    category: "Safety"
  },
  { 
    question: "Is it safe to rent from strangers?", 
    answer: "We verify all users and provide secure messaging. Our review system helps build trust, and we offer secure payment processing. Always meet in public places for exchanges.",
    icon: <UserCheck className="w-6 h-6 text-teal-400" />,
    category: "Safety"
  },
  { 
    question: "What safety measures are in place?", 
    answer: "We require ID verification, offer secure payments, provide user reviews, and have a 24/7 support team to handle any issues.",
    icon: <Shield className="w-6 h-6 text-teal-400" />,
    category: "Safety"
  },

  // Bookings
  { 
    question: "Can I cancel or modify a rental request?", 
    answer: "Yes, you can cancel or modify requests before they're confirmed by the owner. After confirmation, cancellation policies vary by owner but are clearly stated before booking.",
    icon: <RefreshCw className="w-6 h-6 text-teal-400" />,
    category: "Bookings"
  },
  { 
    question: "How far in advance should I book?", 
    answer: "We recommend booking at least 48 hours in advance, especially for popular items. Some high-demand equipment may require even earlier booking.",
    icon: <Calendar className="w-6 h-6 text-teal-400" />,
    category: "Bookings"
  },
  { 
    question: "Can I extend my rental period?", 
    answer: "Extensions are possible if the item is available. You'll need to request an extension through the platform before your current rental period ends.",
    icon: <RefreshCw className="w-6 h-6 text-teal-400" />,
    category: "Bookings"
  },

  // Support
  { 
    question: "Do you offer customer support?", 
    answer: "Yes, our dedicated support team is available 24/7 via chat, email, and phone to assist with any issues or questions you may have about our service.",
    icon: <MessageCircle className="w-6 h-6 text-teal-400" />,
    category: "Support"
  },
  { 
    question: "How quickly do you respond to support requests?", 
    answer: "Our average response time is under 30 minutes for chat and email, and immediate for phone support during business hours.",
    icon: <MessageCircle className="w-6 h-6 text-teal-400" />,
    category: "Support"
  },
  { 
    question: "Can I get help in person?", 
    answer: "We currently offer virtual support only, but our representatives can guide you through any process step-by-step.",
    icon: <MessageCircle className="w-6 h-6 text-teal-400" />,
    category: "Support"
  },

  // Payments
  { 
    question: "What payment methods do you accept?", 
    answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. Payments are processed securely and held until after your rental period is complete.",
    icon: <CreditCard className="w-6 h-6 text-teal-400" />,
    category: "Payments"
  },
  { 
    question: "When will I be charged for my rental?", 
    answer: "Your payment method will be authorized when you book, but funds are only captured after the rental period begins and the item is confirmed as received.",
    icon: <CreditCard className="w-6 h-6 text-teal-400" />,
    category: "Payments"
  },
  { 
    question: "Are there any hidden fees?", 
    answer: "All fees are clearly displayed before you confirm your booking. These may include service fees, insurance, and optional add-ons you select.",
    icon: <CreditCard className="w-6 h-6 text-teal-400" />,
    category: "Payments"
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [displayedFAQs, setDisplayedFAQs] = useState(faqs.slice(0, 6));

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setOpenIndex(null); // Close any open FAQs when changing category
    
    if (category === "All") {
      setDisplayedFAQs(faqs.slice(0, 6));
    } else {
      const categoryFAQs = faqs.filter(faq => faq.category === category);
      setDisplayedFAQs(categoryFAQs.slice(0, 6));
    }
  };

  const categories = ["All", ...new Set(faqs.map(faq => faq.category))];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const faqVariants = {
    open: { 
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 -z-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-teal-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-24 relative">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.span 
            className="inline-block bg-teal-900/30 text-teal-400 text-sm font-medium px-4 py-1 rounded-full mb-4 border border-teal-400/20"
            variants={item}
          >
            Need Help?
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            variants={item}
          >
            Frequently Asked <span className="text-teal-400">Questions</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
            variants={item}
          >
            Everything you need to know about our rental platform
          </motion.p>
        </motion.div>

        {/* Category filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
        >
          {categories.map((category, i) => (
            <motion.button
              key={category}
              variants={item}
              custom={i}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                activeCategory === category
                  ? "bg-teal-900/30 text-teal-400 border-teal-400/20"
                  : "bg-transparent text-gray-400 border-gray-700 hover:bg-gray-800/50"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
        >
          {displayedFAQs.map((faq, index) => (
            <motion.div
              key={`${faq.category}-${index}`}
              variants={item}
              custom={index % 2}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`flex items-start w-full p-6 text-left focus:outline-none ${
                  openIndex === index ? "pb-2" : ""
                }`}
                aria-expanded={openIndex === index}
                aria-controls={`faq-${index}`}
              >
                <div className="w-10 h-10 bg-teal-900/30 rounded-lg flex items-center justify-center mr-4 border border-teal-400/20">
                  {faq.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-teal-400 text-sm"
                      >
                        {faq.category}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-teal-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-${index}`}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={faqVariants}
                    className="px-6 pb-6 text-gray-300"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div 
          className="mt-20 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700/50 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-400/20">
            <MessageCircle className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a 
              href="mailto:support@rentalapp.com" 
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <Mail className="w-5 h-5" />
              Email Support
            </motion.a>
            <motion.a 
              href="tel:+18005551234" 
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <Phone className="w-5 h-5" />
              Call Now
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}