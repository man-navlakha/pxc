// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/login', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
