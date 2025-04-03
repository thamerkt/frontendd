import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    // Default states (Tunisian states as fallback)
    const tunisianStates = [
        'Tunis', 'Ariana', 'Ben Arous', 'La Manouba', 'Nabeul', 'Zaghouan', 
        'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Kairouan', 'Sidi Bouzid', 
        'Kasserine', 'Monastir', 'Mahdia', 'Sousse', 'Gabes', 'Medenine', 
        'Tataouine', 'Tozeur', 'Gafsa', 'Siliana', 'Sfax'
    ];

    const countryStates = {
        'TN': tunisianStates,
        'US': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', /* ... */],
        'FR': ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', /* ... */],
        // Add more countries as needed
    };

    const [availableStates, setAvailableStates] = useState(tunisianStates);
    const [search, setSearch] = useState('');
    const [selectedStates, setSelectedStates] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [islogged, setIslogged] = useState(false);
    const [userCountry, setUserCountry] = useState('TN'); // Default to Tunisia
    const location = useLocation();
    const navigate = useNavigate();

    const isRegisterPage = location.pathname.startsWith('/register');
    const isLogginPage = location.pathname.startsWith('/login');
    const adminpage = location.pathname.startsWith('/admin');

    useEffect(() => {
        // Detect user's country based on IP
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                setUserCountry(data.country);
                
                // Set states based on detected country
                if (countryStates[data.country]) {
                    setAvailableStates(countryStates[data.country]);
                }
            } catch (error) {
                console.error("Could not detect country:", error);
                // Fallback to Tunisian states
                setAvailableStates(tunisianStates);
            }
        };

        detectCountry();
    }, []);

    const handleStateChange = (state) => {
        setSelectedStates((prevState) =>
            prevState.includes(state)
                ? prevState.filter((s) => s !== state)
                : [...prevState, state]
        );
    };

    const filteredStates = availableStates.filter((state) =>
        state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {!isRegisterPage && !isLogginPage && !adminpage && (
                <>
                    {/* Top black bar */}
                    <div className="bg-black text-white px-4 md:px-20 py-2 md:py-4 flex flex-col md:flex-row justify-between items-center w-full">
                        <span className="text-xs md:text-sm mb-2 md:mb-0">
                            Email us at:{" "}
                            <a href="mailto:medkh@gmail.com" className="underline">
                                medkh@gmail.com
                            </a>
                        </span>
                        <div className="flex space-x-4">
                            <img src="/assets/f3.png" alt="Facebook" className="w-4 h-4 md:w-5 md:h-5" />
                            <img src="/assets/twitter.png" alt="Twitter" className="w-4 h-4 md:w-5 md:h-5" />
                            <img src="/assets/email.png" alt="Google" className="w-4 h-4 md:w-5 md:h-5" />
                            <img src="/assets/cart.png" alt="Cart" className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>

                    {/* Main navigation */}
                    <div className="px-4 md:px-20 py-2 md:py-3 text-white text-lg flex flex-col md:flex-row items-center justify-between w-full bg-[#0F0D23]">
                        <ul className="flex flex-wrap justify-center md:flex-nowrap space-x-2 md:space-x-7 mb-2 md:mb-0">
                            <li className="hover:text-teal-600 cursor-pointer px-1">HOME</li>
                            <li className="hover:text-teal-600 cursor-pointer px-1">STUFF RENTALS</li>
                            <li className="hover:text-teal-600 cursor-pointer px-1">PAGES</li>
                            <li className="hover:text-teal-600 cursor-pointer px-1">ABOUT US</li>
                            <li className="hover:text-teal-600 cursor-pointer px-1">ACCOUNTS</li>
                            <li className="hover:text-teal-600 cursor-pointer px-1">CONTACT</li>
                        </ul>
                        {!islogged && (
                            <div className="flex space-x-2 md:space-x-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="p-1 md:p-2 bg-teal-500 text-white text-sm md:text-base hover:bg-teal-600 transition duration-300 px-3 md:px-7"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="p-1 md:p-2 text-teal-500 border border-teal-500 text-sm md:text-base hover:bg-teal-600 hover:text-white transition duration-300 px-3 md:px-7"
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Search bar section */}
            {!isRegisterPage && !isLogginPage && !adminpage && (
                <div className="bg-white shadow-md py-4 md:py-10 px-4 md:px-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 w-full">
                    <h1 className="text-2xl md:text-4xl font-serif italic text-center md:text-left">Everything Rentals</h1>

                    <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch border border-gray-300 rounded-md overflow-hidden">
                        <div className="relative flex-1">
                            <button
                                className="px-3 py-2 md:px-4 md:py-3 border-r border-gray-300 bg-white outline-none w-full text-left"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {selectedStates.length > 0 ? selectedStates.join(', ') : 'Select your Area'}
                            </button>
                            {dropdownOpen && (
                                <div className="absolute z-10 bg-white shadow-lg max-h-60 overflow-y-auto w-full md:w-64 p-2 border mt-1 rounded-md">
                                    <input
                                        type="text"
                                        className="w-full p-2 border-b mb-2 text-sm"
                                        placeholder="Search states"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredStates.map((state, index) => (
                                            <div key={index} className="flex items-center space-x-2 p-1 hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    id={`state-${index}`}
                                                    checked={selectedStates.includes(state)}
                                                    onChange={() => handleStateChange(state)}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor={`state-${index}`} className="text-sm cursor-pointer">{state}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <select className="px-3 py-2 md:px-4 md:py-3 border-r border-gray-300 bg-white outline-none text-sm md:text-base">
                            <option>Categories</option>
                            <option>Furniture</option>
                            <option>Vehicles</option>
                            <option>Electronics</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search your stuff"
                            className="px-3 py-2 md:px-4 md:py-3 outline-none flex-1 text-sm md:text-base"
                        />
                        <button className="bg-teal-500 text-white px-3 py-2 md:px-4 md:py-3 font-semibold text-sm md:text-base hover:bg-teal-600 transition duration-300">
                            SEARCH
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;