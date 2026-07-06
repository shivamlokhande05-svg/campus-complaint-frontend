import axios from "axios";

// Production backend on Render. Change this if you redeploy the backend elsewhere,
// or swap it for "http://localhost:5000/api" temporarily for local-only testing.
const API_BASE_URL = "https://campus-complaint-backend-063e.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the saved token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
