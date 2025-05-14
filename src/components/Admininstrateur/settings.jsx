import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Image, Building, MapPin, Clock, 
  CreditCard, Bell, Lock, CheckCircle, AlertCircle, 
  ChevronDown, Loader2, Save, Shield, X, Edit
} from 'lucide-react';


// Constants for all data
const USER_DATA = {
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  dob: "1990-01-01",
  profileImage: "/profile-placeholder.jpg"
};

const BUSINESS_DATA = {
  name: "Premium Rentals Co.",
  address: "123 Rental Street",
  phone: "+1 (555) 987-6543",
  description: "We provide high-quality rental equipment with excellent customer service."
};

const RENTAL_PREFERENCES = {
  minDuration: "3",
  maxDuration: "30",
  requiresDeposit: true,
  depositAmount: "100",
  currency: "USD"
};

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'Stripe', connected: true, logo: "/stripe-logo.svg" },
  { id: 'paypal', name: 'PayPal', connected: false, logo: "/paypal-logo.svg" },
  { id: 'bank', name: 'Bank Transfer', connected: true, logo: null }
];

const NOTIFICATION_SETTINGS = {
  newRentals: true,
  confirmations: true,
  messages: true,
  promotions: false,
  methods: {
    email: true,
    push: true,
    sms: false
  }
};

