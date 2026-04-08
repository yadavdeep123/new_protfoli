import axios from "axios";

const PRODUCTION_API_FALLBACK = "https://server-nu-lime-87.vercel.app";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || PRODUCTION_API_FALLBACK
});

export const fetchPortfolio = async () => {
  const response = await api.get("/api/portfolio");
  return response.data;
};
