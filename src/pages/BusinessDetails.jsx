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
        'https://b010-41-230-62-140.ngrok-free.app/ocr/verification/company/',
        company,
      );
  
      if ((response.data && response.data.success === true) || (response.success === true)) {
        await Profilmoralservice.addProfilemoral(formDataToSend);
  
        toast.success("Business profile submitted successfully!");
        sessionStorage.setItem('progress', JSON.stringify({ "progress": "step4" }));
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
        toast.error(
          error.response.data?.message ||
          `Error ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
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
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="rounded-lg shadow-sm"
        progressClassName="bg-teal-600"
      />

      <h1 className="text-xl font-bold text-center text-gray-800 mb-2">Business Information</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Please provide your company details to complete your profile
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              onClick={triggerFileInput}
              className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 hover:border-teal-400 transition-all cursor-pointer overflow-hidden"
            >
              {image ? (
                <img 
                  src={image} 
                  alt="Company logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaCamera className="w-5 h-5 mb-1" />
                  <span className="text-xs">Upload Logo</span>
                </div>
              )}
            </div>
            {image && (
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-0 right-0 bg-white text-gray-500 rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-3 h-3" />
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
          <p className="text-xs text-gray-400 mt-1">JPEG/PNG, max 2MB</p>
        </div>

        {/* Company Information Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
              <input
                type="text"
                name="raison_social"
                placeholder="Enter company name"
                value={formData.raison_social}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registration Number *</label>
              <input
                type="text"
                name="numero_immatriculation"
                placeholder="Enter registration number"
                value={formData.numero_immatriculation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Business Sector *</label>
              <select
                name="secteur_activite"
                value={formData.secteur_activite}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              >
                <option value="">Select your business sector</option>
                {SECTOR_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Region *</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              >
                <option value="">Select your Region</option>
                {REGION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legal Details Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trade Register</label>
              <input
                type="text"
                name="registre_commerce"
                placeholder="Enter trade register number"
                value={formData.registre_commerce}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Legal Form *</label>
              <select
                name="forme_juridique"
                value={formData.forme_juridique}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              >
                <option value="">Select legal form</option>
                {LEGAL_FORM_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fiscal Number</label>
            <input
              type="text"
              name="matricule_fiscale"
              placeholder="Enter fiscal number"
              value={formData.matricule_fiscale}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person *</label>
              <input
                type="text"
                name="contact_responsable"
                placeholder="Full name of contact person"
                value={formData.contact_responsable}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Business Phone *</label>
              <input
                type="text"
                name="business_phone"
                placeholder="+216 00 000 000"
                value={formData.business_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Business Email *</label>
            <input
              type="email"
              name="business_email"
              placeholder="contact@company.com"
              value={formData.business_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:bg-teal-400 flex justify-center items-center text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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