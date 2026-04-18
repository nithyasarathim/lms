import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const storedUser = JSON.parse(localStorage.getItem('lms-user'));
  if (storedUser?.token) {
    config.headers.Authorization = `Bearer ${storedUser.token}`;
  }
  return config;
});

export const getMyAttendanceOverview = async (params = {}) => {
  try {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const response = await apiClient.get(
      `/api/students/attendance${query.toString() ? `?${query.toString()}` : ''}`
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStudentDashboard = async () => {
  try {
    const response = await apiClient.get('/api/students/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
