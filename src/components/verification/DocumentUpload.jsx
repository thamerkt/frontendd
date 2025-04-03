import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DocumentTypeSelection = ({ onNext, setDocumentType }) => {
  const navigate = useNavigate();
  const [selectedDocumentType, setSelectedDocumentType] = useState('');

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Document Type</h2>
      <p className="text-gray-600 mb-6">Please select the type of document you want to verify</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => {
            setSelectedDocumentType('passport');
            setDocumentType?.('passport'); 
          }}
          className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center ${
            selectedDocumentType === 'passport' 
              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium shadow-sm' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          Passport
        </button>
        <button
          onClick={() => {
            setSelectedDocumentType('id');
            setDocumentType?.('id');
          }}
          className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center ${
            selectedDocumentType === 'id' 
              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium shadow-sm' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          National ID
        </button>
      </div>
      
      <button
        onClick={() => {
          onNext?.();
          navigate('/register/identity-verification/verification/front-document');
        }}
        disabled={!selectedDocumentType}
        className={`w-full py-3 px-6 rounded-lg flex items-center justify-center transition-all ${
          selectedDocumentType 
            ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue <FiArrowRight className="inline ml-2" />
      </button>
    </div>
  );
};

export default DocumentTypeSelection;
