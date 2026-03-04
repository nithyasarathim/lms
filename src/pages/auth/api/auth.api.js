import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authApi = axios.create({
  baseURL: `${API_URL}api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (credentials) => {
  try {
    const response = await authApi.post("/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
