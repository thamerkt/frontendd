import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  ArrowRight,
  Facebook, 
  Twitter, 
  Linkedin, 
  Check, 
  DollarSign, 
  Home, 
  RefreshCw,
  Wrench,
  TrendingDown,
  Package
} from "lucide-react";

const BlogPost2 = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/blog"
              className="flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Blog
            </Link>
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-teal-600 transition-colors duration-300">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="relative h-96 w-full">
            <img
              src="/assets/image.png"
              alt="Rent vs Buy Comparison"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Why Rent Instead of Buy? The Smart Consumer's Guide
              </h1>
              <div className="flex flex-wrap items-center text-teal-100 text-sm gap-4">
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span>June 2, 2024</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  <span>Sarah Johnson</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>8 min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            <div className="prose max-w-none text-gray-700">
              <p className="lead text-xl text-gray-600 mb-8 font-medium">
                In today's economy, smart consumers are discovering that renting equipment makes more financial sense than buying for many occasional-use items. Here's why renting through Ekrini.tn could be your best financial decision.
              </p>

              {/* Financial Benefits */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <DollarSign className="w-5 h-5" />
                  </span>
                  The Financial Advantages of Renting
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                  {[
                    {
                      title: "Lower Upfront Costs",
                      icon: <DollarSign className="w-6 h-6 text-teal-600" />,
                      desc: "Avoid large capital expenditures for equipment you'll rarely use"
                    },
                    {
                      title: "No Depreciation",
                      icon: <TrendingDown className="w-6 h-6 text-teal-600" />,
                      desc: "Rented equipment never loses value in your hands"
                    },
                    {
                      title: "No Maintenance Costs",
                      icon: <Wrench className="w-6 h-6 text-teal-600" />,
                      desc: "Maintenance and repairs are included in your rental"
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors duration-300 shadow-sm">
                      <div className="text-teal-600 mb-3">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Case Study */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  Real-World Savings: Power Drill Example
                </h2>
                <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-lg p-6 my-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-teal-800 mb-3">Buying Scenario</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Purchase price: $300</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Used only 13 minutes in 5 years</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Storage space required</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Total cost: $300+</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-teal-800 mb-3">Renting Scenario</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-teal-500 mr-2">✓</span>
                          <span>Rental cost: $15/day</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal-500 mr-2">✓</span>
                          <span>Used exactly when needed</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal-500 mr-2">✓</span>
                          <span>No storage needed</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal-500 mr-2">✓</span>
                          <span>Total cost: $15</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="my-6 rounded-xl overflow-hidden">
                  <img
                    src="/assets/power-drill-comparison.jpg"
                    alt="Power drill rental vs purchase comparison"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">The average power drill is used just 13 minutes in its lifetime - renting makes more sense for most homeowners</p>
                </div>
              </section>

              {/* Practical Benefits */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <Check className="w-5 h-5" />
                  </span>
                  Beyond Savings: Practical Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Home className="w-5 h-5 text-teal-600 mr-2" />
                      Space Saving
                    </h3>
                    <p className="text-gray-600">
                      Urban Tunisian homes average just 60-80m². Renting eliminates the need to store bulky equipment like ladders, pressure washers, or party supplies that you only use occasionally.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <RefreshCw className="w-5 h-5 text-teal-600 mr-2" />
                      Always Current Technology
                    </h3>
                    <p className="text-gray-600">
                      When you rent, you always get access to the latest models and technology without the hassle and cost of upgrading your owned equipment every few years.
                    </p>
                  </div>
                </div>
              </section>

              {/* When to Rent vs Buy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">When Does Renting Make Sense?</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-teal-600 text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Item Type</th>
                        <th className="py-3 px-4 text-left">Rent If...</th>
                        <th className="py-3 px-4 text-left">Buy If...</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        {
                          item: "Power Tools",
                          rent: "Using less than 5 times/year",
                          buy: "Using weekly or professionally"
                        },
                        {
                          item: "Party Equipment",
                          rent: "For special occasions",
                          buy: "Running an event business"
                        },
                        {
                          item: "Sports Gear",
                          rent: "Trying new activities",
                          buy: "Practicing daily"
                        },
                        {
                          item: "Home Improvement",
                          rent: "One-time projects",
                          buy: "Continuous renovations"
                        }
                      ].map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4 font-medium">{row.item}</td>
                          <td className="py-3 px-4">{row.rent}</td>
                          <td className="py-3 px-4">{row.buy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* CTA */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-8 text-center my-12">
                <h3 className="text-2xl font-bold text-teal-800 mb-3">Ready to Start Saving?</h3>
                <p className="text-teal-700 mb-6 max-w-2xl mx-auto">
                  Join thousands of Tunisians who are saving money and space by renting instead of buying.
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-teal-200"
                >
                  Browse Rentals
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="px-8 pb-8 md:px-12">
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Share this article</h3>
              <div className="flex space-x-4">
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors duration-300">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More Rental Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <Link to="/blog/blog1" className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/ekrini-platform.jpg"
                    alt="Ekrini Platform"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">What is Ekrini.tn? Your Ultimate Rental Marketplace</h3>
                  <p className="text-gray-600 text-sm">May 15, 2024 • 6 min read</p>
                </div>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <Link to="/blog/fitness-gear-rentals" className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/blog3.jpg"
                    alt="Fitness Equipment"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Fitness Gear Rentals: Save Money, Stay Fit</h3>
                  <p className="text-gray-600 text-sm">September 28, 2023 • 4 min read</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPost2;