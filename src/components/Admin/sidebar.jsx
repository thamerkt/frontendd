import { useState } from "react";
import { Home, BarChart, Users, Calendar, Package, Settings } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom"; // Corrected import

const SidebarAdmin = () => {
  const [active, setActive] = useState("Dashboard");
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith('/admin');

  const menuItems = [
    { name: "Dashboard", icon: <Home />, key: "Dashboard", path: "/admin/dashbord" }, // Fixed typo in 'dashboard' path
    { name: "Statics", icon: <BarChart />, key: "Statics", path: "/admin/statics" }, // Fixed typo in path
    { name: "Clients", icon: <Users />, key: "Clients", path: "/admin/clients" },
    { name: "Booking", icon: <Calendar />, key: "Booking", path: "/admin/booking" },
    { name: "Products", icon: <Package />, key: "Products", path: "/admin/products" },
    { name: "Settings", icon: <Settings />, key: "Settings", path: "/admin/settings" },
  ];

  return (
    isAdminPage && (
      <div className="w-64 h-screen bg-white p-5 shadow-md">
        <h1 className="text-4xl font-serif italic">Everything Rentals</h1>
        <ul className="space-y-4 mt-4">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`flex items-center space-x-3 p-3 rounded-20 cursor-pointer ${
                active === item.key ? "bg-cyan-100 text-black" : "text-gray-600"
              }`}
              onClick={() => setActive(item.key)}
            >
              <NavLink to={item.path} className="flex items-center space-x-3">
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default SidebarAdmin;
