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
    <div className="flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold mb-6">Create an account</h2>

      <div className="w-full max-w-md space-y-4">
        <label className="block">Business details:</label>
        <div className="flex space-x-2">
          <input type="text" placeholder="Company name" className="border p-2 flex-1" />
          <input type="text" placeholder="Website" className="border p-2 flex-1" />
        </div>

        <select className="border p-2 w-full" value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}>
          <option value="" disabled>Choose Niche</option>
          {niches.map((niche, index) => (
            <option key={index} value={niche}>{niche}</option>
          ))}
        </select>

        <label className="block">Address details:</label>
        <Select
          options={countryOptions}
          value={selectedCountry}
          onChange={setSelectedCountry}
          className="border p-2 w-full"
          placeholder="Choose Country"
        />

        <div className="flex space-x-2">
          <input type="text" placeholder="State" className="border p-2 flex-1" />
          <input type="text" placeholder="City" className="border p-2 flex-1" />
        </div>
        <div className="flex space-x-2">
          <input type="text" placeholder="City" className="border p-2 flex-1" />
          <input type="text" placeholder="Phone Number" className="border p-2 flex-1" />
        </div>
      </div>

      <button className="mt-6 bg-teal-500 text-white px-6 py-2 rounded flex items-center">
        Next <span className="ml-2">&gt;&gt;</span>
      </button>
    </div>
  );
};

export default BusinessDetails;
