import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const useProgressGuard = (requiredPhase, requiredStep) => {
  const navigate = useNavigate();

  useEffect(() => {
    const progressCookie = Cookies.get("register_progress");

    if (!progressCookie) {
      console.warn("❌ No progress cookie found. Redirecting to start.");
      return navigate("/register/email-verification");
    }

    let progress;
    try {
      progress = JSON.parse(progressCookie);
    } catch (error) {
      console.error("🚫 Failed to parse progress JSON from cookies:", error);
      return navigate("/register/email-verification");
    }

    const isVerified = progress.verified ?? progress.isVerified;

    // Check if user is on the correct step
    if (
      progress.phase === requiredPhase &&
      progress.currentStep === requiredStep &&
      isVerified === true
    ) {
      // All good: stay here
      return;
    }

    // If user is verified but not on the correct step => redirect to correct step
    const role = Cookies.get("role") || "customer";
    const nextStepPath = getStepPath(progress.currentStep, role);
    navigate(nextStepPath);
  }, [requiredPhase, requiredStep]);
};

const getStepPath = (step, role) => {
  switch (step) {
    case 1:
      return "/register/email-verification";
    case 2:
      return "/register/profil";
    case 3:
      return role !== "customer" && role !== "equipment_manager_individual"
        ? "/register/business-details"
        : "/register/identity-verification";
    case 4:
      return "/register/identity-verification";
    default:
      return "/register/email-verification";
  }
};

export default useProgressGuard;
