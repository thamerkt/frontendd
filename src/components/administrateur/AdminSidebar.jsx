import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tag, 
  BarChart2, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminnSidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/equipment', icon: Package, label: 'Equipment' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 hover:bg-gray-100 transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Admin Info */}
        {isOpen && (
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-600 font-medium">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
} 