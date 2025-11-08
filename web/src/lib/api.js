import axios from "axios";

const { VITE_BASE_URL: baseURL } = import.meta.env;

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
