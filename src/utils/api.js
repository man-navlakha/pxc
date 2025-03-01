import axios from "axios";

const API_BASE_URL = "https://pixel-classes.onrender.com/api/user/DeleteNONVerifiedUsers"; // Replace with your actual backend URL

export const deleteNonVerifiedUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/delete-non-verified-users`);
    console.log(response.data.message);
  } catch (error) {
    console.error("Error deleting non-verified users:", error);
  }
};
