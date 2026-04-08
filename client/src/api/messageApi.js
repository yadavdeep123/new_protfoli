import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001"
});

export const sendMessage = async (payload) => {
  const response = await api.post("/api/messages", payload);
  return response.data;
};
