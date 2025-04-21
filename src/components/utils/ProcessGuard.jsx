import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getRedirectPath } from "./getRedirectPath";

const ProcessGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const progress = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("registrationProgress")) || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const expectedPath = getRedirectPath(progress);
    if (expectedPath && location.pathname !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [progress, location.pathname, navigate]);

  return <Outlet />;
};

export default ProcessGuard;
