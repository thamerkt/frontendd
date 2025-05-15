import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import authStore from "../redux/authStore";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const clientId = '348131616981-85ms78t7eshj5l60pg07adpe9fc00tbt.apps.googleusercontent.com';


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [Error,setError]=useState()

  const  handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    try{
      await authStore.login(email,password)
      console.log("login successful")
    }catch(err){

      console.error("Login failed:", err);
      setError("Invalid email or password");

    }
  };
  const handleSuccess = async (credentialResponse) => {
      console.log("Google OAuth Success:", credentialResponse);
  
      // Extract the authorization code from the credential response
      const { credential } = credentialResponse;
      
  
      try {
        // Send the authorization code to your Django backend
<<<<<<< HEAD
        const response = await fetch('http://localhost:8000/user/auth/google/', {
=======
        const response = await fetch('https://d537-196-239-28-180.ngrok-free.app/user/auth/google/', {
>>>>>>> df860680ec1963b93ce6ae0b21fb09c999430337
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('User authenticated:', data);
  
          // Store the access token (if returned by the backend)
          if (data.userdata.access_token) {
            
            Cookies.set('token',data.userdata.access_token)
            Cookies.set('keycloak_user_id',data.userdata.user_id)
            Cookies.set('first_name',data.userdata.first_name)
            Cookies.set('last_name',data.userdata.last_name)
            
  
          }else{
            console.log("no")
          }
  
          // Redirect the user or show a success message
          toast.success("Google login successful! Redirecting...");
          setTimeout(() => navigate("/register/profil"), 3000); // Redirect to the dashboard or another page
        } else {
          const errorData = await response.json();
          console.error('Authentication error:', errorData);
          toast.error("Google login failed. Please try again.");
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

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 font-dm-serif">
          Login to your Account
        </h2>
        <p className="text-gray-600 mb-4 font-dm-sans font-medium">
          Log in to access Everything Rentals
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-xs">
          <input 
            className="w-full border p-3 mb-4" 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative w-full mb-4">
            <input
              className="w-full border p-3 pr-10"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={passwordVisible ? "/assets/visible.png" : "/assets/invisible.png"}
              alt="Toggle Password Visibility"
              className="absolute right-3 top-3 w-6 h-6 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
          </div>
          <p>{Error}</p>

          <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded mb-4 flex items-center justify-center">
            Log in to your Account
            <img src="/assets/arrow.png" alt="Arrow Icon" className="w-6 h-6 ml-2" />
          </button>
        </form>

        <div className="space-y-3">
                    
        
                    {/* Google OAuth Login */}
                    <GoogleOAuthProvider clientId={clientId}>
                      <GoogleLogin
        
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap
                      />
                    </GoogleOAuthProvider>
        
                    {[
                      { img: "f2.png", bg: "bg-blue-600", text: "text-white", hover: "hover:bg-blue-700", label: "Sign in with Facebook" },
                      { img: "apple.png", bg: "bg-white", text: "text-black", hover: "hover:bg-gray-200", label: "Sign in with Apple" }
                    ].map(({ img, bg, text, hover, label }, index) => (
                      <button
                        key={index}
                        className={`w-full p-3 border ${bg} ${text} rounded-md flex items-center justify-center ${hover} transition duration-300`}
                      >
                        <img src={`/assets/${img}`} alt={label} className="w-5 h-5 mr-3" />
                        {label}
                      </button>
                    ))}
                  </div>

        <p className="mt-4 font-semibold">Forgot Password?</p>
        <p className="mt-2">
          Don't have an account yet? 
          <span className="text-blue-500 font-semibold cursor-pointer" onClick={() => navigate("/")}> Register now!</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
