import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

const CheckoutProcess = () => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  
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

  // Check for token on first render
  useEffect(() => {
    const token = Cookies.get('token');
    const user=Cookies.get('keycloak_user_id')
    fetchUserData(user);
    if (token && !hasCheckedToken) {
      
      setHasCheckedToken(true);
      setStep(2)
    } else {
      setHasCheckedToken(true);
    }
  }, []);

  const fetchUserData = async (user) => {
    try {
      const response = await fetch(`https://kong-7e283b39dauspilq0.kongcloud.dev/profile/profil/?user=${user}`, {
        headers: {
          
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      if (data.length > 0) {
        const user = data[0];
        setFormData(prev => ({
          ...prev,
          isGuest: false,
          email: '', // You might want to get email from another endpoint
          shippingInfo: {
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            phone: user.phone || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.postal_code || '',
            country: user.address?.country || '',
          }
        }));
        console.log("data",data)
        // Skip to shipping if user is logged in and data is loaded
        setStep(2);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFlouciPayment = async () => {
    setIsProcessing(true);
    try {
      const token = Cookies.get('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://127.0.0.1:8000/payme/payment/start/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: '30500'
        })
      });
  
      const data = await response.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentSuccess(false);
      setStep(5);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step components with improved visual hierarchy
  const renderStep1 = () => (
    <motion.div 
      className="bg-white p-8 rounded-lg border border-gray-100 shadow-xs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Checkout</h2>
        <p className="text-gray-500 text-sm">Please choose your checkout method</p>
      </div>
      
      <div className="flex flex-col space-y-4 max-w-md mx-auto">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="bg-teal-600 text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          onClick={() => setStep(2)}
        >
          Sign In to Checkout
        </motion.button>
        
        <div className="relative flex items-center my-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg text-sm font-medium transition-colors"
          onClick={() => {
            setFormData({...formData, isGuest: true});
            setStep(2);
          }}
        >
          Continue as Guest
        </motion.button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      className="bg-white p-8 rounded-lg border border-gray-100 shadow-xs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          {formData.isGuest ? 'Guest Information' : 'Verify Your Information'}
        </h2>
        <p className="text-gray-500 text-sm">Please enter your shipping details</p>
      </div>
      
      {formData.isGuest && (
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
      )}
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">First Name</label>
            <input
              type="text"
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={formData.shippingInfo.firstName}
              onChange={(e) => setFormData({
                ...formData,
                shippingInfo: {...formData.shippingInfo, firstName: e.target.value}
              })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Last Name</label>
            <input
              type="text"
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={formData.shippingInfo.lastName}
              onChange={(e) => setFormData({
                ...formData,
                shippingInfo: {...formData.shippingInfo, lastName: e.target.value}
              })}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Phone Number</label>
          <input
            type="tel"
            className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            value={formData.shippingInfo.phone}
            onChange={(e) => setFormData({
              ...formData,
              shippingInfo: {...formData.shippingInfo, phone: e.target.value}
            })}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">City</label>
            <input
              type="text"
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={formData.shippingInfo.city}
              onChange={(e) => setFormData({
                ...formData,
                shippingInfo: {...formData.shippingInfo, city: e.target.value}
              })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">State</label>
            <input
              type="text"
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={formData.shippingInfo.state}
              onChange={(e) => setFormData({
                ...formData,
                shippingInfo: {...formData.shippingInfo, state: e.target.value}
              })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">ZIP Code</label>
            <input
              type="text"
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={formData.shippingInfo.zipCode}
              onChange={(e) => setFormData({
                ...formData,
                shippingInfo: {...formData.shippingInfo, zipCode: e.target.value}
              })}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Country</label>
          <input
            type="text"
            className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            value={formData.shippingInfo.country}
            onChange={(e) => setFormData({
              ...formData,
              shippingInfo: {...formData.shippingInfo, country: e.target.value}
            })}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
        <button 
          className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
          onClick={() => setStep(1)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back
        </button>
        <button 
          className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
          onClick={() => setStep(3)}
        >
          Continue to Shipping
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      className="bg-white p-8 rounded-lg border border-gray-100 shadow-xs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Shipping Method</h2>
        <p className="text-gray-500 text-sm">Choose your preferred shipping option</p>
      </div>
      
      <div className="space-y-3 mb-6">
        {[
          { value: 'standard', label: 'Standard Shipping', desc: '5-7 business days', price: '$5.99' },
          { value: 'express', label: 'Express Shipping', desc: '2-3 business days', price: '$12.99' },
          { value: 'overnight', label: 'Overnight Shipping', desc: 'Next business day', price: '$24.99' }
        ].map((method) => (
          <label 
            key={method.value}
            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.shippingMethod === method.value 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                className="mt-0.5 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                checked={formData.shippingMethod === method.value}
                onChange={() => setFormData({...formData, shippingMethod: method.value})}
              />
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="block text-sm font-medium text-gray-900">{method.label}</span>
                  <span className="block text-sm font-medium text-gray-900">{method.price}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{method.desc}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button 
          className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
          onClick={() => setStep(2)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back
        </button>
        <button 
          className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          onClick={() => setStep(4)}
          disabled={!formData.shippingMethod}
        >
          Continue to Payment
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div 
      className="bg-white p-8 rounded-lg border border-gray-100 shadow-xs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Payment Method</h2>
        <p className="text-gray-500 text-sm">Complete your purchase securely</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Order Summary</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Shipping Information</h4>
                <div className="space-y-2">
                  {Object.entries(formData.shippingInfo).map(([key, value]) => (
                    <div className="flex justify-between text-xs" key={key}>
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-gray-900">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-2 text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">$99.99</span>
                </div>
                <div className="flex justify-between mb-2 text-xs">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {formData.shippingMethod === 'standard' ? '$5.99' : 
                     formData.shippingMethod === 'express' ? '$12.99' : '$24.99'}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-sm">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-teal-600">
                    {formData.shippingMethod === 'standard' ? '$105.98' : 
                     formData.shippingMethod === 'express' ? '$112.98' : '$124.98'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-1 lg:order-2">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Options</h3>
              <div className="space-y-3">
                {[
                  { value: 'creditCard', label: 'Credit Card' },
                  { value: 'flouci', label: 'Flouci (Tunisia)' }
                ].map((method) => (
                  <label 
                    key={method.value}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method.value 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                        checked={formData.paymentMethod === method.value}
                        onChange={() => setFormData({...formData, paymentMethod: method.value})}
                      />
                      <span className="ml-3 block text-sm font-medium text-gray-900">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.paymentMethod === 'creditCard' && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    value={formData.cardInfo.number}
                    onChange={(e) => {
                      const formattedValue = e.target.value
                        .replace(/\D/g, '')
                        .replace(/(\d{4})/g, '$1 ')
                        .trim();
                      setFormData({
                        ...formData,
                        cardInfo: {...formData.cardInfo, number: formattedValue}
                      });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      value={formData.cardInfo.expiry}
                      onChange={(e) => {
                        const formattedValue = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .substring(0, 5);
                        setFormData({
                          ...formData,
                          cardInfo: {...formData.cardInfo, expiry: formattedValue}
                        });
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">CVV</label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      value={formData.cardInfo.cvv}
                      onChange={(e) => setFormData({
                        ...formData,
                        cardInfo: {...formData.cardInfo, cvv: e.target.value}
                      })}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Name on Card</label>
                  <input
                    type="text"
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    value={formData.cardInfo.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      cardInfo: {...formData.cardInfo, name: e.target.value}
                    })}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 mt-6">
        <button
          onClick={async () => {
            if (formData.paymentMethod === 'flouci') {
              await handleFlouciPayment();
            } else {
              // Existing credit card processing logic
              setIsProcessing(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setPaymentSuccess(true);
                setStep(5);
              } catch (error) {
                console.error('Payment failed:', error);
                setPaymentSuccess(false);
              } finally {
                setIsProcessing(false);
              }
            }
          }}
          disabled={isProcessing || !formData.paymentMethod}
          className={`w-full py-3 px-6 rounded-lg text-white text-sm font-medium ${
            isProcessing ? 'bg-teal-500' : 'bg-teal-600 hover:bg-teal-700'
          } transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {formData.paymentMethod === 'flouci' ? 'Redirecting to Payment...' : 'Processing Payment...'}
            </span>
          ) : (
            formData.paymentMethod === 'flouci' ? 'Pay with Flouci' : 'Complete Purchase'
          )}
        </button>

        <button
          onClick={() => setStep(3)}
          className="mt-3 w-full py-2.5 px-6 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Shipping
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div 
      className="bg-white p-8 rounded-lg border border-gray-100 shadow-xs text-center"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {paymentSuccess ? (
        <>
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-6">
            We've sent a confirmation to <span className="font-medium text-teal-600">{formData.email || 'your email'}</span>.
            Your items will be shipped soon.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setPaymentSuccess(false);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Issue</h2>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't process your payment. Please check your details and try again.
          </p>
          <button
            onClick={() => setStep(4)}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </>
      )}
    </motion.div>
  );

  // Progress indicator
  const ProgressStep = ({ number, label, active, completed }) => (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        completed ? 'bg-teal-600 text-white' : 
        active ? 'border-2 border-teal-600 text-teal-600 bg-white' : 
        'border border-gray-300 text-gray-500 bg-white'
      }`}>
        {completed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`mt-2 text-xs font-medium ${
        completed || active ? 'text-teal-600' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-10">
        <div className="flex items-center w-full max-w-md">
          <ProgressStep number={1} label="Checkout" active={step === 1} completed={step > 1} />
          <div className={`flex-1 h-px mx-2 ${step > 1 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
          <ProgressStep number={2} label="Information" active={step === 2} completed={step > 2} />
          <div className={`flex-1 h-px mx-2 ${step > 2 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
          <ProgressStep number={3} label="Shipping" active={step === 3} completed={step > 3} />
          <div className={`flex-1 h-px mx-2 ${step > 3 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
          <ProgressStep number={4} label="Payment" active={step === 4} completed={step > 4} />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutProcess;
