import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5001";
  }

  return "";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000
});

export const fetchPortfolio = async () => {
  const response = await api.get("/api/portfolio");
  return response.data;
};
