import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { FormContainer, SelectInput, TextInput } from "../Customcss/custom";
import Profilmoralservice from "../services/Profilemoral";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import axios from "axios";

const LEGAL_FORM_OPTIONS = [
  { value: "LLC", label: "Limited Liability Company (LLC)" },
  { value: "Corporation", label: "Corporation" },
  { value: "Sole Proprietorship", label: "Sole Proprietorship" },
  { value: "Partnership", label: "Partnership" },
];

const SECTOR_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Healthcare" },
  { value: "construction", label: "Construction" },
];
const REGION_OPTIONS = [
  { value: "API Sfax", label: "API Sfax" },
  { value: "API Sousse", label: "API Sousse" },
  { value: "API Tunis", label: "API Tunis" },
  { value: "Ariana", label: "Ariana" },
  { value: "Auto entrepreneur", label: "Auto entrepreneur" },
  { value: "Baja", label: "Baja" },
  { value: "Ben Arous", label: "Ben Arous" },
  { value: "Bizerte", label: "Bizerte" },
  { value: "Gabes", label: "Gabes" },
  { value: "Gafsa", label: "Gafsa" },
  { value: "Gasserine", label: "Gasserine" },
  { value: "Grombalia", label: "Grombalia" },
  { value: "Guchet Central", label: "Guchet Central" },
  { value: "Instance Tunisienne d'Investissement", label: "Instance Tunisienne d'Investissement" },
  { value: "Jandouba", label: "Jandouba" },
  { value: "Juridiction web", label: "Juridiction web" },
  { value: "Kairouan", label: "Kairouan" },
  { value: "Kebelli", label: "Kebelli" },
  { value: "Le Kef", label: "Le Kef" },
  { value: "Mahdia", label: "Mahdia" },
  { value: "Mannouba", label: "Mannouba" },
  { value: "Mednine", label: "Mednine" },
  { value: "Monastir", label: "Monastir" },
  { value: "Nabeul", label: "Nabeul" },
  { value: "RNE", label: "RNE" },
  { value: "Seliana", label: "Seliana" },
  { value: "Sfax", label: "Sfax" },
  { value: "Sfax 2", label: "Sfax 2" },
  { value: "Sidi Bou Zid", label: "Sidi Bou Zid" },
  { value: "Sousse", label: "Sousse" },
  { value: "Sousse 2", label: "Sousse 2" },
  { value: "Tataouin", label: "Tataouin" },
  { value: "Tozeur", label: "Tozeur" },
  { value: "Tunis 1", label: "Tunis 1" },
  { value: "Tunis 2", label: "Tunis 2" },
  { value: "Zaghouan", label: "Zaghouan" },

]
const BusinessDetail = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({
    phase: "profile",
    step: 3,
    totalSteps: 4
  });
  
  const [formData, setFormData] = useState({
    raison_social: "",
    numero_immatriculation: "",
    matricule_fiscale: "",
    registre_commerce: "",
    contact_responsable: "",
    business_email: "",
    forme_juridique: "",
    secteur_activite: "",
    business_phone: "",
    logo: null,
    region: "",
    profil: Cookies.get('id'),
  });
  
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem('registrationProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setFormData(prev => ({ ...prev, logo: file }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== "") {
        formDataToSend.append(key, formData[key]);
      }
    }
  
    const company = new FormData();
    company.append('company_name', formData.raison_social);
    company.append('region', formData.region);
  
    try {
      const response = await axios.post(
        'https://5b22-197-29-209-95.ngrok-free.app/ocr/verification/company/',
        company,
        
      );
  
      if ((response.data && response.data.success === true) || (response.success === true)) {
        await Profilmoralservice.addProfilemoral(formDataToSend);
  
        const newProgress = {
          phase: "identity-verification",
          step: 4,
          totalSteps: 4
        };
        setProgress(newProgress);
        localStorage.setItem('registrationProgress', JSON.stringify(newProgress));
        toast.success("Business profile submitted successfully!");
  
        setTimeout(() => navigate("/register/identity-verification"), 2000);
      } else {
        toast.error(
          response.data?.message || 
          "Company verification failed. Please check the company name and region."
        );
      }
    } catch (error) {
      console.error("Submission Error:", error);
      if (error.response) {
        // Server responded with a status outside the 2xx range
        toast.error(
          error.response.data?.message ||
          `Error ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from the server. Please try again later.");
      } else {
        // Something else happened
        toast.error(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeLogo = () => {
    setImage(null);
    setFormData(prev => ({ ...prev, logo: null }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <ToastContainer position="top-center" autoClose={3000} />
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm md:text-base font-medium text-gray-700 capitalize">
            {progress.phase.replace(/([A-Z])/g, ' $1').trim()} ({progress.step}/{progress.totalSteps})
          </span>
          <span className="text-xs md:text-sm text-gray-500">
            Step {progress.step} of {progress.totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-teal-500 h-2.5 rounded-full" 
            style={{ width: `${(progress.step / progress.totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">Business Information</h1>
      <p className="text-gray-600 text-center mb-6">
        Please provide your company details to complete your profile
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Logo Upload */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              onClick={triggerFileInput}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer overflow-hidden"
            >
              {image ? (
                <img 
                  src={image} 
                  alt="Company logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaCamera className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm">Upload Logo</span>
                </div>
              )}
            </div>
            {image && (
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FiX className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Max 2MB (JPEG, PNG)</p>
        </div>

        {/* Company Information Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <TextInput
              label="Company Name *"
              name="raison_social"
              placeholder="Enter company name"
              value={formData.raison_social}
              onChange={handleChange}
              required
            />
            
            <TextInput
              label="Registration Number *"
              name="numero_immatriculation"
              placeholder="Enter registration number"
              value={formData.numero_immatriculation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <SelectInput
            label="Business Sector *"
            name="secteur_activite"
            value={formData.secteur_activite}
            onChange={handleChange}
            options={SECTOR_OPTIONS}
            placeholder="Select your business sector"
            required
          />
          <SelectInput
            label="region *"
            name="region"
            value={formData.region}
            onChange={handleChange}
            options={REGION_OPTIONS}
            placeholder="Select your Region"
            required
          />
          </div>
        </div>

        {/* Legal Details Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Legal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <TextInput
              label="Trade Register"
              name="registre_commerce"
              placeholder="Enter trade register number"
              value={formData.registre_commerce}
              onChange={handleChange}
            />
            
            <SelectInput
              label="Legal Form *"
              name="forme_juridique"
              value={formData.forme_juridique}
              onChange={handleChange}
              options={LEGAL_FORM_OPTIONS}
              placeholder="Select legal form"
              required
            />
          </div>

          <TextInput
            label="Fiscal Number"
            name="matricule_fiscale"
            placeholder="Enter fiscal number"
            value={formData.matricule_fiscale}
            onChange={handleChange}
          />
        </div>

        {/* Contact Information Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <TextInput
              label="Contact Person *"
              name="contact_responsable"
              placeholder="Full name of contact person"
              value={formData.contact_responsable}
              onChange={handleChange}
              required
            />
            
            <TextInput
              label="Business Phone *"
              name="business_phone"
              placeholder="+216 00 000 000"
              value={formData.business_phone}
              onChange={handleChange}
              required
            />
          </div>

          <TextInput
            label="Business Email *"
            name="business_email"
            type="email"
            placeholder="contact@company.com"
            value={formData.business_email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="pt-3 md:pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-700 text-white font-medium py-2 md:py-3 px-4 rounded-md transition-colors disabled:bg-teal-400 flex justify-center items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Submit Business Details"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessDetail;