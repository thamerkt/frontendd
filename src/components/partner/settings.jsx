import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Package, MapPin, Clock, CreditCard, 
  Bell, Lock, CheckCircle, AlertCircle, 
  ChevronDown, Loader2, Save, X, Edit,
  User, Phone, Building, Image
} from 'lucide-react';



// Constants for Tunisian delivery companies
const TUNISIAN_CITIES = [
  "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", 
  "Gabès", "Ariana", "Gafsa", "Monastir", "Ben Arous",
  "Nabeul", "Kasserine", "Tozeur", "Beja", "Jendouba",
  "Kef", "Mahdia", "Manouba", "Medenine", "Tataouine",
  "Zaghouan", "Siliana", "Kebili"
];

const DELIVERY_TYPES = [
  "Standard", "Express", "Same-day", "Heavy goods", 
  "Refrigerated", "Fragile items", "Oversized items"
];

const PAYMENT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', connected: true, logo: null },
  { id: 'flouci', name: 'Flouci', connected: false, logo: "/flouci-logo.png" },
  { id: 'paymee', name: 'Paymee', connected: false, logo: "/paymee-logo.png" }
];

const DELIVERY_COMPANY_DATA = {
  companyName: "Express Delivery TN",
  managerName: "Mohamed Ali",
  phone: "+216 12 345 678",
  email: "contact@expressdelivery.tn",
  address: "Rue de la Liberté, Tunis",
  city: "Tunis",
  registrationNumber: "A12345678",
  taxIdentification: "12345678A",
  deliveryAreas: ["Tunis", "Ariana", "Ben Arous"],
  deliveryTypes: ["Standard", "Express"],
  workingHours: {
    from: "08:00",
    to: "18:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  pricing: {
    basePrice: 10,
    pricePerKm: 0.5,
    minOrderValue: 5
  },
  vehicles: [
    { type: "Motorcycle", count: 5 },
    { type: "Van", count: 3 },
    { type: "Truck", count: 1 }
  ]
};

const NOTIFICATION_SETTINGS = {
  newOrders: true,
  deliveryUpdates: true,
  payments: true,
  promotions: false,
  methods: {
    email: true,
    push: true,
    sms: false
  }
};

