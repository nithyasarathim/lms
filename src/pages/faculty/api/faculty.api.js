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

export const getFacultyTimetable = async (facultyId) => {
  try {
    const response = await apiClient.get(
      `/api/timetable/faculty?facultyId=${facultyId}`
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

export const saveCoursePlan = async (data) => {
  try {
    const response = await apiClient.post(`/api/coursePlan`, data);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getCoursePlan = async (subjectId, sectionId, academicYearId) => {
  try {
    const response = await apiClient.get(
      `/api/coursePlan?subjectId=${subjectId}&sectionId=${sectionId}&academicYearId=${academicYearId}`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getCalendar = async () => {
  try {
    const response = await apiClient.get(`/api/calendar`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    const response = await apiClient.post(
      '/api/attendance/mark',
      attendanceData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const viewAttendance = async (
  classroomId,
  dateString,
  timetableEntryId
) => {
  try {
    const params = new URLSearchParams({ classroomId, dateString });
    if (timetableEntryId) params.set('timetableEntryId', timetableEntryId);
    const response = await apiClient.get(`/api/attendance/view?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const submitAttendanceRequest = async (requestData) => {
  try {
    const response = await apiClient.post(
      '/api/attendance/request-change',
      requestData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const getTimetableEntriesForAttendance = async (data) => {
  try {
    const params = new URLSearchParams();
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    });
    const response = await apiClient.get(
      `/api/timetable/attendance-entries?${params}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const getAcademicCalendarInfo = async (dateString) => {
  try {
    const response = await apiClient.get(
      `/api/academic-calendar/date/${dateString}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};
