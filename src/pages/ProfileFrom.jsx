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




const ProfileForm = () => {
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();
  const [newProgress, setNewProgress] = useState({});
  const [progress, setProgress] = useState({
    phase: "profile",
    step: 3,
    totalSteps: 3
  });
  
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
    const savedProgress = localStorage.getItem('registrationProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
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
      const formDataToSend = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'address') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formDataToSend.append(`address[${subKey}]`, subValue);
          });
        } else if (value) {
          formDataToSend.append(key, value);
        }
      });

      // Append physical profile data
      if (selectedProfile === "physical") {
        Object.entries(physicalProfileData).forEach(([key, value]) => {
          if (key !== 'profile_picture' && value) {
            formDataToSend.append(key, value);
          }
        });

        if (physicalProfileData.profile_picture) {
          formDataToSend.append('profile_picture', physicalProfileData.profile_picture);
        }
      }

      // Submit data
      const response = await Profileservice.addProfil(formDataToSend, role);
      Cookies.set('id', response.id);

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

      localStorage.setItem('registrationProgress', JSON.stringify(newProgress));
      toast.success('Profile created successfully!');

    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="rounded-lg shadow-sm"
        progressClassName="bg-teal-600"
      />
      
      {/* Progress Bar - More subtle */}
     

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Complete your profile</h1>
      <p className="text-gray-500 mb-8">Let's get to know you better</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture - More elegant */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-28 h-28 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 hover:border-teal-400 transition-all cursor-pointer overflow-hidden shadow-inner"
            >
              {physicalProfileData.profile_picture ? (
                <>
                  <img
                    src={URL.createObjectURL(physicalProfileData.profile_picture)}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaCamera className="w-6 h-6 mb-2" />
                  <span className="text-xs">Add photo</span>
                </div>
              )}
            </div>
            {physicalProfileData.profile_picture && (
              <button
                type="button"
                onClick={removeProfilePicture}
                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-500" />
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
          <p className="text-xs text-gray-400 mt-2">JPEG or PNG, max 2MB</p>
        </div>

        {/* Profile Type - Card style */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Profile type</h2>
          <div className="grid grid-cols-2 gap-4">
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
              className={`p-4 border rounded-lg transition-all ${selectedProfile === "physical"
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-gray-200 hover:border-teal-300 bg-white"
                }`}
            >
              <div className="flex flex-col items-start">
                <h3 className="text-base font-semibold text-gray-800">Personal</h3>
                <p className="text-xs text-gray-500 mt-1 text-left">For individual users</p>
              </div>
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
              className={`p-4 border rounded-lg transition-all ${selectedProfile === "moral"
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-gray-200 hover:border-teal-300 bg-white"
                }`}
            >
              <div className="flex flex-col items-start">
                <h3 className="text-base font-semibold text-gray-800">Business</h3>
                <p className="text-xs text-gray-500 mt-1 text-left">For companies/organizations</p>
              </div>
            </button>
          </div>
        </div>

        {/* Personal Information - Cleaner layout */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wider">Personal information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {selectedProfile === "physical" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={physicalProfileData.date_of_birth}
                    onChange={handlePhysicalProfileChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={physicalProfileData.gender}
                    onChange={handlePhysicalProfileChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wider">Contact information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
                <PhoneInput
                  country={formData.countryCode}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  dropdownClass="border border-gray-200 rounded-lg shadow-sm"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wider">Address information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  name="country"
                  value={formData.address.country}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  required
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <select
                    name="state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    disabled={!formData.address.country}
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state.name} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.address.postal_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button - More prominent */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:bg-teal-400 flex justify-center items-center shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving your profile...
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