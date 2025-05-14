import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Settings, LogOut, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickAway } from 'react-use';


export default function ProfileNavbar({ user, logout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // --- BEGIN: Replace useNotifications with local state ---
  // For demonstration, notifications are stored in local state.
  // In a real app, you might fetch from an API or context.
  const [notifications, setNotifications] = useState([
    // Example notifications
    {
      id: 1,
      message: "Welcome to the platform!",
      type: "info",
      read: false,
      time: "Just now",
      link: null,
    },
    {
      id: 2,
      message: "Your profile was updated.",
      type: "info",
      read: false,
      time: "2 hours ago",
      link: "/profile",
    },
    {
      id: 3,
      message: "System maintenance scheduled.",
      type: "alert",
      read: true,
      time: "Yesterday",
      link: null,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };
  // --- END: Replace useNotifications with local state ---

  // Close dropdowns when clicking outside
  useClickAway(notificationRef, () => setIsNotificationOpen(false));
  useClickAway(profileRef, () => setIsProfileOpen(false));

  // Auto-close dropdowns when navigating
  useEffect(() => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const shouldShowNavbar = () => {
    const path = location.pathname;
    return ['/owner', '/client', '/partner', '/admin'].some(prefix =>
      path.startsWith(prefix)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!shouldShowNavbar()) return null;

  return (
    <div className="relative flex items-center justify-end w-full px-6 py-4">
      {/* Notifications with Floating Badge */}
      <div className="relative mr-4" ref={notificationRef}>
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2.5 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-teal-600 focus:outline-none ring-1 ring-gray-200 hover:ring-teal-300"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm"
            >
              {unreadCount}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {isNotificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-600 hover:text-teal-800 transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Mail className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        whileHover={{ scale: 1.01 }}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : 'bg-white'
                        } hover:bg-teal-50`}
                        onClick={() => {
                          markAsRead(notification.id);
                          notification.link && navigate(notification.link);
                        }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            {notification.type === 'alert' ? (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-teal-500" />
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="ml-2 flex-shrink-0">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Dropdown with Animation */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center space-x-2 bg-white rounded-full shadow-sm px-3 py-1.5 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none"
          aria-label="User menu"
        >
          <div className="relative">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-teal-100"
            />
            <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-gray-400">
              {user?.role || 'Member'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1"
            >
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-gray-400" />
                    Sign out
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}