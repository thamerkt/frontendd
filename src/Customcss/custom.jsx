const TextInput = ({ type, name, value, onChange, placeholder }) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full  p-3 border text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mt-3"
    />
  );
};

const FormContainer = ({ children }) => {
  return (
    <div className="min-h-screen flex justify-center items-center p-8">
      <div className="bg-white rounded-lg w-full max-w-4xl flex flex-col sm:flex-row justify-center items-center">
        {/* Sidebar */}
        {/* You can add the sidebar here */}

        {/* Form Section */}
        <div className="w-full sm:w-2/3 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Create an account
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};
const SelectInput = ({ name, value, onChange, options, placeholder }) => {
  return (
    <div className="relative w-full mt-3">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border text-gray-500 text-base rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>{option.label}</option>
        ))}
      </select>
      <span className="absolute right-3 top-3 text-gray-500 pointer-events-none">▾</span>
    </div>
  );
};
import { CameraIcon } from "lucide-react";
import { useState } from "react";


const CameraButton = () => {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <label className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 cursor-pointer overflow-hidden">
      {image ? (
        <img src={image} alt="Preview" className="w-full h-full object-cover rounded-full" />
      ) : (
        <CameraIcon className="w-6 h-6 text-black" />
      )}
      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
    </label>
  );
};
const NextButton = ()=>{
  return(
    <div className="mt-6 flex justify-end items-end">
            <button className="bg-teal-500 text-white px-6 py-2 rounded-lg flex items-end">
              <span className="mr-2">Next</span>
              <span>➤</span>
            </button>
          </div>

  )

}




export { TextInput, FormContainer,SelectInput,CameraButton,NextButton };
