import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // Remplace par l'URL de ton API

const Profileservice = {
  // Ajouter un profil physique
  addProfil: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/profil/`, formData);
      return response.data;
    } catch (error) {
      console.error("Error adding profile:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Adding profile failed");
    }
  },
};

export default Profileservice;
