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

      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">Complete Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer overflow-hidden"
            >
              {physicalProfileData.profile_picture ? (
                <img
                  src={URL.createObjectURL(physicalProfileData.profile_picture)}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaCamera className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm">Upload Photo</span>
                </div>
              )}
            </div>
            {physicalProfileData.profile_picture && (
              <button
                type="button"
                onClick={removeProfilePicture}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FiX className="w-3 h-3 md:w-4 md:h-4" />
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
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Max 2MB (JPEG, PNG)</p>
        </div>

        {/* Profile Type Selection */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Profile Type</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
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
              className={`p-3 md:p-4 border-2 rounded-lg transition-all ${selectedProfile === "physical"
                ? "border-teal-600 bg-blue-50"
                : "border-gray-300 hover:border-teal-400"
                }`}
            >
              <h3 className="text-base md:text-lg font-semibold">Personal</h3>
              <p className="text-xs md:text-sm text-gray-600">For individual users</p>
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
              className={`p-3 md:p-4 border-2 rounded-lg transition-all ${selectedProfile === "moral" ? "border-teal-600 bg-teal-50" : "border-gray-300 hover:border-teal-400"}`}
            >
              <h3 className="text-base md:text-lg font-semibold">Business</h3>
              <p className="text-xs md:text-sm text-gray-600">For companies/organizations</p>
            </button>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <TextInput
              label="First Name *"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder={'First Name'}
              required
            />
            <TextInput
              label="Last Name *"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder={'Last Name'}
              required
            />
          </div>

          {selectedProfile === "physical" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <TextInput
                type="date"
                label="Date of Birth"
                name="date_of_birth"
                value={physicalProfileData.date_of_birth}
                onChange={handlePhysicalProfileChange}
              />
              <SelectInput
                label="Gender *"
                name="gender"
                options={GENDER_OPTIONS}
                value={physicalProfileData.gender}
                onChange={handlePhysicalProfileChange}
                placeholder={'Select Your Gender'}
                required
              />
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Contact Information</h2>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Phone Number *</label>
            <PhoneInput
              country={formData.countryCode}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputClass="w-full p-2 md:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              dropdownClass="border border-gray-300 rounded-md shadow-lg"
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* Address Information Section */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-700">Address Information</h2>
          <SelectInput
            label="Country *"
            name="country"
            value={formData.address.country}
            onChange={handleCountryChange}
            options={COUNTRIES.map(country => ({ value: country, label: country }))}
            placeholder="Select country"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <SelectInput
              label="State/Province"
              name="state"
              value={formData.address.state}
              onChange={handleChange}
              options={states.map(state => ({ value: state.name, label: state.name }))}
              placeholder="Select state"
              disabled={!formData.address.country}
            />
            <TextInput
              label="City"
              name="city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder={'City'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Street Address"
              name="street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder={'Street'}
            />
            <TextInput
              label="Postal Code"
              name="postal_code"
              value={formData.address.postal_code}
              onChange={handleChange}
              placeholder={'Postal Code'}
            />
          </div>
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
              "Complete Profile"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;