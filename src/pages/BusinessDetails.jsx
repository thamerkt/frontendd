import React, { useState } from "react";
import Select from "react-select";
import { countries } from "countries-list";

const countryOptions = Object.keys(countries).map((code) => ({
  value: code,
  label: countries[code].name,
}));

const niches = ["Wedding", "Camping", "Vehicles"];

const BusinessDetails = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState("");

  return (
    <div className="flex flex-col items-center space-y-6 p-10 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold">Create an account</h2>

      <div className="w-full space-y-5">
        <h3 className="text-lg font-semibold">Business details</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Company name" className="border p-2 w-full" />
          <input type="text" placeholder="Website" className="border p-2 w-full" />
        </div>

        <select 
          className="border p-2 w-full" 
          value={selectedNiche} 
          onChange={(e) => setSelectedNiche(e.target.value)}
        >
          <option value="" disabled>Choose Niche</option>
          {niches.map((niche, index) => (
            <option key={index} value={niche}>{niche}</option>
          ))}
        </select>

        <h3 className="text-lg font-semibold">Address details</h3>
        <Select
          options={countryOptions}
          value={selectedCountry}
          onChange={setSelectedCountry}
          className="w-full"
          placeholder="Choose Country"
        />

        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="State" className="border p-2 w-full" />
          <input type="text" placeholder="City" className="border p-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Street Address" className="border p-2 w-full" />
          <input type="text" placeholder="Phone Number" className="border p-2 w-full" />
        </div>
      </div>

      <button className="mt-6 bg-teal-500 text-white px-6 py-2 rounded flex items-center">
        Next <span className="ml-2">&gt;&gt;</span>
      </button>
    </div>
  );
};

export default BusinessDetails;
