import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Check,
  ArrowRight,

  PartyPopper,
  Wrench, // Replaced Tool with Wrench
  Dumbbell,
  Camera,
  Music,
  Car,
  Tent,
  Sofa,
  Drill
} from "lucide-react";

const BlogPost3 = () => {
  const categories = [
    {
      name: "Party Equipment",
      icon: <PartyPopper className="w-8 h-8 text-teal-600" />,
      examples: "Tents, chairs, sound systems, decorations"
    },
    {
      name: "Construction Tools",
      icon: <Wrench className="w-8 h-8 text-teal-600" />, // Changed from Tool to Wrench
      examples: "Power drills, cement mixers, scaffolding"
    },
    {
      name: "Fitness Gear",
      icon: <Dumbbell className="w-8 h-8 text-teal-600" />,
      examples: "Treadmills, weights, yoga mats"
    },
    {
      name: "Photography",
      icon: <Camera className="w-8 h-8 text-teal-600" />,
      examples: "Cameras, lenses, lighting equipment"
    },
    {
      name: "Music Instruments",
      icon: <Music className="w-8 h-8 text-teal-600" />,
      examples: "Guitars, keyboards, drum sets"
    },
    {
      name: "Vehicles",
      icon: <Car className="w-8 h-8 text-teal-600" />,
      examples: "Cars, trucks, scooters for events"
    },
    {
      name: "Outdoor Gear",
      icon: <Tent className="w-8 h-8 text-teal-600" />,
      examples: "Camping equipment, hiking gear"
    },
    {
      name: "Home Appliances",
      icon: <Sofa className="w-8 h-8 text-teal-600" />,
      examples: "Air conditioners, furniture, cleaning machines"
    },
    {
      name: "DIY Tools",
      icon: <Drill className="w-8 h-8 text-teal-600" />,
      examples: "Hand tools, power tools, ladders"
    }
  ];

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
              src="/assets/all-categories-hero.jpg"
              alt="Various rental categories on Ekrini.tn"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Rent Any Equipment You Can Imagine on Ekrini.tn
              </h1>
              <div className="flex flex-wrap items-center text-teal-100 text-sm gap-4">
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span>June 10, 2024</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  <span>Ekrini Team</span>
                </div>
                <div className="flex items-center bg-teal-600/90 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>5 min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            <div className="prose max-w-none text-gray-700">
              <p className="lead text-xl text-gray-600 mb-8 font-medium">
                Ekrini.tn offers Tunisia's most diverse rental marketplace with equipment for every need imaginable. 
                Whether you're planning an event, tackling a project, or trying something new, we've got you covered.
              </p>

              {/* Categories Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                    <Check className="w-5 h-5" />
                  </span>
                  Explore Our Rental Categories
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                  {categories.map((category, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors duration-300 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="mr-3 p-2 bg-teal-50 rounded-full">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800">{category.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm pl-11">Examples: {category.examples}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Benefits Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Why Choose Ekrini for All Your Rental Needs?</h2>
                
                <div className="bg-teal-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Widest Selection</h3>
                      <p className="text-gray-600 text-sm">Thousands of items across dozens of categories</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Verified Quality</h3>
                      <p className="text-gray-600 text-sm">All equipment is inspected and well-maintained</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Flexible Payments</h3>
                      <p className="text-gray-600 text-sm">Multiple payment options including installments</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How It Works */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">How Renting Works on Ekrini.tn</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Browse or Search</h3>
                      <p className="text-gray-600">
                        Find exactly what you need using our intuitive search or browse popular categories. Filter by location, price, and availability.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Book with Confidence</h3>
                      <p className="text-gray-600">
                        View detailed descriptions, photos, and renter reviews. Message the owner with any questions before booking.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Pick Up or Get Delivery</h3>
                      <p className="text-gray-600">
                        Arrange to pick up the equipment or have it delivered to your location. Many items offer contactless pickup options.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Enjoy and Return</h3>
                      <p className="text-gray-600">
                        Use the equipment for your project or event, then return it as agreed. Our platform handles payments securely.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-8 text-center my-12">
                <h3 className="text-2xl font-bold text-teal-800 mb-3">Ready to Find Your Perfect Rental?</h3>
                <p className="text-teal-700 mb-6 max-w-2xl mx-auto">
                  Join thousands of Tunisians who are discovering the convenience and savings of renting through Ekrini.tn
                </p>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-teal-200"
                >
                  Browse All Categories
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
              <Link to="/blog/blog2" className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/assets/rent-vs-buy.jpg"
                    alt="Rent vs Buy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Why Rent Instead of Buy? The Smart Consumer's Guide</h3>
                  <p className="text-gray-600 text-sm">June 2, 2024 • 8 min read</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPost3;