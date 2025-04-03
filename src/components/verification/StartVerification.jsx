import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './styles/Verification.css';

const StartVerification = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/verification/document-upload');
  };

  return (
    <motion.div 
      className="verification-step"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="illustration-container">
        <img src="/assets/illustrations/verify-id.svg" alt="ID Verification" />
      </div>
      
      <h1 className="step-title">Verify Your Identity</h1>
      <p className="step-description">
        To ensure security, we need to verify your identity. This process takes about 2 minutes.
      </p>

      <div className="step-benefits">
        <div className="benefit-item">
         
          <span>Secure encrypted process</span>
        </div>
        <div className="benefit-item">
    
          <span>Approved in under 24 hours</span>
        </div>
      </div>

      <button 
        className="primary-button"
        onClick={handleStart}
      >
        Begin Verification
      </button>

      <div className="step-progress">
        <div className="progress-active">1</div>
        <div className="progress-divider" />
        <div className="progress-inactive">2</div>
        <div className="progress-divider" />
        <div className="progress-inactive">3</div>
      </div>
    </motion.div>
  );
};

export default StartVerification