export function getRedirectPath(progress) {
    if (!progress || !progress.step) return "/register/email-verification";
  
    const { step} = progress;
    const role=localStorage.getItem("role")

  
    switch (step) {
      case 1:
        return "/register";
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
  }
  