import axios from "axios";

const API_BASE_URL = "https://pixel-classes.onrender.com/api/user/DeleteNONVerifiedUsers";

export const deleteNonVerifiedUsers = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
  } catch (error) {
    console.error("Error deleting non-verified users:", error);
  }
};