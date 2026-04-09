import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "http://localhost:5001";
  }

  return "";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000
});

export const sendMessage = async (payload) => {
  const response = await api.post("/api/messages", payload);
  return response.data;
};
