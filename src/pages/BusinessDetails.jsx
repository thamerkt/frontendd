import { useState } from "react";
import { CameraIcon } from "lucide-react";
import { TextInput, FormContainer, SelectInput, CameraButton,NextButton } from "../Customcss/custom";

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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  const inputFields = [
    { name: "companyName", placeholder: "Company Name", type: "text", required: true },
    { name: "registerNumber", placeholder: "Register Number", type: "text", required: true },
    { name: "registrationNumber", placeholder: "Registration Number", type: "text" },
    { name: "taxId", placeholder: "Tax ID", type: "text" },
    { name: "tradeRegister", placeholder: "Trade Register", type: "text" },
    { name: "numberOfEmployees", placeholder: "Number of Employees", type: "text" },
    { name: "contactPerson", placeholder: "Contact Person", type: "text" },
    { name: "businessPhone", placeholder: "Business Phone", type: "text" },
    { name: "businessEmail", placeholder: "Business Email", type: "email", required: true },
  ];

  return (
    <FormContainer>
      <div className="flex justify-center my-10">
        <CameraButton />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {inputFields.slice(0, 2).map(({ name, placeholder, type, required }) => (
          <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} required={required} />
        ))}

        <SelectInput
          name="niche"
          value={formData.niche}
          onChange={handleChange}
          options={[
            { value: "Tech", label: "Tech" },
            { value: "Finance", label: "Finance" },
            { value: "Health", label: "Health" },
          ]}
          placeholder="Select Niche"
        />

        <h2>Business Details</h2>
        {inputFields.slice(2, 3).map(({ name, placeholder, type }) => (
          <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} />
        ))}

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          {inputFields.slice(3, 5).map(({ name, placeholder, type }) => (
            <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          <SelectInput
            name="legalForm"
            value={formData.legalForm}
            onChange={handleChange}
            options={[
              { value: "LLC", label: "LLC" },
              { value: "Corp", label: "Corp" },
              { value: "Sole Proprietor", label: "Sole Proprietor" },
            ]}
            placeholder="Select Legal Form"
            required
          />
          {inputFields.slice(5, 6).map(({ name, placeholder, type }) => (
            <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} />
          ))}
        </div>

        <h2>Contact Information</h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          {inputFields.slice(6, 8).map(({ name, placeholder, type }) => (
            <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} />
          ))}
        </div>

        {inputFields.slice(8, 9).map(({ name, placeholder, type, required }) => (
          <TextInput key={name} type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange} required={required} />
        ))}

      </form>
      <NextButton/>
    </FormContainer>
    

  );
};

export default BusinessDetail;
