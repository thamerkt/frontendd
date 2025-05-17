import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, User, Clock, ArrowLeft, ArrowRight, Share2, Facebook, Twitter, Linkedin, Check, Shield, Lock, CreditCard } from "lucide-react";

const BlogPost1 = () => {
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
              src="/assets/ekrini.png"
              alt="Ekrini.tn Platform Showcase"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Ekrini.tn: Tunisia's Premier Rental Marketplace
              </h1>
              <div className="flex flex-wrap items-center text-teal-100 text-sm gap-4">
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span>May 15, 2024</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  <span>Ekrini Team</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>6 min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            <div className="prose max-w-none text-gray-700">
              <p className="lead text-xl text-gray-600 mb-8 font-medium">
                Ekrini.tn is revolutionizing Tunisia's rental economy by connecting equipment owners with those who need temporary access to tools, vehicles, and event supplies—all through a secure, user-friendly digital platform.
              </p>

              {/* Platform Overview */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <Check className="w-5 h-5" />
                  </span>
                  Comprehensive Rental Ecosystem
                </h2>
                <p>
                  Unlike traditional rental shops, Ekrini.tn offers a complete digital solution for:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-lg text-teal-700 mb-2">For Renters</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>Access to thousands of items across Tunisia</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>Competitive pricing with transparent fees</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>Insurance options for peace of mind</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-lg text-teal-700 mb-2">For Owners</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>Monetize idle equipment easily</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>Built-in contract and payment systems</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal-500 mr-2">✓</span>
                        <span>24/7 access to rental management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  Secure Payment System
                </h2>
                <p>
                  Ekrini.tn integrates multiple payment methods with advanced security:
                </p>
                <div className="my-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-teal-600 mx-auto mb-2">
                        <Lock className="w-6 h-6 mx-auto" />
                      </div>
                      <p className="text-sm font-medium">End-to-End Encryption</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-teal-600 mx-auto mb-2">
                        <Shield className="w-6 h-6 mx-auto" />
                      </div>
                      <p className="text-sm font-medium">Fraud Detection</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-teal-600 mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">2FA Authentication</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-teal-600 mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Multi-Currency</p>
                    </div>
                  </div>
                </div>
                <p>
                  Our payment gateway supports credit cards, mobile money, bank transfers, and soon cryptocurrency, with automatic reconciliation and real-time reporting for all transactions.
                </p>
              </section>

              {/* User Roles */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Platform User Roles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Administrator",
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      desc: "Manages platform operations, user verification, and content moderation"
                    },
                    {
                      title: "Partners",
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                      desc: "Service providers offering delivery, installation, and financing"
                    },
                    {
                      title: "Owners",
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
                      desc: "Equipment owners listing items for rent with flexible terms"
                    },
                    {
                      title: "Clients",
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                      desc: "Individuals and businesses renting equipment for various needs"
                    }
                  ].map((role, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors duration-300 shadow-sm hover:shadow-md">
                      <div className="text-teal-600 mb-3">
                        {role.icon}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">{role.title}</h3>
                      <p className="text-gray-600 text-sm">{role.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* App Showcase */}
              <section className="mb-12">
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="p-8 md:p-12 text-white">
                      <h2 className="text-2xl font-bold mb-4">Available on Mobile</h2>
                      <p className="mb-6 opacity-90">
                        Download the Ekrini.tn app for iOS and Android to manage rentals on the go, receive real-time notifications, and access exclusive mobile features.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center transition-colors duration-300">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                          </svg>
                          App Store
                        </button>
                        <button className="bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center transition-colors duration-300">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" />
                            <path d="M15.6667 7H17.5L13.8333 12.2667L18 17H14.3333L11.3333 13.1333L8.33333 17H6.5L10.3333 11.6667L6.33333 7H10L12.6667 10.5333L15.6667 7Z" fill="white" />
                          </svg>
                          Play Store
                        </button>
                      </div>
                    </div>
                    <div className="relative h-80 md:h-full">
                      <img
                        src="/assets/ekrini-mobile-screens.png"
                        alt="Ekrini Mobile App"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-8 text-center my-12">
                <h3 className="text-2xl font-bold text-teal-800 mb-3">Ready to Experience Ekrini?</h3>
                <p className="text-teal-700 mb-6 max-w-2xl mx-auto">
                  Join thousands of Tunisians who are saving money and making income through our trusted rental platform.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-teal-200"
                >
                  Get Started
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More About Ekrini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <Link to="/blog/partner-guide" className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/partner-guide.jpg"
                    alt="Partner Guide"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Becoming an Ekrini Partner: Complete Guide</h3>
                  <p className="text-gray-600 text-sm">April 28, 2024 • 8 min read</p>
                </div>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <Link to="/blog/safety-tips" className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/safety-tips.jpg"
                    alt="Safety Tips"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Safety Tips for Equipment Rentals in Tunisia</h3>
                  <p className="text-gray-600 text-sm">March 15, 2024 • 5 min read</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPost1;