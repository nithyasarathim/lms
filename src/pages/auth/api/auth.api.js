import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authApi = axios.create({
  baseURL: `${API_URL}api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const storedUser = JSON.parse(localStorage.getItem("lms-user"));
  if (storedUser?.token) {
    config.headers.Authorization = `Bearer ${storedUser.token}`;
  }
  return config;
});

export const login = async (credentials) => {
  try {
    const response = await authApi.post("/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const getClassroomById = async (classroomId) => {
  try {
    const response = await apiClient.get(`/api/classroom/${classroomId}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const respondToInvitation = async (classroomId, token, action) => {
  try {
    const response = await apiClient.patch(
      `/api/classroom/${classroomId}/members/respond`,
      { token, action },
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
