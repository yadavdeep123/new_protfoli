import axios from "axios";

const PRODUCTION_API_FALLBACK = "https://server-nu-lime-87.vercel.app";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || PRODUCTION_API_FALLBACK
});

export const sendMessage = async (payload) => {
  const response = await api.post("/api/messages", payload);
  return response.data;
};
