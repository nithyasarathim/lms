import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const userdata = JSON.parse(localStorage.getItem("lms-user"));
  const token = userdata?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getActiveAcademicYear = async () => {
  try {
    const response = await apiClient.get(`/api/academic-years?isActive=true`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getCurrentYearAndSections = async () => {
  try {
    const response = await apiClient.get(`/api/sections/current-year`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getSectionStudentData = async (sectionId) => {
  try {
    const response = await apiClient.get(
      `/api/students?sectionId=${sectionId}`,
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const updateStudentSections = async (studentIds, targetSectionId) => {
  try {
    const response = await apiClient.patch(`/api/sections/reallocate`, {
      studentIds,
      targetSectionId,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
