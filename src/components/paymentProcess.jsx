import React, { useState, useEffect, useCallback } from 'react';
import Profileservice from '../services/profileService';

const CheckoutProcess = () => {
  // State management
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form data with proper initial values from profile
  const [formData, setFormData] = useState({
    isGuest: false,
    email: '',
    shippingInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    shippingMethod: '',
    paymentMethod: '',
    cardInfo: {
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    }
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await Profileservice.fetchProfile();
        if (Array.isArray(userData) && userData.length > 0) {
          const firstProfile = userData[0];
          setProfileData(firstProfile);
          
          // Update form data with profile info
          setFormData(prev => ({
            ...prev,
            shippingInfo: {
              firstName: firstProfile.first_name || '',
              lastName: firstProfile.last_name || '',
              city: firstProfile.address?.city || '',
              state: firstProfile.address?.state || '',
              phone: firstProfile.phone || '',
              zipCode: firstProfile.address?.postal_code || '',
              country: firstProfile.address?.country || '',
              address: prev.shippingInfo.address // Keep existing address if any
            }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name in prev.shippingInfo) {
        return {
          ...prev,
          shippingInfo: {
            ...prev.shippingInfo,
            [name]: value
          }
        };
      }
      
      if (name in prev.cardInfo) {
        return {
          ...prev,
          cardInfo: {
            ...prev.cardInfo,
            [name]: value
          }
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  }, []);

  // Navigation handlers
  const nextStep = useCallback(() => setStep(prev => prev + 1), []);
  const prevStep = useCallback(() => setStep(prev => prev - 1), []);

  // Order placement handler
  const handlePlaceOrder = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      nextStep();
    }, 2000);
  }, [nextStep]);

  // Step components
  const renderStep1 = () => (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout Process Begins</h2>
      <div className="flex flex-col space-y-4">
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-md transition-colors"
          onClick={() => {
            setFormData(prev => ({...prev, isGuest: false}));
            nextStep();
          }}
        >
          Sign In
        </button>
        <button
          className="border border-teal-600 text-teal-600 hover:bg-teal-50 py-3 px-6 rounded-md transition-colors"
          onClick={() => {
            setFormData(prev => ({...prev, isGuest: true}));
            nextStep();
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {formData.isGuest ? 'Guest Information' : 'Verify Your Information'}
      </h2>
      
      {formData.isGuest && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
      )}
      
      <ShippingInfoForm 
        formData={formData} 
        handleInputChange={handleInputChange} 
        prevStep={prevStep}
        nextStep={nextStep}
      />
    </div>
  );

  const renderStep3 = () => (
    <ShippingMethodStep 
      formData={formData}
      handleInputChange={handleInputChange}
      prevStep={prevStep}
      nextStep={nextStep}
    />
  );

  const renderStep4 = () => (
    <ReviewAndPayment 
      formData={formData}
      handleInputChange={handleInputChange}
      handlePlaceOrder={handlePlaceOrder}
      isProcessing={isProcessing}
      prevStep={prevStep}
    />
  );

  const renderSuccessStep = () => (
    <OrderCompletion 
      paymentSuccess={paymentSuccess}
      email={formData.email}
      onReset={() => {
        setStep(1);
        setPaymentSuccess(false);
      }}
    />
  );

  // Main render switch
  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderSuccessStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <CheckoutProgress step={step} />
      {renderStep()}
    </div>
  );
};

// Extracted Components for better organization

const CheckoutProgress = ({ step }) => (
  <div className="relative mb-8">
    <div className="flex items-center justify-between">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex flex-col items-center z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {stepNumber}
          </div>
          <div className={`text-sm mt-2 ${step >= stepNumber ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
            {['Checkout', 'Information', 'Shipping', 'Review & Pay'][stepNumber - 1]}
          </div>
        </div>
      ))}
    </div>
    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
      <div 
        className="h-full bg-teal-600 transition-all duration-300" 
        style={{ width: `${(step - 1) * 33.33}%` }}
      />
    </div>
  </div>
);

const ShippingInfoForm = ({ formData, handleInputChange, prevStep, nextStep }) => (
  <>
    <h3 className="text-xl font-semibold text-gray-700 mb-4">Shipping Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <TextInput
        label="First Name"
        name="firstName"
        value={formData.shippingInfo.firstName}
        onChange={handleInputChange}
        required
      />
      <TextInput
        label="Last Name"
        name="lastName"
        value={formData.shippingInfo.lastName}
        onChange={handleInputChange}
        required
      />
    </div>
    
    <TextInput
      label="Phone"
      name="phone"
      value={formData.shippingInfo.phone}
      onChange={handleInputChange}
      required
    />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput
        label="City"
        name="city"
        value={formData.shippingInfo.city}
        onChange={handleInputChange}
        required
      />
      <TextInput
        label="State/Province"
        name="state"
        value={formData.shippingInfo.state}
        onChange={handleInputChange}
        required
      />
      <TextInput
        label="ZIP/Postal Code"
        name="zipCode"
        value={formData.shippingInfo.zipCode}
        onChange={handleInputChange}
        required
      />
    </div>
    
    <TextInput
      label="Country"
      name="country"
      value={formData.shippingInfo.country}
      onChange={handleInputChange}
      required
    />
    
    <div className="flex justify-between">
      <NavButton type="back" onClick={prevStep} />
      <NavButton type="next" onClick={nextStep} />
    </div>
  </>
);
const ShippingOption = ({ method, selected, onChange }) => (
  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
    selected 
      ? 'border-teal-600 bg-teal-50' 
      : 'border-gray-300 hover:border-teal-400'
  }`}>
    <input
      type="radio"
      name="shippingMethod"
      value={method.value}
      checked={selected}
      onChange={onChange}
      className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300"
    />
    <div className="ml-4">
      <h3 className="font-medium text-gray-900">{method.label}</h3>
      <p className="text-gray-600 text-sm">{method.desc}</p>
    </div>
    {selected && (
      <svg 
        className="ml-auto h-5 w-5 text-teal-600" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )}
  </label>
);

const ShippingMethodStep = ({ formData, handleInputChange, prevStep, nextStep }) => (
  <div className="bg-white p-8 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Method</h2>
    
    <div className="space-y-4 mb-8">
      {[
        { value: 'standard', label: 'Standard Shipping', desc: '5-7 business days - $5.99' },
        { value: 'express', label: 'Express Shipping', desc: '2-3 business days - $12.99' },
        { value: 'overnight', label: 'Overnight Shipping', desc: 'Next business day - $24.99' }
      ].map((method) => (
        <ShippingOption
          key={method.value}
          method={method}
          selected={formData.shippingMethod === method.value}
          onChange={handleInputChange}
        />
      ))}
    </div>
    
    <div className="flex justify-between">
      <NavButton type="back" onClick={prevStep} />
      <NavButton 
        type="next" 
        onClick={nextStep}
        disabled={!formData.shippingMethod}
      />
    </div>
  </div>
);
const OrderSummary = ({ formData }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
    
    <div className="space-y-4">
    
  <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
  {Object.entries(formData.shippingInfo).map(([key, value]) => (
    <div className="flex justify-between mb-2" key={key}>
      <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1')}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  ))}

      <div className="flex justify-between">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium">
          {formData.shippingMethod === 'standard' ? '$5.99' : 
           formData.shippingMethod === 'express' ? '$12.99' : '$24.99'}
        </span>
      </div>
      <div className="flex justify-between border-t border-gray-200 pt-4">
        <span className="text-gray-800 font-semibold">Total</span>
        <span className="text-gray-800 font-semibold">
          {formData.shippingMethod === 'standard' ? '$105.98' : 
           formData.shippingMethod === 'express' ? '$112.98' : '$124.98'}
        </span>
      </div>
    </div>
  </div>
);


const PaymentSection = ({ formData, handleInputChange, handlePlaceOrder, isProcessing, prevStep }) => (
  <div className="space-y-6 bg-white p-6 rounded-lg shadow-xl">
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Payment Method</h3>
      <div className="space-y-4">
        {/* Credit Card Option */}
        <label className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="paymentMethod"
              value="creditCard"
              checked={formData.paymentMethod === 'creditCard'}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
            />
            <span className="text-gray-700 font-medium">Credit Card</span>
          </div>
          <img src="" alt="Credit Card" className="h-6 w-auto" />
        </label>

        {/* Flouci Option */}
        <label className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="paymentMethod"
              value="flouci"
              checked={formData.paymentMethod === 'flouci'}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
            />
            <span className="text-gray-700 font-medium">Flouci (Tunisia)</span>
          </div>
          <img src='/assets/flousi.png' alt="Flouci" className="h-6 w-auto" />
        </label>
      </div>
    </div>

    {/* Credit Card Form */}
    {formData.paymentMethod === 'creditCard' && (
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-gray-700 mb-2">Card Number</label>
          <input
            type="text"
            name="number"
            value={formData.cardInfo.number}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Expiry</label>
            <input
              type="text"
              name="expiry"
              value={formData.cardInfo.expiry}
              onChange={handleInputChange}
              placeholder="MM/YY"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cardInfo.cvv}
              onChange={handleInputChange}
              placeholder="123"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Name on Card</label>
          <input
            type="text"
            name="name"
            value={formData.cardInfo.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
      </div>
    )}

    <div className="pt-6">
      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !formData.paymentMethod}
        className={`w-full py-3 px-4 rounded-md text-white font-semibold text-lg shadow-sm ${
          isProcessing ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
        } transition disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Place Order'
        )}
      </button>

      <button
        type="button"
        onClick={prevStep}
        className="mt-3 w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
      >
        Back to Shipping
      </button>
    </div>
  </div>
);

const ReviewAndPayment = ({ formData, handleInputChange, handlePlaceOrder, isProcessing, prevStep }) => (
  <div className="bg-white p-8 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Review & Payment</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <OrderSummary formData={formData} />
      <PaymentSection 
        formData={formData}
        handleInputChange={handleInputChange}
        handlePlaceOrder={handlePlaceOrder}
        isProcessing={isProcessing}
        prevStep={prevStep}
      />
    </div>
  </div>
);

// Helper components
const TextInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
      {...props}
    />
  </div>
);

const NavButton = ({ type, onClick, disabled = false }) => (
  <button 
    className={`${
      type === 'back' 
        ? 'border border-teal-600 text-teal-600 hover:bg-teal-50' 
        : 'bg-teal-600 hover:bg-teal-700 text-white'
    } py-2 px-6 rounded-md transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed`}
    onClick={onClick}
    disabled={disabled}
  >
    {type === 'back' ? 'Back' : 'Continue'}
  </button>
);

export default CheckoutProcess;