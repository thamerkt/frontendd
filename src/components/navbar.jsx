import React, { useState } from 'react';

const Navbar = () => {
    const tunisianStates = [
        'Tunis', 'Ariana', 'Ben Arous', 'La Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Beja', 'Jendouba',
        'Kef', 'Kairouan', 'Sidi Bouzid', 'Kasserine', 'Monastir', 'Mahdia', 'Sousse', 'Gabes',
        'Medenine', 'Tataouine', 'Tozeur', 'Gafsa', 'Siliana', 'Sfax'
    ];

    const [search, setSearch] = useState('');
    const [selectedStates, setSelectedStates] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [islogged, setIslogged] = useState(false);


    const handleStateChange = (state) => {
        setSelectedStates((prevState) =>
            prevState.includes(state)
                ? prevState.filter((s) => s !== state)
                : [...prevState, state]
        );
    };

    const filteredStates = tunisianStates.filter((state) =>
        state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="bg-black text-white px-20 py-4 flex justify-between items-center w-full">
                <span className="text-sm">
                    Email us at:{" "}
                    <a href="mailto:medkh@gmail.com" className="underline">
                        medkh@gmail.com
                    </a>
                </span>
                <div className="flex space-x-4">
                    <img src="/assets/f3.png" alt="Facebook" className="w-5 h-5" />
                    <img src="/assets/twitter.png" alt="Twitter" className="w-5 h-5" />
                    <img src="/assets/email.png" alt="Google" className="w-5 h-5" />
                    <img src="/assets/cart.png" alt="Cart" className="w-5 h-5" />
                </div>
            </div>

            <div className=" px-20 py-3 text-white text-20 flex items-center justify-between gap-x-2 w-full bg-[#0F0D23] space-x-5 ">
                <ul className="flex space-x-7 ml-5 ">
                    <li className="- hover:text-teal-600 ">HOME</li>
                    <li className="hover:text-teal-600 ">STUFF RENTALS</li>
                    <li className="hover:text-teal-600 ">PAGES</li>
                    <li className="hover:text-teal-600 ">ABOUT US</li>
                    <li className="hover:text-teal-600 ">ACCOUNTS</li>
                    <li className="hover:text-teal-600 ">CONTACT</li>
                </ul>
                {!islogged && (
                <div className=" px-6  flex justify-between items-center space-x-4 ">
                
                    <button className="w-full p-2 bg-teal-500 text-white text-base hover:bg-teal-600 transition duration-300 px-7">Login</button>
                    <button className="w-full text-teal-500 p-2 border-2 border-teal-500  text-base  hover:bg-teal-600  hover:text-white transition duration-300 px-7">Register</button>
                </div>
                )}
            </div>
                

            <div className="bg-white shadow-md py-10 px-40 flex items-center justify-between gap-x-2">
                <h1 className="text-4xl font-serif italic ">Everything Rentals</h1>

                <div className="flex items-center border border-gray-300 overflow-hidden">
                    <div className="relative">
                        <button
                            className="px-4 py-3 border-r border-gray-300 bg-white outline-none w-48"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Select your Area
                        </button>
                        {dropdownOpen && (
                            <div className="absolute z-10 bg-white shadow-md max-h-60 overflow-y-auto w-48 p-2 border mt-2">
                                <input
                                    type="text"
                                    className="w-full p-2 border-b mb-2"
                                    placeholder="Search states"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {filteredStates.map((state, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={state}
                                            checked={selectedStates.includes(state)}
                                            onChange={() => handleStateChange(state)}
                                        />
                                        <label htmlFor={state} className="text-sm">{state}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <select className="px-4 py-3 border-r border-gray-300 bg-white outline-none">
                        <option>Categories</option>
                        <option>Furniture</option>
                        <option>Vehicles</option>
                        <option>Electronics</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search your stuff"
                        className="px-4 py-3 outline-none"
                    />
                    <button className="bg-teal-500 text-white px-4 py-3 font-semibold">
                        SEARCH
                    </button>
                </div>
            </div>
        </>
    );
};

export default Navbar;