import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-50 flex items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-gray-800">Everything Rentals</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        <h2 className="text-3xl font-bold text-gray-800">Login to your Account</h2>
        <p className="text-gray-600 mb-6">Log in to access Everything Rentals</p>
        
        <input className="w-full border p-3 mb-4" type="email" placeholder="Email" />
        <input className="w-full border p-3 mb-4" type="password" placeholder="Password" />
        
        <button className="w-full bg-teal-500 text-white py-3 rounded mb-4 flex items-center justify-center">
          Log in to your Account →
        </button>
        
        <button className="w-full border py-3 rounded mb-2 flex items-center justify-center">
          <img src="/assets/google-icon.png" alt="Google" className="w-5 h-5 mr-2" /> Sign In with Google
        </button>
        <button className="w-full border py-3 rounded mb-2 bg-blue-600 text-white flex items-center justify-center">
          <img src="/assets/facebook-icon.png" alt="Facebook" className="w-5 h-5 mr-2" /> Sign In with Facebook
        </button>
        <button className="w-full border py-3 rounded flex items-center justify-center">
          <img src="/assets/apple-icon.png" alt="Apple" className="w-5 h-5 mr-2" /> Sign In with Apple
        </button>
        
        <p className="mt-4 font-semibold">Forgot Password?</p>
        <p className="mt-2">
          Don't have an account yet? 
          <span className="text-blue-500 font-semibold cursor-pointer" onClick={() => navigate("/")}>
            Register now!
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
