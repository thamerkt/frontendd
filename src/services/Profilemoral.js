import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://kong-7e283b39dauspilq0.kongcloud.dev/profile"; // Remplace par l'URL correcte de ton API

const Profilmoralservice = {
  addProfilemoral: async (formData) => {
    try {
      const token = Cookies.get("token"); // Récupération dynamique du token
      if (!token) {
        throw new Error("Token introuvable, veuillez vous reconnecter.");
      }

      const response = await axios.post(`${API_URL}/profilmoral/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de l'ajout du profil d'entreprise";
      console.error("❌ Erreur lors de l'ajout du profil:", errorMessage);
      throw new Error(errorMessage);
    }
  },
};

export default Profilmoralservice;
