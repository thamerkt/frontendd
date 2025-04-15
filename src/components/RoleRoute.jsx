import React from "react";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ allowedRoles = [], children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roles = user.roles || [];

  const hasAccess = allowedRoles.some(role => roles.includes(role));
  return hasAccess ? children : <Navigate to="/unauthorized" />;
};

export default RoleRoute;
