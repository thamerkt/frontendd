import { useState, useRef } from "react";
import { CameraIcon, Loader2 } from "lucide-react";
import { FormContainer, SelectInput, CameraButton, NextButton, TextInput } from "../Customcss/custom";
import Profilmoralservice from "../services/Profilemoral";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"

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

const BusinessDetail = () => {
  const navigate=useNavigate()
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
    profil: Cookies.get('id'),
  });
  
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate image size (max 2MB)
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

    try {
      const response = await Profilmoralservice.addProfilemoral(formDataToSend);
      setTimeout(() => {
        navigate("/register/identity-verification");
      }, 3000);
      toast.success("Business profile submitted successfully!");
      console.log("Submission successful:", response);
    } catch (error) {
      toast.error(error.message);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>

    <ToastContainer position="top-right" autoClose={5000} />
    <FormContainer>
      <div className="flex flex-col items-center ">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Please provide your company details to complete your profile
        </p>

        {/* Logo Upload */}
        <div className="relative group mb-8">
          <div 
            onClick={triggerFileInput}
            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-white hover:border-blue-500 transition-colors cursor-pointer overflow-hidden"
          >
            {image ? (
              <img 
                src={image} 
                alt="Company logo" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="flex flex-col items-center">
                <CameraIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                <span className="text-xs text-gray-500 mt-1">Upload Logo</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {image && (
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setFormData(prev => ({ ...prev, logo: null }));
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Company Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-6">
            <SelectInput
              label="Business Sector *"
              name="secteur_activite"
              value={formData.secteur_activite}
              onChange={handleChange}
              options={SECTOR_OPTIONS}
              placeholder="Select your business sector"
              required
            />
          </div>
        </div>

        {/* Legal Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Legal Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-6">
            <TextInput
              label="Fiscal Number"
              name="matricule_fiscale"
              placeholder="Enter fiscal number"
              value={formData.matricule_fiscale}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-6">
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
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-blue-400 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Submit Business Details"
            )}
          </button>
        </div>
      </form>
    </FormContainer>
    </>
  );
};

export default BusinessDetail;