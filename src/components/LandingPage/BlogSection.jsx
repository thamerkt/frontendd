import React from "react";
import { Link } from "react-router-dom"; // Use this if you're using React Router for navigation

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Camping Essentials for Your Next Adventure",
    excerpt:
      "Discover the must-have items for a successful camping trip. From tents to cooking gear, we've got you covered.",
    image: "/assets/blog1.jpg",
    date: "October 10, 2023",
    author: "John Doe",
    slug: "top-10-camping-essentials",
  },
  {
    id: 2,
    title: "How to Choose the Perfect Wedding Decorations",
    excerpt:
      "Planning a wedding? Learn how to select the best decorations to make your special day unforgettable.",
    image: "/assets/blog2.jpg",
    date: "October 5, 2023",
    author: "Jane Smith",
    slug: "perfect-wedding-decorations",
  },
  {
    id: 3,
    title: "Fitness Gear Rentals: Save Money, Stay Fit",
    excerpt:
      "Why buy expensive fitness equipment when you can rent? Explore the benefits of renting fitness gear.",
    image: "/assets/blog3.jpg",
    date: "September 28, 2023",
    author: "Mike Johnson",
    slug: "fitness-gear-rentals",
  },
];

export default function BlogSection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Latest Blog Posts</h2>
          <p className="text-gray-600 mt-2">
            Stay updated with the latest tips, trends, and news in the rental world.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Blog Image */}
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />

              {/* Blog Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.excerpt}</p>

                {/* Metadata (Date & Author) */}
                <div className="mt-4 text-sm text-gray-500">
                  <span>{post.date}</span> • <span>{post.author}</span>
                </div>

                {/* Read More Button */}
                <div className="mt-6">
                  <Link
                    to={`/blog/${post.slug}`} // Replace with your blog post route
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/blog" // Replace with your blog page route
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors duration-300"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}