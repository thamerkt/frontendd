// src/components/RegistrationProgressGuard.js
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { getRegistrationFlow } from "../components/utils/registrationFlow";

const RegistrationProgressGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      // Get saved progress and role from localStorage
      const savedProgressStr = localStorage.getItem('registrationProgress');
      const role = localStorage.getItem('role') || 'individual'; // Default to individual
      
      console.log('Current role:', role);
      console.log('Saved progress:', savedProgressStr);

      // Parse saved progress with defaults if not exists
      const savedProgress = savedProgressStr 
        ? JSON.parse(savedProgressStr) 
        : { 
            step: 1, 
            phase: "email_verification",
            subStep: 0
          };

      // Get the appropriate flow based on role
      const flow = getRegistrationFlow(role);
      console.log('Registration flow:', flow);

      // Find current route in the flow
      const currentRoute = flow.find(step => step.path === location.pathname);
      console.log('Current route:', currentRoute);

      if (!currentRoute) {
        console.log('Route not found in flow, allowing access');
        return;
      }

      // Check if user is trying to access a step they shouldn't
      if (savedProgress.step < currentRoute.step) {
        console.log(`User at step ${savedProgress.step} trying to access step ${currentRoute.step}, redirecting...`);
        
        // Find the highest completed step in the flow
        const targetRoute = flow.find(step => step.step === savedProgress.step);
        const redirectPath = targetRoute?.path || "/register/email-verification";
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath);
        return;
      }

      // For identity verification steps, check sub-steps
      if (currentRoute.phase === "identity_verification" && savedProgress.subStep < currentRoute.subStep) {
        console.log(`User at sub-step ${savedProgress.subStep} trying to access sub-step ${currentRoute.subStep}`);
        
        const targetRoute = flow.find(
          step => step.step === currentRoute.step && step.subStep === savedProgress.subStep
        );
        
        const fallbackRoute = flow.find(step => step.step === currentRoute.step);
        const redirectPath = targetRoute?.path || fallbackRoute?.path;
        
        if (redirectPath) {
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error('Error in RegistrationProgressGuard:', error);
      // Fallback to email verification if something goes wrong
      navigate("/register/email-verification");
    }
  }, [location.pathname, navigate]);

  return <Outlet />;
};

export default RegistrationProgressGuard;