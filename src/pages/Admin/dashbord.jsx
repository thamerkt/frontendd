import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

import SidebarAdmin from '../../components/Admin/sidebar'
import { FaBell } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import "chart.js/auto";
import { useState } from "react";
import Footer from "../../components/footer"
import React from 'react';
import BookingComponent from '../../components/Admin/Booking';
import ClientComponent from "../../components/Admin/clients"



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [timeframe, setTimeframe] = useState("Days");
    const [date, setDate] = useState(new Date()); // État du calendrier

    const dataSets = {
        Days: [500000, 950000, 200000, 400000, 600000, 300000, 800000],
        Weeks: [2000000, 2500000, 2200000, 2800000, 2600000, 2700000, 2900000],
        Months: [5000000, 5200000, 5100000, 5300000, 5400000, 5500000, 5600000],
        Years: [10000000, 12000000, 15000000, 14000000, 13000000, 16000000, 17000000],
    };

    const barData = {
        labels: ["1", "2", "4", "5", "6", "7", "8"],
        datasets: [
            {
                label: `Revenue (${timeframe})`,
                data: dataSets[timeframe],
                backgroundColor: "#2EA099",
                borderRadius: 5,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
    };
    
    return (
        <>
            <div className="flex flex-1 w-full">
                <div>
                    
                </div>
                <div className="p-5 w-full">
                    <nav className=" py-3 px-6 flex  items-right justify-end">

                        <div className="flex items-center gap-6">

                            <div className="relative cursor-pointer">
                                <FaBell className="text-gray-600 text-xl hover:text-blue-500" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                            </div>

                            <img src="/assets/apple.png" className="text-gray-700 text-3xl cursor-pointer hover:text-blue-500" />
                        </div>
                    </nav>
                    <h1 className="text-2xl font-semibold">
                        Welcome <span className="text-teal-500">Alex!</span>
                    </h1>
                    <p className="text-xl text-cyan-600 mt-3">Dashboard</p>

                    <div className="grid grid-cols-4 gap-4 mt-5">
                        <div className="p-4 bg-white rounded-lg shadow-md"><div className="flex flex-1 justify-between">Products <img width={40} height={25} src="/assets/box.png" alt="" /></div><span className="text-2xl text-teal-500 font-bold">45</span><br /><span className="text-l">Since last week</span></div>
                        <div className="p-4 bg-white rounded-lg shadow-md"><div className="flex flex-1 justify-between">Products<img width={40} height={25} src="/assets/box.png" alt="" /></div><span className="text-2xl text-teal-500 font-bold">6</span><br /><span className="text-l">Since last week</span></div>
                        <div className="p-4 bg-white rounded-lg shadow-md"><div className="flex flex-1 justify-between">Clients<img width={40} height={25} src="/assets/customer.png" alt="" /></div><span className="text-2xl text-teal-500 font-bold">6</span><br /><span className="text-l">Since last week</span></div>
                        <div className="p-4 bg-white rounded-lg shadow-md"><div className="flex flex-1 justify-between">Balance<img width={40} height={25} src="/assets/dollar-symbol.png" alt="" /></div><span className="text-2xl text-teal-500 font-bold">$4,780,000</span><br /><span className="text-l">Since last week</span></div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 w-full mt-5">
                        {/* Overview Section */}
                        <div className="bg-white p-5 shadow-md rounded-lg w-full max-w-4xl">
                            <h2 className="text-xl font-semibold">Overview</h2>
                            <p className="text-lg text-teal-500">4,780,000</p>
                            <div className="flex gap-2 mt-3">
                                {["Days", "Weeks", "Months", "Years"].map(option => (
                                    <button
                                        key={option}
                                        className={`px-3 py-1 rounded-md shadow-sm ${timeframe === option ? "bg-teal-500 text-white" : "bg-gray-200"
                                            }`}
                                        onClick={() => setTimeframe(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-5 h-64 w-full"> {/* Conteneur avec hauteur fixe */}
                                <Bar data={barData} options={{ ...barOptions, maintainAspectRatio: false }} />
                            </div>
                        </div>


                        {/* Last Payments Section */}
                        <div className="bg-white p-5 shadow-md rounded-lg md:w-1/3">
                            <h2 className="text-lg font-semibold">Last Payments</h2>
                            <ul className="mt-2 text-gray-600">
                                {["Dellai M", "Kthiri Th", "Kthiri Th", "Kthiri Th", "Kthiri Th", "Kthiri Th", "Kthiri Th"].map((name, index) => (
                                    <li key={index} className="flex justify-between py-1">
                                        <span>{name}</span>
                                        <span className="text-gray-500">12th Dec</span>
                                        <span className="text-teal-500 font-medium">+1,500,000</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>


                    <BookingComponent/>
                    <ClientComponent/>


                    
                </div>
            </div>

            <Footer />

        </>
    );
};

export default Dashboard;
