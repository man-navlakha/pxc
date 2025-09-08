import axios from "axios";

const api = axios.create({
  baseURL: "https://pixel-classes.onrender.com/api",
  withCredentials: true, // automatically send HttpOnly cookies
});

export default api;
