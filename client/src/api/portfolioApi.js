import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001"
});

export const fetchPortfolio = async () => {
  const response = await api.get("/api/portfolio");
  return response.data;
};
