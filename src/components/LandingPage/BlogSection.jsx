import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "What is Ekrini.tn? Your Ultimate Rental Marketplace in Tunisia",
    excerpt:
      "Discover Ekrini.tn, Tunisia's premier platform for renting everything from party equipment to construction tools.",
    image: "/assets/ekrini.png",
    date: "May 15, 2024",
    author: "Ekrini Team",
    slug: "blog1",
    readTime: "6 min read"
  },
  {
    id: 2,
    title: "Why Rent Instead of Buy? The Smart Consumer's Guide",
    excerpt:
      "Discover the financial and practical benefits of renting over buying for equipment you use occasionally.",
    image: "/assets/rent-vs-buy.png",
    date: "June 2, 2024",
    author: "Sarah Johnson",
    slug: "blog2",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Rent Any Equipment You Can Imagine on Ekrini.tn",
    excerpt:
      "From party supplies to industrial tools - discover the endless rental possibilities on Tunisia's premier platform.",
    image: "/assets/rentt.jpg",
    date: "June 10, 2024",
    author: "Ekrini Team",
    slug: "blog3",
    readTime: "5 min read"
  },
];

const BlogCard = ({ post, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden h-60">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <span className="inline-block bg-teal-600 text-white text-xs px-2 py-1 rounded-md">
            {post.readTime}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <div className="flex items-center mr-4">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{post.author}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors duration-300"
        >
          Read more <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function BlogSection() {
  return (
    <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-teal-100 text-teal-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Blog & News
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Latest From Our Blog
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest tips, trends, and news in the rental world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            to="/blog"
            className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-teal-200"
          >
            View All Articles
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}