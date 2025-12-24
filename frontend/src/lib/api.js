import axios from "axios";

const rawBaseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// hindari double slash di akhir
const baseURL = rawBaseURL.replace(/\/$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true, // opsional, aman buat CORS
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
