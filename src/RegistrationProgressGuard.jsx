import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RegistrationProgressGuard = ({ allowedStep }) => {
  const location = useLocation();

  // Get progress from sessionStorage (default to 'step1')
  const progressData = sessionStorage.getItem('progress');
  let progress = 'step1';

  try {
    const parsed = typeof progressData === 'string' ? JSON.parse(progressData) : {};
    progress = parsed?.progress || 'step1';
  } catch {
    progress = progressData || 'step1';
  }

  const role = localStorage.getItem('role');

  const stepsOrder = ['step1', 'step2', 'step3', 'step4'];
  const stepToPath = {
    step1: '/register/email-verification',
    step2: '/register/profil',
    step3: '/register/business-details',
    step4: '/register/identity-verification',
  };

  // Validate step
  const isValidStep = stepsOrder.includes(progress);
  const currentPath = isValidStep ? stepToPath[progress] : stepToPath.step1;

  

  // Redirect if current route does not match user's progress
  if (location.pathname !== currentPath) {
    return <Navigate to={currentPath} replace />;
  }

  return <Outlet />;
};

export default RegistrationProgressGuard;