const NAV_ITEMS = [
  { id: 'company', icon: Building, label: 'Company Info', description: 'Manage your company information' },
  { id: 'services', icon: Truck, label: 'Services', description: 'Configure your delivery services' },
  { id: 'pricing', icon: CreditCard, label: 'Pricing', description: 'Set your delivery pricing' },
  { id: 'coverage', icon: MapPin, label: 'Coverage Areas', description: 'Manage your delivery coverage' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Notification preferences' },
  { id: 'security', icon: Lock, label: 'Security', description: 'Account security settings' }
];

const PartnerSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('company');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [companyData, setCompanyData] = useState(DELIVERY_COMPANY_DATA);

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

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const toggleDeliveryArea = (city) => {
    setCompanyData(prev => {
      const newAreas = prev.deliveryAreas.includes(city)
        ? prev.deliveryAreas.filter(c => c !== city)
        : [...prev.deliveryAreas, city];
      return { ...prev, deliveryAreas: newAreas };
    });
  };

  const toggleDeliveryType = (type) => {
    setCompanyData(prev => {
      const newTypes = prev.deliveryTypes.includes(type)
        ? prev.deliveryTypes.filter(t => t !== type)
        : [...prev.deliveryTypes, type];
      return { ...prev, deliveryTypes: newTypes };
    });
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
      <SidebarPartner />
      
      <div className="flex-1 ml-20 lg:ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sticky top-0 z-10 bg-gray-50 pt-6 pb-4">
            <div className="flex flex-col space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">Delivery Partner Settings</h1>
                <p className="text-gray-600">{activeSectionData?.description}</p>
              </motion.div>
              
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

          <motion.div 
            key={activeSection}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sectionVariants}
            className="pt-6"
          >
            <AnimatePresence mode="wait">
              {activeSection === 'company' && (
                <CompanySection 
                  companyData={companyData}
                  handleInputChange={handleInputChange}
                  handleNestedInputChange={handleNestedInputChange}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'services' && (
                <ServicesSection 
                  companyData={companyData}
                  toggleDeliveryType={toggleDeliveryType}
                  handleInputChange={handleInputChange}
                  handleNestedInputChange={handleNestedInputChange}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'pricing' && (
                <PricingSection 
                  companyData={companyData}
                  handleNestedInputChange={handleNestedInputChange}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  saveError={saveError}
                />
              )}
              {activeSection === 'coverage' && (
                <CoverageSection 
                  companyData={companyData}
                  toggleDeliveryArea={toggleDeliveryArea}
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
const CompanySection = ({ companyData, handleInputChange, handleNestedInputChange, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <Building className="h-5 w-5 mr-2 text-teal-600" />
        Company Information
      </h2>
      <p className="text-sm text-gray-500 mt-1">Manage your company details and legal information</p>
    </div>
    
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={companyData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
        <input
          type="text"
          value={companyData.managerName}
          onChange={(e) => handleInputChange('managerName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          value={companyData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          value={companyData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={companyData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <select
          value={companyData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {TUNISIAN_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
        <input
          type="text"
          value={companyData.registrationNumber}
          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Identification</label>
        <input
          type="text"
          value={companyData.taxIdentification}
          onChange={(e) => handleInputChange('taxIdentification', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
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

const ServicesSection = ({ companyData, toggleDeliveryType, handleNestedInputChange, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <Truck className="h-5 w-5 mr-2 text-teal-600" />
        Delivery Services
      </h2>
      <p className="text-sm text-gray-500 mt-1">Configure your delivery services and working hours</p>
    </div>
    
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Types Offered</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DELIVERY_TYPES.map(type => (
            <motion.label
              key={type}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
                companyData.deliveryTypes.includes(type) 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={companyData.deliveryTypes.includes(type)}
                onChange={() => toggleDeliveryType(type)}
                className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
              <span className="text-gray-700">{type}</span>
            </motion.label>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Working Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="time"
                value={companyData.workingHours.from}
                onChange={(e) => handleNestedInputChange('workingHours', 'from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="time"
                value={companyData.workingHours.to}
                onChange={(e) => handleNestedInputChange('workingHours', 'to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Working Days</h3>
          <div className="flex flex-wrap gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  const newDays = companyData.workingHours.days.includes(day)
                    ? companyData.workingHours.days.filter(d => d !== day)
                    : [...companyData.workingHours.days, day];
                  handleNestedInputChange('workingHours', 'days', newDays);
                }}
                className={`px-3 py-1 text-sm rounded-md ${
                  companyData.workingHours.days.includes(day)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Fleet Information</h3>
        <div className="space-y-4">
          {companyData.vehicles.map((vehicle, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicle Type</label>
                <input
                  type="text"
                  value={vehicle.type}
                  onChange={(e) => {
                    const newVehicles = [...companyData.vehicles];
                    newVehicles[index].type = e.target.value;
                    handleInputChange('vehicles', newVehicles);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Count</label>
                <input
                  type="number"
                  value={vehicle.count}
                  onChange={(e) => {
                    const newVehicles = [...companyData.vehicles];
                    newVehicles[index].count = parseInt(e.target.value) || 0;
                    handleInputChange('vehicles', newVehicles);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ backgroundColor: '#fee2e2' }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    const newVehicles = companyData.vehicles.filter((_, i) => i !== index);
                    handleInputChange('vehicles', newVehicles);
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm"
                >
                  Remove
                </motion.button>
              </div>
            </div>
          ))}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              const newVehicles = [...companyData.vehicles, { type: "", count: 1 }];
              handleInputChange('vehicles', newVehicles);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            + Add Vehicle Type
          </motion.button>
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

const PricingSection = ({ companyData, handleNestedInputChange, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-teal-600" />
        Pricing Configuration
      </h2>
      <p className="text-sm text-gray-500 mt-1">Set your delivery pricing structure</p>
    </div>
    
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (TND)</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">TND</span>
            </div>
            <input
              type="number"
              value={companyData.pricing.basePrice}
              onChange={(e) => handleNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value) || 0)}
              className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Km (TND)</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">TND</span>
            </div>
            <input
              type="number"
              value={companyData.pricing.pricePerKm}
              onChange={(e) => handleNestedInputChange('pricing', 'pricePerKm', parseFloat(e.target.value) || 0)}
              className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (TND)</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">TND</span>
            </div>
            <input
              type="number"
              value={companyData.pricing.minOrderValue}
              onChange={(e) => handleNestedInputChange('pricing', 'minOrderValue', parseFloat(e.target.value) || 0)}
              className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h3>
        <div className="space-y-4">
          {PAYMENT_METHODS.map((method) => (
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
                onClick={() => {
                  // In a real app, this would connect/disconnect the payment method
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${method.connected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              >
                {method.connected ? 'Disconnect' : 'Connect'}
              </motion.button>
            </motion.div>
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

const CoverageSection = ({ companyData, toggleDeliveryArea, handleSave, isLoading, saveSuccess, saveError }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-teal-600" />
        Coverage Areas
      </h2>
      <p className="text-sm text-gray-500 mt-1">Manage the cities you deliver to</p>
    </div>
    
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TUNISIAN_CITIES.map(city => (
          <motion.label
            key={city}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
              companyData.deliveryAreas.includes(city) 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={companyData.deliveryAreas.includes(city)}
              onChange={() => toggleDeliveryArea(city)}
              className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-gray-700">{city}</span>
          </motion.label>
        ))}
      </div>
      
      <div className="pt-6 border-t border-gray-200 flex justify-end">
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
            { key: 'newOrders', label: 'New Delivery Orders', description: 'When a new delivery request is received' },
            { key: 'deliveryUpdates', label: 'Delivery Status Updates', description: 'Updates on delivery progress' },
            { key: 'payments', label: 'Payment Notifications', description: 'When payments are received' },
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
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
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
    className="flex items-center space-x-4"
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

export default PartnerSettingsPage;