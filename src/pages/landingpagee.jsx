import { useState, useEffect, useRef } from 'react';
import {ChevronLeft,ChevronRight,Store,MapPin,Upload,Heart,ChevronDown,DollarSign,Shield,Zap,CheckCircle,Building2,BarChart2,Users,BadgeDollarSign
} from "lucide-react";
import { motion, useAnimation, useInView } from 'framer-motion';
import { Banner, PopularRentals, Features ,ProcessSection,RentEquipmentChoice,FAQSection} from '../Customcss/landingpage'
import EquipmentService from '../services/EquipmentService';

const LandingPagee = () => {
    const [rentalsData,setRentaldata]=useState([])
    const faqs = [
        { question: "How does renting work on your platform?", answer: "Lorem ipsum dolor sit amet." },
        { question: "What happens if an item gets damaged?", answer: "Lorem ipsum dolor sit amet." },
        { question: "Can I cancel or modify a rental request?", answer: "Lorem ipsum dolor sit amet." },
        { question: "Is it safe to rent from strangers?", answer: "Lorem ipsum dolor sit amet." },
        { question: "Do you offer customer support?", answer: "Lorem ipsum dolor sit amet." },
        { question: "What payment methods do you accept?", answer: "Lorem ipsum dolor sit amet." } // Added 6th question
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
        description: "Connect with Customers arround the world and list your own items for rent",
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
            description: "Connect with a community of renters and lenders near you. Whether you’re looking for something local or unique, our platform lets you rent directly from individuals, ensuring a personalized and trustworthy experience."
          },
          {
            icon: "/assets/lock.png",
            title: "Secure and Hassle-Free Transactions",
            description: "We prioritize your safety with secure payments, verified users, and clear rental agreements. Enjoy peace of mind knowing every transaction is protected, so you can focus on what matters most—your experience."
          },
          {
            icon: "/assets/bonus.png",
            title: "Save Money, Live Smarter",
            description: "Why buy when you can rent? Save money by renting items only when you need them. It’s a smarter, more sustainable way to access the things you love without the long-term costs or clutter."
          }
    ];

    // Animation controls
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        const fetchData = async () => {
            if (isInView) {
                controls.start("visible");
            }
            try {
                const data = await EquipmentService.fetchRentals();
                setRentaldata(data);
            } catch (error) {
                console.error("Error fetching rental data:", error);
            }
        };
    
        fetchData();
    }, [isInView, controls]);

    // Carousel state
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? rentalsData.length - 3 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= rentalsData.length - 3 ? 0 : prev + 1));
    };

    return (
        <div className="overflow-hidden">
           
            {/* Hero Banner with Animation */}
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
            <RentEquipmentChoice/>
            {/* How It Works Section */}
           
            <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProcessSection sections={processSteps} />
    </motion.div>
            <motion.section
                className="py-20 bg-gray-50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold italic text-gray-800">Turn Your Idle Equipment Into Income</h2>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                            Your unused tools and equipment could be earning you money right now
                        </p>
                        <div className="w-16 h-1 bg-teal-600 mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <motion.div
                            className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-teal-600"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                            <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                                <DollarSign className="text-teal-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Earn Passive Income</h3>
                            <p className="text-gray-600 mb-4">
                                Make money from equipment that's sitting idle in your garage or storage.
                                The average user earns <span className="font-bold">$300+/month</span> per listed item.
                            </p>
                            <button className="text-teal-600 font-semibold flex items-center">
                                See earnings calculator <ChevronRight className="ml-1" size={18} />
                            </button>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-teal-600"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                            <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                                <Shield className="text-teal-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Full Protection</h3>
                            <p className="text-gray-600 mb-4">
                                Our <span className="font-bold">$1M damage protection</span> and verified renter system
                                gives you peace of mind. You're in control with custom rental terms.
                            </p>
                            <button className="text-teal-600 font-semibold flex items-center">
                                How protection works <ChevronRight className="ml-1" size={18} />
                            </button>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-teal-600"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                            <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                                <Zap className="text-teal-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Easy Management</h3>
                            <p className="text-gray-600 mb-4">
                                List in <span className="font-bold">under 5 minutes</span>. Our tools handle scheduling,
                                payments, and messaging so you can focus on earning.
                            </p>
                            <button className="text-teal-600 font-semibold flex items-center">
                                Start listing now <ChevronRight className="ml-1" size={18} />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Popular Rentals with Animation */}
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

            {/* Testimonials with Animation */}
            <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="py-20 bg-gray-50 relative"
>
    {/* Chevron background */}
    <div className="absolute top-0 left-0 w-full h-12 -mt-12">
        <svg 
            className="w-full h-full text-gray-50" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
        >
            <polygon points="0,100 50,0 100,100" fill="currentColor"/>
        </svg>
    </div>
    
    <div className="container mx-auto px-6">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold italic text-gray-800">What Our Users Say</h2>
            <div className="w-16 h-1 bg-teal-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
                {
                    quote: "This platform helped me monetize my construction equipment during downtime. The process was seamless and profitable.",
                    author: "Mohamed K.",
                    role: "Equipment Owner"
                },
                {
                    quote: "Finding quality equipment rentals has never been easier. Saved me time and money on my latest project.",
                    author: "Sarah L.",
                    role: "Contractor"
                },
                {
                    quote: "The platform's verification system gave me confidence in renting from other users. Excellent service all around.",
                    author: "James T.",
                    role: "Project Manager"
                }
            ].map((testimonial, index) => (
                <motion.div
                    key={index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <div className="text-teal-600 text-4xl mb-4">"</div>
                    <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
                    <div className="flex items-center">
                        <div className="bg-teal-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
                            {testimonial.author.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <h4 className="font-semibold">{testimonial.author}</h4>
                            <p className="text-gray-500 text-sm">{testimonial.role}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>

    {/* Bottom chevron */}
    <div className="absolute bottom-0 left-0 w-full h-12 -mb-12 rotate-180">
        <svg 
            className="w-full h-full text-gray-50" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
        >
            <polygon points="0,100 50,0 100,100" fill="currentColor"/>
        </svg>
    </div>
</motion.section>

            {/* CTA Section with Animation */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-20 bg-teal-600 text-white text-center"
            >
                <div className="container mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold italic mb-6"
                        whileHover={{ scale: 1.05 }}
                    >
                        Ready to Get Started?
                    </motion.h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto">
                        Join thousands of equipment owners and renters in our growing community
                    </p>
                    <motion.div
                        className="flex flex-col sm:flex-row justify-center gap-6"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-teal-600 px-8 py-4 text-lg font-semibold rounded-lg shadow-md"
                        >
                            List Your Equipment
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-transparent border-2 border-white px-8 py-4 text-lg font-semibold rounded-lg"
                        >
                            Browse Rentals
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>
            <FAQSection faqs={faqs}/>
        </div>
    );
};

export default LandingPagee;