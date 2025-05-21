export const hasRole = (requiredRoles = []) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role || 'customer';
  
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    return requiredRoles === userRole;
  };
  