import { useState } from "react";
import { CameraIcon } from "lucide-react";

const BusinessDetail = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    registerNumber: "",
    niche: "",
    registrationNumber: "",
    taxId: "",
    tradeRegister: "",
    legalForm: "",
    numberOfEmployees: "",
    contactPerson: "",
    businessPhone: "",
    businessEmail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="max-w-90 mx-auto p-8 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-4">Create an account</h2>
      <div className="flex flex-col items-center mb-4">
        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full">
          <CameraIcon size={24} />
        </div>
        <p className="text-gray-500 text-sm">Put Here Your Logo</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
      <form className="w-full max-w-xs">
          <input 
            className="w-full border p-3 mb-4" 
            type="companyName" 
            placeholder="companyName" 
            value={registerNumber}
            
            required
          />

          <div className="relative w-full mb-4">
            <input
              className="w-full border p-3 pr-10"
              type={taxId ? "text" : "password"}
              placeholder="Password"
              value={taxId}
              
              required
            />
            
          </div>
          <p>{Error}</p>

          <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded mb-4 flex items-center justify-center">
            Log in to your Account
            <img src="/assets/arrow.png" alt="Arrow Icon" className="w-6 h-6 ml-2" />
          </button>
        </form>
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="registerNumber"
          placeholder="Register Number"
          value={formData.registerNumber}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="niche"
          value={formData.niche}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Niche</option>
          <option value="Tech">Tech</option>
          <option value="Finance">Finance</option>
          <option value="Health">Health</option>
        </select>
      </div>
      <h3 className="mt-4 text-lg font-semibold">Business details:</h3>
      <input
        type="text"
        name="registrationNumber"
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-4"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="taxId"
          placeholder="Tax ID"
          value={formData.taxId}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="tradeRegister"
          placeholder="Trade Register"
          value={formData.tradeRegister}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="legalForm"
          value={formData.legalForm}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Legal Form</option>
          <option value="LLC">LLC</option>
          <option value="Corp">Corp</option>
          <option value="Sole Proprietor">Sole Proprietor</option>
        </select>
        <input
          type="text"
          name="numberOfEmployees"
          placeholder="Number of Employees"
          value={formData.numberOfEmployees}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Contact details:</h3>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person"
          value={formData.contactPerson}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="businessPhone"
          placeholder="Business Phone"
          value={formData.businessPhone}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>
      <input
        type="email"
        name="businessEmail"
        placeholder="Business Email"
        value={formData.businessEmail}
        onChange={handleChange}
        className="border p-2 rounded w-full mt-2"
      />
      <button className="w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Continue
      </button>
    </div>
  );
};

export default BusinessDetail;
