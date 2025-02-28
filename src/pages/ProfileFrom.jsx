import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import countryData from "world-countries";
import Profileservice from "../services/profileService";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; // Import the necessary styles

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    zipCode: "",
    phone: "",
    profile_picture: null,
    kyc_status: false,
    role: "",
    user: "",
    countryCode: 'us', // Set the default country code
  });

  const [states, setStates] = useState([]);
  const countries = countryData.map((country) => country.name.common).sort();

  useEffect(() => {
    if (formData.address) {
      const selectedCountry = countryData.find((c) => c.name.common === formData.address);
      if (selectedCountry?.subdivisions) {
        const stateNames = selectedCountry.subdivisions.map((sub) => sub.name);
        setStates(stateNames);

        setFormData((prev) => ({
          ...prev,
          state: stateNames.length > 0 ? stateNames[0] : "",
        }));
      } else {
        setStates([]);
        setFormData((prev) => ({ ...prev, state: "" }));
      }
    } else {
      setStates([]);
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
   
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profile_picture: e.target.files[0], // Stocker le fichier
      }));
    }
  };

  const handlePhoneChange = (value, data) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleCountryChange = (country) => {
    setFormData((prev) => ({
      ...prev,
      address: country,
      countryCode: countryData.find((c) => c.name.common === country)?.cca2.toLowerCase(), // Automatically set country code
      phone: '', // Reset phone number to empty when country changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await Profileservice.addProfil(formDataToSend);
      console.log("Profile added successfully:", response);
      alert("Profile added successfully!");

      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        address: "",
        zipCode: "",
        phone: "",
        profile_picture: null,
        kyc_status: false,
        role: "",
        user: "",
        countryCode: 'us', // Reset country code after submission
      });
      setStates([]);
    } catch (error) {
      console.error("Error adding profile:", error);
      alert("Failed to add profile. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-4">Create Profile</h1>

      {/* Photo Upload */}
      <div className="flex justify-center my-4">
        <label className="cursor-pointer flex flex-col items-center border-2 border-black rounded-full w-28 h-28 justify-center">
          {formData.profile_picture ? (
            <img
              src={URL.createObjectURL(formData.profile_picture)}
              alt="Uploaded"
              className="w-28 h-28 rounded-full object-cover"
            />
          ) : (
            <FaCamera className="w-12 h-12 text-gray-500" />
          )}
          <input type="file" className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      {/* Personal Details */}
      <label className="block text-gray-700 font-semibold">Personal Details:</label>
      <div className="flex gap-4 mt-2">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.first_name}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.last_name}
        />
      </div>
      <input
        type="date"
        name="date_of_birth"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.date_of_birth}
      />
      <select
        name="gender"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.gender}
      >
        <option value="">Gender</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      {/* Address Details */}
      <label className="block text-gray-700 font-semibold mt-4">Address Details:</label>
      <select
        name="address"
        className="w-full border p-2 rounded mt-2 text-gray-700"
        onChange={(e) => handleCountryChange(e.target.value)}
        value={formData.address}
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <select
        name="state"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        disabled={!formData.address}
        value={formData.state}
      >
        <option value="">Select State</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <input
        type="text"
        name="zipCode"
        placeholder="Zip Code"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.zipCode}
      />

      {/* Phone Number Input with Country Code Update */}
      <label className="block text-gray-700 font-semibold mt-4">Phone Number:</label>
      <PhoneInput
        country={formData.countryCode} // Dynamically set country code based on selected country
        value={formData.phone}
        onChange={handlePhoneChange}
        inputClass="w-full border p-2 rounded mt-4 text-gray-700"
        dropdownClass="w-full"
      />

      {/* Additional Fields */}
      <div className="flex gap-4 mt-4">
        <input
          type="text"
          name="role"
          placeholder="Role"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.role}
        />
        <input
          type="text"
          name="user"
          placeholder="User ID"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.user}
        />
      </div>
      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          name="kyc_status"
          checked={formData.kyc_status}
          onChange={() => setFormData((prev) => ({ ...prev, kyc_status: !prev.kyc_status }))}
        />
        KYC Verified
      </label>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button className="bg-teal-500 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
