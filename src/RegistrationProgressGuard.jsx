import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RegistrationProgressGuard = ({ allowedStep }) => {
  const location = useLocation();

  // Get progress from sessionStorage (object or string)
  const progressData = sessionStorage.getItem('progress');
  let progress = 'step1';
  try {
    const parsed = JSON.parse(progressData);
    progress = parsed?.progress || 'step1';
  } catch {
    progress = progressData || 'step1';
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  const stepsOrder = ['step1', 'step2', 'step3', 'step4'];
  const stepToPath = {
    step1: '/register/email-verification',
    step2: '/register/profil',
    step3: '/register/business-details',
    step4: '/register/identity-verification',
  };

  const currentStepIndex = stepsOrder.indexOf(progress);

  // Special case for step4 role restriction
  if (progress === 'step4' && role !== 'equipment_manager_company') {
    return <Navigate to="/dashboard" replace />;
  }

  const currentPath = stepToPath[progress] || '/register/email-verification';
  console.log(currentPath);
  // If current URL is not matching current progress path → redirect
  if (location.pathname !== currentPath) {
    return <Navigate to={currentPath} replace />;
  }

  return <Outlet />;
};

export default RegistrationProgressGuard;
