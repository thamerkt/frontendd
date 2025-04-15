import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Cookies from 'js-cookie';

const saveProgress = async (userId, data) => {
  if (!userId) {
    console.warn("❌ No userId provided to saveProgress.");
    return;
  }

  if (!data || typeof data !== 'object') {
    console.warn("❌ Invalid data provided to saveProgress:", data);
    throw new Error("Data must be a valid object");
  }

  // Save to cookies
  Cookies.set('register_progress', JSON.stringify(data), { expires: 7 });

  
};

export default saveProgress; // Remove the parentheses - export the function itself