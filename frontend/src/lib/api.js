import axios from "axios";

const rawBaseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "";

// hindari double slash di akhir dan kosongkan jika empty
const baseURL = rawBaseURL ? rawBaseURL.replace(/\/$/, "") : "";

const api = axios.create({
  baseURL,
  withCredentials: true, // opsional, aman buat CORS
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
