import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";
import countryData from "world-countries";
import Profileservice from "../services/profileService";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FormContainer, SelectInput, CameraButton, NextButton, TextInput } from "../Customcss/custom";
import Cookies from "js-cookie";
import { Country, State } from "country-state-city";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiX } from "react-icons/fi";
import useProgressGuard from "../components/utils/ProcessGuard"
import { progress } from "framer-motion";




const ProfileForm = () => {
  
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();
  const [newProgress, setNewProgress] = useState({});
  const [Progress, setProgress] = useState({})
  
  
  //useProgressGuard(1, 2); 
  
  // Form state management
  const [formData, setFormData] = useState({
    first_name: Cookies.get('first_name') || '',
    last_name: Cookies.get('last_name') || '',
    date_of_birth: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postal_code: ""
    },
    phone: "",
    user: Cookies.get('keycloak_user_id'),
    countryCode: 'us',
  });

  const [physicalProfileData, setPhysicalProfileData] = useState({
    date_of_birth: "",
    gender: '',
    profile_picture: null,
  });

  const [selectedProfile, setSelectedProfile] = useState("physical");
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
 

  // Constants
  const GENDER_OPTIONS = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ];

  const COUNTRIES = countryData.map((country) => country.name.common).sort();

  // Effects
  useEffect(() => {

    
    
   
  
    
      if (selectedCountry) {
        const countryStates = State.getStatesOfCountry(selectedCountry);
        setStates(countryStates);
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            state: countryStates.length ? countryStates[0].name : ""
          },
        }));
      } else {
        setStates([]);
      }
    
  }, [selectedCountry]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.address) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhysicalProfileChange = (e) => {
    const { name, value } = e.target;
    setPhysicalProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setPhysicalProfileData(prev => ({
      ...prev,
      profile_picture: file,
    }));
  };

  const handlePhoneChange = (value, data) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const countryCode = countryData.find(c => c.name.common === country)?.cca2;

    setSelectedCountry(countryCode);
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, country },
      countryCode: countryCode?.toLowerCase() || 'us',
      phone: '',
    }));
  };

  const removeProfilePicture = () => {
    setPhysicalProfileData(prev => ({ ...prev, profile_picture: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.first_name || !formData.last_name) {
      toast.error("Please enter your full name");
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone) {
      toast.error("Please enter your phone number");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address.country) {
      toast.error("Please select your country");
      setIsSubmitting(false);
      return;
    }

    if (selectedProfile === "physical" && !physicalProfileData.gender) {
      toast.error("Please select your gender");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the structured data object
      const requestData = {
        address: {
          street: formData.address.street || "",
          city: formData.address.city || "",
          state: formData.address.state || "",
          country: formData.address.country || "",
          postal_code: formData.address.postal_code || ""
        },
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        user: formData.user
      };
  
      // For physical profile, add additional fields
      if (selectedProfile === "physical") {
        requestData.date_of_birth = physicalProfileData.date_of_birth || "";
        requestData.gender = physicalProfileData.gender || "";
      }
  
      // Create FormData for potential file upload
      const formDataToSend = new FormData();
  
      // Append all fields including the nested address
      formDataToSend.append('first_name', requestData.first_name);
      formDataToSend.append('last_name', requestData.last_name);
      formDataToSend.append('phone', requestData.phone);
      formDataToSend.append('user', requestData.user);
  
      // Append address fields individually
      formDataToSend.append('address[street]', requestData.address.street);
      formDataToSend.append('address[city]', requestData.address.city);
      formDataToSend.append('address[state]', requestData.address.state);
      formDataToSend.append('address[country]', requestData.address.country);
      formDataToSend.append('address[postal_code]', requestData.address.postal_code);
  
      // Append physical profile fields if needed
      if (selectedProfile === "physical") {
        if (requestData.date_of_birth) {
          formDataToSend.append('date_of_birth', requestData.date_of_birth);
        }
        if (requestData.gender) {
          formDataToSend.append('gender', requestData.gender);
        }
        if (physicalProfileData.profile_picture) {
          formDataToSend.append('profile_picture', physicalProfileData.profile_picture);
        }
      }
  
      // Submit data
      const response = await Profileservice.addProfil(formDataToSend, role);
      Cookies.set('id', response.id);
      localStorage.setItem("role", role);
  
      if (selectedProfile === "physical") {
        formDataToSend.append('profil', response.id);
        await Profileservice.addPhysicalProfile(formDataToSend);
        setTimeout(() => {
          navigate("/register/identity-verification");
        }, 3000);
      } else {
        setTimeout(() => {
          navigate("/register/business-details");
        }, 3000);
      }
  
      sessionStorage.setItem('progress', JSON.stringify({ "progress": "step3" }));
      toast.success('Profile created successfully!');
  
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="rounded-lg shadow-sm"
        progressClassName="bg-teal-600"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture - More compact */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 hover:border-teal-400 transition-all cursor-pointer overflow-hidden"
            >
              {physicalProfileData.profile_picture ? (
                <img
                  src={URL.createObjectURL(physicalProfileData.profile_picture)}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaCamera className="text-gray-400 text-xl" />
              )}
            </div>
            {physicalProfileData.profile_picture && (
              <button
                type="button"
                onClick={removeProfilePicture}
                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-3 h-3 text-gray-500" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoUpload}
              accept="image/*"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">JPEG/PNG, max 2MB</p>
        </div>

        {/* Profile Type - More compact */}
        <div>
          <h2 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Profile type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedProfile("physical");
                setRole("equipment_manager_individual");
                setNewProgress({
                  phase: "Personal details",
                  step: 3,
                  totalSteps: 3
                });
              }}
              className={`p-3 border rounded-lg transition-all text-left ${
                selectedProfile === "physical"
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-teal-300"
              }`}
            >
              <h3 className="text-sm font-medium">Personal</h3>
              <p className="text-xs text-gray-500 mt-1">Individual users</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProfile("moral");
                setRole("equipment_manager_company");
                setNewProgress({
                  phase: "Personal details",
                  step: 3,
                  totalSteps: 4
                });
              }}
              className={`p-3 border rounded-lg transition-all text-left ${
                selectedProfile === "moral"
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-teal-300"
              }`}
            >
              <h3 className="text-sm font-medium">Business</h3>
              <p className="text-xs text-gray-500 mt-1">Companies</p>
            </button>
          </div>
        </div>

        {/* Personal Information - More compact */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personal information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
          </div>

          {selectedProfile === "physical" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={physicalProfileData.date_of_birth}
                  onChange={handlePhysicalProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={physicalProfileData.gender}
                  onChange={handlePhysicalProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                >
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information - More compact */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact information</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone number *</label>
            <PhoneInput
              country={formData.countryCode}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
              dropdownClass="border border-gray-200 rounded-lg shadow-sm text-sm"
              placeholder=""
              required
            />
          </div>
        </div>

        {/* Address Information - More compact */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
              <select
                name="country"
                value={formData.address.country}
                onChange={handleCountryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              >
                <option value="">Select</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State/Province</label>
                <select
                  name="state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  disabled={!formData.address.country}
                >
                  <option value="">Select</option>
                  {states.map(state => (
                    <option key={state.name} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Street address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Postal code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.address.postal_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
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
                Saving...
              </>
            ) : (
              "Complete Profile"
            )}
          </button>
        </div>
      </form>
    </div>
  );

};

export default ProfileForm;