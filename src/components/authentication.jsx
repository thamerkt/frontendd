import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authStore from "../redux/authStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '348131616981-85ms78t7eshj5l60pg07adpe9fc00tbt.apps.googleusercontent.com';
const facebookAppId = '445559468644845';

const AuthForm = ({ isPopup = false, onClose = () => {} }) => {
  const location = useLocation();
  const isRegister = location.pathname === "/register";
  const navigate = useNavigate();

  // Initialize Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v12.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTimeout(() => {
        const user = JSON.parse(userData);
        const role = user?.role || 'customer';
        
        // Check if user is suspended
        if (user?.is_suspended) {
          toast.error("Your account has been suspended. Please contact support.");
          return;
        }

        // Check if user is verified (except for admin)
        if (role !== 'admin' && !user?.is_verified) {
          toast.warning("Please verify your email before proceeding.");
          return;
        }

        if (role === 'customer') {
          navigate('/');
        } else if (role === 'admin') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(isRegister && {
      role: "",
      confirmPassword: "",
    })
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const field = e.target.name;
    
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    setError("");
  };

  const handleSuccess = async (credentialResponse) => {
    console.log("Google OAuth Success:", credentialResponse);
    const { credential } = credentialResponse;
  
    try {
      const response = await fetch('https://kong-7e283b39dauspilq0.kongcloud.dev/user/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('User authenticated:', data);
  
        if (data.userdata) {
          const roles = data.userdata.roles || [];
          let role = 'customer'; // default
          
          if (roles.includes('customer')) {
            role = 'customer';
          } else if (roles.includes('equipment_manager_company') || roles.includes('equipment_manager_individual')) {
            role = 'rental';
          } else if (roles.length === 0) {
            role = 'admin';
          }
  
          const userInfo = {
            email: data.userdata.email,
            role: role,
            first_name: data.userdata.first_name,
            last_name: data.userdata.last_name,
            is_verified: data.userdata.is_verified || false,
            is_suspended: data.userdata.is_suspended || false,
            token: data.token?.access_token // Store the access token if available
          };
          
          localStorage.setItem('user', JSON.stringify(userInfo));
          
          // Check verification and suspension status
          if (userInfo.is_suspended) {
            toast.error("Your account has been suspended. Please contact support.");
            return;
          }
  
          if (!userInfo.is_verified && userInfo.role !== 'admin') {
            toast.warning("Please verify your email before proceeding.");
            return;
          }
  
          toast.success("Google login successful! Redirecting...");
          setTimeout(() => {
            if (role === 'customer') {
              navigate('/client/dashboard');
            } else if (role === 'admin') {
              navigate('/owner/dashboard');
            } else if (role === 'rental') {
              navigate('/');
            }
          }, 3000);
        }
      } else {
        const errorData = await response.json();
        console.error('Authentication error:', errorData);
        toast.error(errorData.message || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleError = () => {
    console.error('Google OAuth failed');
    toast.error("Google login failed. Please try again.");
  };

  const handleFacebookLogin = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          handleFacebookResponse(response.authResponse);
        } else {
          console.log('User cancelled login or did not fully authorize.');
          toast.error("Facebook login was cancelled.");
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  const handleFacebookResponse = async (authResponse) => {
    console.log("Facebook OAuth Success:", authResponse);
  
    try {
      window.FB.api('/me', { fields: 'name,email' }, async (userInfo) => {
        try {
          const fbResponse = await fetch('https://kong-7e283b39dauspilq0.kongcloud.dev/user/auth/facebook/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              accessToken: authResponse.accessToken,
              userID: authResponse.userID,
              email: userInfo.email,
              name: userInfo.name
            }),
          });
  
          if (fbResponse.ok) {
            const data = await fbResponse.json();
            console.log('User authenticated:', data);

            if (data.userdata) {
              const userInfo = {
                email: data.userdata.email,
                role: data.userdata.role || 'customer',
                first_name: data.userdata.first_name,
                last_name: data.userdata.last_name,
                token: data.userdata.access_token,
                is_verified: data.userdata.is_verified || false,
                is_suspended: data.userdata.is_suspended || false
              };
              
              localStorage.setItem('user', JSON.stringify(userInfo));

              // Check verification and suspension status
              if (userInfo.is_suspended) {
                toast.error("Your account has been suspended. Please contact support.");
                return;
              }

              if (!userInfo.is_verified && userInfo.role !== 'admin') {
                toast.warning("Please verify your email before proceeding.");
                return;
              }

              if (data.userdata?.user_exists === true) {
                toast.success("Facebook login successful! Redirecting...");
                setTimeout(() => {
                  const role = userInfo.role;
                  if (role === 'customer') {
                    navigate('/');
                  } else if (role === 'admin') {
                    navigate('/owner/dashboard');
                  } else {
                    navigate('/collaboration');
                  }
                }, 3000);
              } else {
                setTimeout(() => {
                  navigate('/register/email-verification');
                }, 3000);
              }
            }
          } else {
            const errorData = await fbResponse.json();
            console.error('Authentication error:', errorData);
            toast.error(errorData.message || "Facebook login failed. Please try again.");
          }
        } catch (error) {
          console.error('Network error:', error);
          toast.error("Network error. Please try again.");
        }
      });
    } catch (error) {
      console.error('Facebook API error:', error);
      toast.error("Failed to fetch Facebook user info.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
  
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        toast.error("Passwords do not match!");
        return;
      }
  
      if (!validatePassword(formData.password)) {
        setError("Password must be at least 8 characters, include a number and a special character.");
        toast.error("Password must be at least 8 characters, include a number and a special character.");
        return;
      }
    }
  
    setLoading(true);
  
    try {
      if (isRegister) {
        const response = await authStore.signup(formData.email, formData.password, formData.role || 'customer');
        setFormData({ email: "", password: "", confirmPassword: "", role: formData.role});
        localStorage.setItem('role', formData.role);
        toast.success("Registration successful! Please check your email for verification.", );
        sessionStorage.setItem('progress', JSON.stringify({ "progress": "step1" }));
        setTimeout(() => navigate("/register/email-verification"), 3000);
      } else {
        const userData = await authStore.login(formData.email, formData.password);
        
        // Check if user is suspended
        if (userData.user.is_suspended) {
          toast.error("Your account has been suspended. Please contact support.");
          return;
        }
  
        // Check if user is verified (except for admin)
        const roles = userData.user.roles || [];
        const isEmptyRoles = roles.length === 0;
        
        if (!isEmptyRoles && !userData.user.is_verified) {
          toast.warning("Your account is not verified. Please check your email for verification instructions.");
          return;
        }
  
        // Determine the role based on roles array
        let role = formData.role; // default
        if (isEmptyRoles) {
          role = 'admin';
        } else if (roles.includes('customer')) {
          role = 'customer';
        } else if (roles.includes('equipment_manager_company') || roles.includes('equipment_manager_individual')) {
          role = 'rental';
        }
      
        // Store user data
        localStorage.setItem('user', JSON.stringify({
          email: userData.user.username,
          role,
          user_id: userData.user_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_verified: userData.user.is_verified,
          is_suspended: userData.user.is_suspended,
          token: userData.token.access_token // Store the access token
        }));
      
        // Show appropriate success message
        if (isEmptyRoles) {
          toast.success("Admin login successful! Redirecting to dashboard...");
        } else {
          toast.success("Login successful! Redirecting...");
        }
      
        // Redirect based on role
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/owner/dashboard');
          } else if (role === 'customer') {
            navigate('/client/dashboard');
          } else if (role === 'rental') {
            navigate('/');
          }
  
          if (isPopup) onClose();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      const action = isRegister ? "Registration" : "Login";
      const errorMessage = error.response?.data?.message || `${action} Failed. Please try again.`;
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isPopup ? '' : 'min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'}`}>
      <div className={`${isPopup ? '' : 'sm:mx-auto sm:w-full sm:max-w-md'}`}>
        {isPopup && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isRegister ? <img src="/logo-ekrini.png" alt="Ekrini" className="h-10" /> : <img src="/logo-ekrini.png" alt="Ekrini" className="h-10" />}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className={`${isPopup ? '' : 'mt-8 sm:mx-auto sm:w-full sm:max-w-md'}`}>
        <div className={`bg-white ${isPopup ? 'p-4' : 'py-8 px-4 shadow sm:rounded-lg sm:px-10'}`}>
          {!isPopup && (
            <div className="text-center mb-6">
              <img src="/assets/logo-ekrini.png" alt="Ekrini" className="h-12 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                {isRegister ? (
                  <>
                    Get started with <span className="text-teal-600">E</span>krini
                  </>
                ) : "Sign in to access your account"}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="focus:outline-none"
                  >
                    {passwordVisible ? (
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={confirmPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        className="focus:outline-none"
                      >
                        {confirmPasswordVisible ? (
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
  id="role"
  name="role"
  value={formData.role}
  onChange={handleChange}
  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
>
  <option value="">Select account type</option>
  <option value="customer">Customer</option>
  <option value="equipment_manager_individual">Owner</option>
</select>
                </div>
              </>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegister ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  isRegister ? "Create Account" : "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
  <div className="w-full"> {/* Add this wrapper div */}
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_blue"
        size="large"
        width="100%"
        text={isRegister ? "signup_with" : "signin_with"}
      />
    </GoogleOAuthProvider>
  </div>

  <button
    onClick={handleFacebookLogin}
    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    <svg className="w-5 h-5 mr-2" fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
    </svg>
    Continue with Facebook
  </button>
</div>
          </div>
        </div>

        {!isPopup && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                onClick={() => navigate(isRegister ? "/login" : "/register")}
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AuthForm;
