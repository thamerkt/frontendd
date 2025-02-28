import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import countryData from "world-countries";
import { addProfile } from "../services/profileService"; // Import the service

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    country: "",
    state: "",
    street: "",
    zipCode: "",
    phoneNumber: "",
    photo: null,
  });

  const [states, setStates] = useState([]);
  const countries = countryData.map((country) => country.name.common).sort();

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countryData.find(
        (c) => c.name.common === formData.country
      );
      if (selectedCountry?.subdivisions) {
        const stateNames = selectedCountry.subdivisions.map((sub) => sub.name);
        setStates(stateNames);

        // Automatically select the first state
        if (stateNames.length > 0) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            state: stateNames[0], // Set the first state as default
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            state: "", // No states available
          }));
        }
      } else {
        setStates([]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          state: "", // No subdivisions available
        }));
      }
    } else {
      setStates([]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        state: "", // No country selected
      }));
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files.length > 0) {
      setFormData({ ...formData, photo: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the addProfile service
      const response = await addProfile(formData);
      console.log("Profile added successfully:", response);

      // Reset the form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        birthday: "",
        gender: "",
        country: "",
        state: "",
        street: "",
        zipCode: "",
        phoneNumber: "",
        photo: null,
      });
      setStates([]);

      alert("Profile added successfully!");
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
          {formData.photo ? (
            <img src={formData.photo} alt="Uploaded" className="w-28 h-28 rounded-full object-cover" />
          ) : (
            <FaCamera className="w-12 h-12 text-gray-500" />
          )}
          <input type="file" className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      {/* Personal Details */}
      <label className="block text-gray-700 font-semibold">Personnal Details:</label>
      <div className="flex gap-4 mt-2">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.firstName}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.lastName}
        />
      </div>
      <input
        type="text"
        name="birthday"
        placeholder="Birthday (DD/MM/YYYY)"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.birthday}
      />
      <select
        name="gender"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.gender}
      >
        <option value="">Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      {/* Address Details */}
      <label className="block text-gray-700 font-semibold mt-4">Address Details:</label>
      <select
        name="country"
        className="w-full border p-2 rounded mt-2 text-gray-700"
        onChange={handleChange}
        value={formData.country}
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
        disabled={!formData.country}
        value={formData.state}
      >
        <option value="">Select State</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <input
        type="text"
        name="street"
        placeholder="Street"
        className="w-full border p-2 rounded mt-4 text-gray-700"
        onChange={handleChange}
        value={formData.street}
      />
      <div className="flex gap-4 mt-4">
        <input
          type="text"
          name="zipCode"
          placeholder="Zip Code"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.zipCode}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          className="w-1/2 border p-2 rounded text-gray-700"
          onChange={handleChange}
          value={formData.phoneNumber}
        />
      </div>

      {/* Custom Button */}
      <div className="flex justify-end mt-6">
        <button
          className="bg-teal-500 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md"
          onClick={handleSubmit}
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;