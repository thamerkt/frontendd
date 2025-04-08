import { motion } from "framer-motion";

export default function WhyChooseUsSection() {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for the children
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="bg-gray-900 text-white py-20 text-center relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.h2
        className="text-teal-400 text-lg font-semibold uppercase"
        variants={itemVariants}
      >
        Why Choose Us
      </motion.h2>
      <motion.h3
        className="text-4xl font-bold italic mt-2"
        variants={itemVariants}
      >
        Our Features
      </motion.h3>
      <motion.p
        className="text-gray-400 mt-4 max-w-3xl mx-auto italic"
        variants={itemVariants}
      >
        Discover, Rent, Enjoy – Your go-to platform for hassle-free rentals of anything, anytime, from anyone. Secure, simple, and seamless.
      </motion.p>
      <motion.div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={containerVariants}
      >
        {[
          {
            icon: "/assets/multi.png",
            title: "Rent from Real People, Anywhere",
            description: "Connect with a community of renters and lenders near you...",
          },
          {
            icon: "/assets/lock.png",
            title: "Secure and Hassle-Free Transactions",
            description: "We prioritize your safety with secure payments...",
          },
          {
            icon: "/assets/bonus.png",
            title: "Save Money, Live Smarter",
            description: "Why buy when you can rent? Save money by renting items...",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            variants={itemVariants}
          >
            <div className="bg-teal-600 p-4 rounded-lg">
              <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-semibold mt-4 italic">{feature.title}</h4>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-6"
        variants={itemVariants}
      >
        <motion.button
          className="bg-teal-600 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:bg-teal-700 transition"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Explore More
        </motion.button>
      </motion.div>
    </motion.div>
  );
}