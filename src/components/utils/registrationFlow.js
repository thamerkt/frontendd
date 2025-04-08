// src/utils/registrationFlow.js
export const getRegistrationFlow = (role) => {
    const commonFlow = [
      { path: "/register/email-verification", step: 1, phase: "email_verification" },
      { path: "/register/profil", step: 2, phase: "profile_setup" },
    ];
  
    const individualFlow = [
      ...commonFlow,
      { path: "/register/qr", step: 3, phase: "qr_setup" },
      // Identity verification steps
      { 
        path: "/register/identity-verification/verification/document-type", 
        step: 4, 
        phase: "identity_verification",
        subStep: 1,
        subPhase: "document_selection"
      },
      { 
        path: "/register/identity-verification/verification/front-document", 
        step: 4, 
        phase: "identity_verification",
        subStep: 2,
        subPhase: "document_capture"
      },
      { 
        path: "/register/identity-verification/verification/back-document", 
        step: 4, 
        phase: "identity_verification",
        subStep: 3,
        subPhase: "document_capture"
      },
      { 
        path: "/register/identity-verification/verification/selfie", 
        step: 4, 
        phase: "identity_verification",
        subStep: 4,
        subPhase: "selfie_capture"
      },
      { 
        path: "/register/identity-verification/verification/VerificationComplete", 
        step: 4, 
        phase: "identity_verification",
        subStep: 5,
        subPhase: "verification_complete"
      }
    ];
  
    const companyFlow = [
      ...commonFlow,
      { path: "/register/business-details", step: 3, phase: "business_details" },
      { path: "/register/qr", step: 4, phase: "qr_setup" },
      // Identity verification steps
      { 
        path: "/register/identity-verification/verification/document-type", 
        step: 5, 
        phase: "identity_verification",
        subStep: 1,
        subPhase: "document_selection"
      },
      { 
        path: "/register/identity-verification/verification/front-document", 
        step: 5, 
        phase: "identity_verification",
        subStep: 2,
        subPhase: "document_capture"
      },
      { 
        path: "/register/identity-verification/verification/back-document", 
        step: 5, 
        phase: "identity_verification",
        subStep: 3,
        subPhase: "document_capture"
      },
      { 
        path: "/register/identity-verification/verification/selfie", 
        step: 5, 
        phase: "identity_verification",
        subStep: 4,
        subPhase: "selfie_capture"
      },
      { 
        path: "/register/identity-verification/verification/VerificationComplete", 
        step: 5, 
        phase: "identity_verification",
        subStep: 5,
        subPhase: "verification_complete"
      }
    ];
  
    return role === 'customer' ? individualFlow :companyFlow;
  };