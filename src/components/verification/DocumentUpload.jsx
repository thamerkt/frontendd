import { FiArrowRight } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import Cookies from "js-cookie";

const DocumentTypeSelection = ({ onNext, setDocumentType }) => {
  const navigate = useNavigate();
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const { user, local_ip } = useParams();
  const cleanedUser = user.replace(/:/g, "");  // Clean the 'user' parameter

  const handleContinue = () => {
    // Store the cleaned user and local_ip (without the colon)
    Cookies.set("SelectedDocumentType", selectedDocumentType);
    Cookies.set("user", cleanedUser); // Store cleaned user (without colon)
    Cookies.set("local_ip", local_ip); // Store local_ip as is

    onNext?.();
    navigate('/register/identity-verification/verification/front-document');
  };

  const documentOptions = [
    { value: '2', label: 'Passeport' },
    { value: '3', label: 'Permis de conduire' },
    { value: '1', label: "Carte d'identité nationale" },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Choisissez un type de document</h2>
      <p className="text-gray-600 mb-6">Veuillez sélectionner le type de document à vérifier</p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {documentOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setSelectedDocumentType(value);
              setDocumentType?.(value);
            }}
            className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center ${
              selectedDocumentType === value
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedDocumentType}
        className={`w-full py-3 px-6 rounded-lg flex items-center justify-center transition-all ${
          selectedDocumentType
            ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continuer <FiArrowRight className="inline ml-2" />
      </button>
    </div>
  );
};

export default DocumentTypeSelection;
