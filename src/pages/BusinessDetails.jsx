import { useState } from "react";
import { CameraIcon } from "lucide-react";
import { FormContainer, SelectInput, CameraButton, NextButton, TextInput } from "../Customcss/custom";
import Profilmoralservice from "../services/Profilemoral";

const legalFormOptions = [
  { value: "LLC", label: "LLC" },
  { value: "Corporation", label: "Corporation" },
  { value: "Sole Proprietorship", label: "Sole Proprietorship" },
  { value: "Partnership", label: "Partnership" },
];

const sectorOptions = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Healthcare" },
  { value: "construction", label: "Construction" },
];

const BusinessDetail = () => {
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
    profil: "",
  });
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setFormData((prevData) => ({ ...prevData, logo: file }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await Profilmoralservice.addProfilemoral(formDataToSend);
      console.log("Profile successfully submitted:", response);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormContainer>
      <div className="flex justify-center my-10">
        <label className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 cursor-pointer overflow-hidden">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-full" />
          ) : (
            <CameraIcon className="w-6 h-6 text-black" />
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name & Registration Number */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          <TextInput
            type="text"
            name="raison_social"
            placeholder="Company Name"
            value={formData.raison_social}
            onChange={handleChange}
          />
          <TextInput
            type="text"
            name="numero_immatriculation"
            placeholder="Registration Number"
            value={formData.numero_immatriculation}
            onChange={handleChange}
          />
        </div>

        {/* Select Business Sector */}
        <SelectInput
          name="secteur_activite"
          value={formData.secteur_activite}
          onChange={handleChange}
          options={sectorOptions}
          placeholder="Select Niche"
        />

        <h2>Business details :</h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          <TextInput
            type="text"
            name="registre_commerce"
            placeholder="Trade Register"
            value={formData.registre_commerce}
            onChange={handleChange}
          />

          {/* Fixed: Legal Form should be a SelectInput */}
          <SelectInput
            name="forme_juridique"
            value={formData.forme_juridique}
            onChange={handleChange}
            options={legalFormOptions}
            placeholder="Select Legal Form"
          />
        </div>

        <TextInput
          type="text"
          name="matricule_fiscale"
          placeholder="Fiscal Number"
          value={formData.matricule_fiscale}
          onChange={handleChange}
        />

        <h2>Contact details :</h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          <TextInput
            type="text"
            name="contact_responsable"
            placeholder="Contact Person"
            value={formData.contact_responsable}
            onChange={handleChange}
          />
          <TextInput
            type="text"
            name="business_phone"
            placeholder="Business Phone"
            value={formData.business_phone}
            onChange={handleChange}
          />
        </div>

        <TextInput
          type="email"
          name="business_email"
          placeholder="Business Email"
          value={formData.business_email}
          onChange={handleChange}
        />

        <NextButton />
      </form>
    </FormContainer>
  );
};

export default BusinessDetail;
