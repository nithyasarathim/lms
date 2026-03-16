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

export const getDeptAcademicStructure = async () => {
  try {
    const response = await apiClient.get(
      `/api/assign-faculty/academic-structure`,
    );
    return response;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getSectionsByBatchProgramId = async (batchProgramId) => {
  try {
    const response = await apiClient.get(
      `/api/sections?batchProgramId=${batchProgramId}`,
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const assignFacultyToSection = async (assignedData) => {
  try {
    const response = await apiClient.post(`/api/assign-faculty`, assignedData);
    return response;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getAssignedFaculties = async (sectionId, semesterNumber) => {
  try {
    const response = await apiClient.get(
      `/api/assign-faculty?sectionId=${sectionId}&semesterNumber=${semesterNumber}`,
    );
    return response.data;
  } catch (error) {
    // If 404 is returned when no assignments exist, handle it gracefully
    if (error.response && error.response.status === 404) {
      return { success: true, data: { assignments: [] } };
    }
    throw error;
  }
};

export const getSubjectsBySemester = async (batchProgramId, semesterNumber) => {
  try {
    const response = await apiClient.get(
      `/api/subjects/by-semester?batchProgramId=${batchProgramId}&semesterNumber=${semesterNumber}`,
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getAllFaculties = async () => {
  try {
    const response = await apiClient.get(`api/faculty`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};
