import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
const GoogleLoginButton = () => {
  const handleSuccess = async (response) => {
    console.log("Google Login Success:", response);
    const { credential } = response;

    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/google/", {
        token: credential,
      });

      console.log("Django Auth Response:", res.data);
      localStorage.setItem("token", res.data.token); // Stocke le token pour les futures requêtes
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="212550472673-t284aqtqhbtcs80oflf6e35mck2hjkpb.apps.googleusercontent.com" >
      <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;