const NAV_ITEMS = [
  { id: 'account', icon: User, label: 'Account', description: 'Manage your personal information' },
  { id: 'business', icon: Building, label: 'Business', description: 'Details that appear on your rental listings' },
  { id: 'rental', icon: Clock, label: 'Rental Preferences', description: 'Configure your default rental settings' },
  { id: 'payments', icon: CreditCard, label: 'Payments', description: 'Manage how you receive payments' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Choose how you receive notifications' },
  { id: 'security', icon: Lock, label: 'Security', description: 'Manage your account security' }
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [profileImage, setProfileImage] = useState(USER_DATA.profileImage);

  const activeSectionData = NAV_ITEMS.find(item => item.id === activeSection);

  const handleSave = () => {
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    // Simulate save action
    setTimeout(() => {
      setIsLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      
      
      {/* Main Content */}
      <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Fixed Header with Navbar */}
          <div className="sticky top-0 z-10 bg-gray-50 pt-6 pb-4">
            <div className="flex flex-col space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">{activeSectionData?.description}</p>
              </motion.div>
              
              {/* Navbar */}
              <motion.nav 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
              >
                <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 overflow-x-auto">
                  {NAV_ITEMS.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ backgroundColor: '#f0fdfa' }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeSection === item.id 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.nav>
            </div>
          </div>

          {/* Settings Content */}
          <motion.div 
            key={activeSection}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
            className="pt-6"
          >
            <AnimatePresence mode="wait">
              {activeSection === 'account' && (
                <AccountSection 
                  userData={USER_DATA}
                  profileImage={profileImage}
                  handleImageUpload={handleImageUpload}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'business' && (
                <BusinessSection 
                  businessData={BUSINESS_DATA}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'rental' && (
                <RentalSection 
                  rentalPreferences={RENTAL_PREFERENCES}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'payments' && (
                <PaymentsSection 
                  paymentMethods={PAYMENT_METHODS}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationsSection 
                  notificationSettings={NOTIFICATION_SETTINGS}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'security' && (
                <SecuritySection 
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                  show2FAModal={show2FAModal}
                  setShow2FAModal={setShow2FAModal}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* 2FA Modal */}
          <AnimatePresence>
            {show2FAModal && (
              <TwoFAModal setShow2FAModal={setShow2FAModal} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
// Section Components
const AccountSection = ({ userData, profileImage, handleImageUpload, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <User className="h-5 w-5 mr-2 text-teal-600" />
        Account Settings
      </h2>
      <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
    </div>
    
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Image */}
      <div className="md:col-span-2">
        <div className="flex items-center space-x-6">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="relative group"
          >
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <motion.label 
              whileHover={{ backgroundColor: 'rgba(13, 148, 136, 0.9)' }}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
            >
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Edit className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
            </motion.label>
          </motion.div>
          <div>
            <p className="text-sm font-medium text-gray-700">Profile Photo</p>
            <p className="text-xs text-gray-500 mt-1">Recommended size: 400x400px</p>
          </div>
        </div>
      </div>
      
      {/* Form Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="text"
            defaultValue={userData.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="email"
            defaultValue={userData.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="tel"
            defaultValue={userData.phone}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="date"
            defaultValue={userData.dob}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      {/* Save Button */}
      <SaveButton 
        handleSave={handleSave}
        isLoading={isLoading}
        saveSuccess={saveSuccess}
        saveError={saveError}
      />
    </div>
  </div>
);

const BusinessSection = ({ businessData, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <Building className="h-5 w-5 mr-2 text-teal-600" />
        Business Information
      </h2>
      <p className="text-sm text-gray-500 mt-1">Details that appear on your rental listings</p>
    </div>
    
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="text"
            defaultValue={businessData.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="text"
            defaultValue={businessData.address}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <input
            type="tel"
            defaultValue={businessData.phone}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
        <motion.div whileHover={{ scale: 1.005 }}>
          <textarea
            rows={4}
            defaultValue={businessData.description}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </motion.div>
      </div>
      
      <SaveButton 
        handleSave={handleSave}
        isLoading={isLoading}
        saveSuccess={saveSuccess}
        saveError={saveError}
      />
    </div>
  </div>
);

const RentalSection = ({ rentalPreferences, handleSave, isLoading, saveSuccess, saveError }) => {
  const [prefs, setPrefs] = useState(rentalPreferences);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-teal-600" />
          Rental Preferences
        </h2>
        <p className="text-sm text-gray-500 mt-1">Configure your default rental settings</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rental Duration (days)</label>
          <motion.div whileHover={{ scale: 1.005 }}>
            <select 
              value={prefs.minDuration}
              onChange={(e) => setPrefs({...prefs, minDuration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
            </select>
          </motion.div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Rental Duration (days)</label>
          <motion.div whileHover={{ scale: 1.005 }}>
            <select 
              value={prefs.maxDuration}
              onChange={(e) => setPrefs({...prefs, maxDuration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
              <option value="30">1 month</option>
              <option value="90">3 months</option>
            </select>
          </motion.div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit Required</label>
          <div className="flex items-center space-x-6 mt-2">
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center cursor-pointer"
            >
              <input 
                type="radio" 
                name="deposit" 
                className="h-4 w-4 text-teal-600 focus:ring-teal-500" 
                checked={prefs.requiresDeposit}
                onChange={() => setPrefs({...prefs, requiresDeposit: true})}
              />
              <span className="ml-2 text-gray-700">Yes</span>
            </motion.label>
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center cursor-pointer"
            >
              <input 
                type="radio" 
                name="deposit" 
                className="h-4 w-4 text-teal-600 focus:ring-teal-500" 
                checked={!prefs.requiresDeposit}
                onChange={() => setPrefs({...prefs, requiresDeposit: false})}
              />
              <span className="ml-2 text-gray-700">No</span>
            </motion.label>
          </div>
        </div>
        
        {prefs.requiresDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <motion.div whileHover={{ scale: 1.005 }}>
                <input
                  type="text"
                  value={prefs.depositAmount}
                  onChange={(e) => setPrefs({...prefs, depositAmount: e.target.value})}
                  className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </motion.div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <select
                  value={prefs.currency}
                  onChange={(e) => setPrefs({...prefs, currency: e.target.value})}
                  className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <SaveButton 
            handleSave={handleSave}
            isLoading={isLoading}
            saveSuccess={saveSuccess}
            saveError={saveError}
          />
        </div>
      </div>
    </div>
  );
};

const PaymentsSection = ({ paymentMethods, handleSave, isLoading, saveSuccess, saveError }) => {
  const [methods, setMethods] = useState(paymentMethods);

  const togglePaymentMethod = (id) => {
    setMethods(methods.map(method => 
      method.id === id ? { ...method, connected: !method.connected } : method
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-teal-600" />
          Payment Methods
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage how you receive payments</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${method.connected ? 'bg-teal-50' : 'bg-gray-50'}`}>
                  {method.logo ? (
                    <img src={method.logo} alt={method.name} className="h-6" />
                  ) : (
                    <Building className="h-6 w-6 text-teal-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className={`text-sm ${method.connected ? 'text-teal-600' : 'text-gray-500'}`}>
                    {method.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePaymentMethod(method.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${method.connected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              >
                {method.connected ? 'Disconnect' : 'Connect'}
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Payout Schedule</h3>
          <motion.div whileHover={{ scale: 1.005 }}>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>Daily</option>
              <option selected>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </motion.div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <SaveButton 
            handleSave={handleSave}
            isLoading={isLoading}
            saveSuccess={saveSuccess}
            saveError={saveError}
          />
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = ({ notificationSettings, handleSave, isLoading, saveSuccess, saveError }) => {
  const [settings, setSettings] = useState(notificationSettings);

  const toggleNotification = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const toggleMethod = (key) => {
    setSettings({
      ...settings,
      methods: {
        ...settings.methods,
        [key]: !settings.methods[key]
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-teal-600" />
          Notification Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">Choose how you receive notifications</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {[
            { key: 'newRentals', label: 'New Rental Requests', description: 'When someone requests to rent your item' },
            { key: 'confirmations', label: 'Rental Confirmations', description: 'When a rental is confirmed' },
            { key: 'messages', label: 'Messages', description: 'When you receive a new message' },
            { key: 'promotions', label: 'Promotions & Offers', description: 'Special offers and platform updates' }
          ].map((item) => (
            <motion.div
              key={item.key}
              whileHover={{ backgroundColor: '#f9fafb' }}
              className="flex items-center justify-between p-4 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-700">{item.label}</p>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
              <Switch 
                checked={settings[item.key]}
                onChange={() => toggleNotification(item.key)}
              />
            </motion.div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Methods</h3>
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email' },
              { key: 'push', label: 'Push Notifications' },
              { key: 'sms', label: 'SMS' }
            ].map((item) => (
              <motion.label
                key={item.key}
                whileHover={{ scale: 1.01 }}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={settings.methods[item.key]}
                  onChange={() => toggleMethod(item.key)}
                  className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <span className="text-gray-700">{item.label}</span>
              </motion.label>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <SaveButton 
            handleSave={handleSave}
            isLoading={isLoading}
            saveSuccess={saveSuccess}
            saveError={saveError}
          />
        </div>
      </div>
    </div>
  );
};

const SecuritySection = ({ handleSave, isLoading, saveSuccess, saveError, show2FAModal, setShow2FAModal }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-teal-600" />
          Security
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account security</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShow2FAModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Enable 2FA
          </motion.button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <motion.div whileHover={{ scale: 1.005 }}>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </motion.div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <motion.div whileHover={{ scale: 1.005 }}>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </motion.div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <motion.div whileHover={{ scale: 1.005 }}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <SaveButton 
            handleSave={handleSave}
            isLoading={isLoading}
            saveSuccess={saveSuccess}
            saveError={saveError}
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const SaveButton = ({ handleSave, isLoading, saveSuccess, saveError }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="md:col-span-2 flex items-center space-x-4"
  >
    {saveSuccess && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center text-sm text-green-600"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Changes saved!
      </motion.div>
    )}
    {saveError && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center text-sm text-red-600"
      >
        <AlertCircle className="h-4 w-4 mr-1" />
        Error saving changes
      </motion.div>
    )}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSave}
      disabled={isLoading}
      className={`px-5 py-2 rounded-lg font-medium flex items-center ${isLoading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'} text-white transition-colors`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </>
      )}
    </motion.button>
  </motion.div>
);

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${checked ? 'bg-teal-600' : 'bg-gray-200'}`}
    onClick={onChange}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const TwoFAModal = ({ setShow2FAModal }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={() => setShow2FAModal(false)}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Enable Two-Factor Authentication</h3>
        <button 
          onClick={() => setShow2FAModal(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">QR Code Placeholder</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app</p>
          <p className="text-xs text-gray-500">Or enter this code manually: <span className="font-mono">JBSWY3DPEHPK3PXP</span></p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter 6-digit code"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            whileHover={{ backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShow2FAModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: '#0d9488' }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Verify & Enable
          </motion.button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default SettingsPage;