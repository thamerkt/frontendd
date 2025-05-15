import { useState } from "react";
import { 
  Mail, Phone, MessageCircle, HelpCircle, Shield, CreditCard,
  ChevronDown, ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Selected 6 most important FAQs (removed categories)
const faqs = [
  { 
    question: "How does renting work on your platform?", 
    answer: "Our platform connects renters with owners. Simply browse items, select your rental dates, and make a booking request. The owner will confirm, and you'll arrange pickup or delivery details.",
    icon: <HelpCircle className="w-5 h-5 text-teal-400" />,
  },
  { 
    question: "What happens if an item gets damaged?", 
    answer: "We require all renters to treat items with care. Any damages should be reported immediately. Our protection plan helps cover accidental damage, subject to terms and conditions.",
    icon: <Shield className="w-5 h-5 text-teal-400" />,
  },
  { 
    question: "Can I cancel or modify a rental request?", 
    answer: "Yes, you can cancel or modify requests before they're confirmed by the owner. After confirmation, cancellation policies vary by owner but are clearly stated before booking.",
    icon: <CreditCard className="w-5 h-5 text-teal-400" />,
  },
  { 
    question: "What payment methods do you accept?", 
    answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. Payments are processed securely and held until after your rental period is complete.",
    icon: <CreditCard className="w-5 h-5 text-teal-400" />,
  },
  { 
    question: "Do you offer customer support?", 
    answer: "Yes, our dedicated support team is available 24/7 via chat, email, and phone to assist with any issues or questions you may have about our service.",
    icon: <MessageCircle className="w-5 h-5 text-teal-400" />,
  },
  { 
    question: "Is it safe to rent from strangers?", 
    answer: "We verify all users and provide secure messaging. Our review system helps build trust, and we offer secure payment processing. Always meet in public places for exchanges.",
    icon: <Shield className="w-5 h-5 text-teal-400" />,
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
    hidden: { y: 20, opacity: 0 },
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
      
      {/* Background image */}
      <img 
        src="/assets/background.png" 
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-10 -z-20"
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-teal-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Section header */}
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.span 
            className="inline-block bg-teal-900/30 text-teal-400 text-xs font-medium px-3 py-1 rounded-full mb-3 border border-teal-400/20"
            variants={item}
          >
            Need Help?
          </motion.span>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            variants={item}
          >
            Frequently Asked <span className="text-teal-400">Questions</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-base"
            variants={item}
          >
            Everything you need to know about our rental platform <span className="text-teal-400">E</span>krini.tn
          </motion.p>
        </motion.div>

        {/* FAQ Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={item}
              custom={index % 2}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`flex items-start w-full p-4 text-left focus:outline-none ${
                  openIndex === index ? "pb-1" : ""
                }`}
                aria-expanded={openIndex === index}
                aria-controls={`faq-${index}`}
              >
                <div className="w-8 h-8 bg-teal-900/30 rounded-lg flex items-center justify-center mr-3 border border-teal-400/20">
                  {faq.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">
                    {faq.question}
                  </h3>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-teal-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
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
                    className="px-4 pb-4 text-gray-300 text-sm"
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
          className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700/50 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-400/20">
            <MessageCircle className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-400 mb-4 text-sm">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a 
              href="mailto:support@rentalapp.com" 
              className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              whileHover={{ y: -1 }}
            >
              <Mail className="w-4 h-4" />
              Email Support
            </motion.a>
            <motion.a 
              href="tel:+18005551234" 
              className="flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              whileHover={{ y: -1 }}
            >
              <Phone className="w-4 h-4" />
              Call Now
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}