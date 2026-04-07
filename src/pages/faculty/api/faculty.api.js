import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const userdata = JSON.parse(localStorage.getItem('lms-user'));
  const token = userdata?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getClassrooms = async (facultyUserId) => {
  try {
    const response = await apiClient.get(
      `/api/classroom?userId=${facultyUserId}`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
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

export const createPost = async (classroomId, formData) => {
  try {
    const response = await apiClient.post(
      `/api/classroom/${classroomId}/posts`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getStream = async (classroomId) => {
  try {
    const response = await apiClient.get(
      `/api/classroom/${classroomId}/posts/stream`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getClasswork = async (classroomId) => {
  try {
    const response = await apiClient.get(
      `/api/classroom/${classroomId}/posts/`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getTopics = async (classroomId) => {
  try {
    const response = await apiClient.get(
      `/api/classroom/${classroomId}/posts/topic`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const addComment = async (classroomId, postId, message) => {
  try {
    const response = await apiClient.post(
      `/api/classroom/${classroomId}/posts/${postId}/comments`,
      { message }
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const updatePost = async (classroomId, type, postId, formData) => {
  try {
    console.log('FormData Contents:', Object.fromEntries(formData.entries()));
    const res = await apiClient.patch(
      `/api/classroom/${classroomId}/posts/${type}/${postId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const deletePost = async (classroomId, type, postId) => {
  try {
    const res = await apiClient.delete(
      `/api/classroom/${classroomId}/posts/${type}/${postId}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const deleteComment = async (classroomId, commentId) => {
  try {
    const res = await apiClient.delete(
      `/api/classroom/${classroomId}/posts/comments/${commentId}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const addTopic = async (classroomId, formData) => {
  try {
    const res = await apiClient.post(
      `/api/classroom/${classroomId}/posts/topic`,
      formData
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const updateTopic = async (classroomId, topicId, formData) => {
  try {
    const res = await apiClient.patch(
      `/api/classroom/${classroomId}/posts/topic/${topicId}`,
      formData
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const deleteTopic = async (classroomId, topicId) => {
  try {
    const res = await apiClient.delete(
      `/api/classroom/${classroomId}/posts/topic/${topicId}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getEligiblePeople = async (classroomId, type) => {
  try {
    const response = await apiClient.get(
      `/api/classroom/${classroomId}/members/eligible/${type}`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getClassroomMembers = async (classroomId) => {
  try {
    const response = await apiClient.get(
      `/api/classroom/${classroomId}/members`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const inviteMembers = async (classroomId, data) => {
  try {
    const response = await apiClient.post(
      `/api/classroom/${classroomId}/members/invite`,
      data
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
