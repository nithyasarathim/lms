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

export const getDepartments = async () => {
  try {
    const response = await apiClient.get("api/departments");
    return response.data.data.departments;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubjects = async () => {
  try {
    const response = await apiClient.get("api/subjects");
    return response.data.data.subjects;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await apiClient.get(`api/departments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const bulkUploadSubjects = async (deptId, formData) => {
  try {
    const response = await apiClient.post(
      `api/subjects/upload/${deptId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addSubject = async (subjectData) => {
  try {
    const response = await apiClient.post("api/subjects", subjectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createDepartment = async (deptData) => {
  try {
    const response = await apiClient.post("api/departments", deptData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const editDepartment = async (id, deptData) => {
  try {
    const response = await apiClient.put(`api/departments/${id}`, deptData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createRegulation = async (regulationData) => {
  try {
    const response = await apiClient.post("api/regulations", regulationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchRegulation = async () => {
  try {
    const response = await apiClient.get("api/regulations");
    return response.data.data.regulations;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCurriculum = async (deptId, regId) => {
  try {
    const response = await apiClient.get("api/curriculums", {
      params: { departmentId: deptId, regulationId: regId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCurriculum = async (curriculumData) => {
  try {
    const response = await apiClient.post("api/curriculums", curriculumData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCurriculum = async (id, curriculumData) => {
  try {
    const response = await apiClient.put(
      `api/curriculums/${id}`,
      curriculumData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSubject = async (id, subjectData) => {
  try {
    const response = await apiClient.put(`api/subjects/${id}`, subjectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteSubject = async (id) => {
  try {
    const response = await apiClient.delete(`api/subjects/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchBatch = async () => {
  try {
    const response = await apiClient.get(`/api/batches`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await apiClient.post("api/batches", batchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBatchProgram = async (batchId, deptId) => {
  try {
    const response = await apiClient.get(
      `api/batch-programs/${batchId}/${deptId}`,
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error.response?.data || error.data || error;
  }
};
export const createBatchProgram = async (data) => {
  try {
    const response = await apiClient.post("api/batch-programs", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSections = async (batchProgramId) => {
  try {
    const response = await apiClient.get(`api/sections`, {
      params: { batchProgramId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createSection = async (payload) => {
  try {
    const response = await apiClient.post(`api/sections`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const getFacultyDashboardStats = async () => {
  try {
    const response = await apiClient.get(`/api/faculty/dashboard/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const getDeptWiseStats = async (deptId) => {
  try {
    const response = await apiClient.get(
      `api/faculty/department-wise/${deptId}`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
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

export const addFaculty = async (facultyData) => {
  try {
    const response = await apiClient.post(`/api/faculty`, facultyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const updateFaculty = async (id, facultyData) => {
  try {
    const response = await apiClient.put(`/api/faculty/${id}`, facultyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const updateSection = async (sectionId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/api/sections/${sectionId}`,
      updatedData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const facultyBulkUpload = async (formData) => {
  try {
    const response = await apiClient.post(`/api/faculty/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.data;
  }
};

export const deleteFaculty = async (facultyId) => {
  try {
    const response = await apiClient.delete(`/api/faculty/${facultyId}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.data;
  }
};

export const getStudentStats = async () => {
  try {
    const response = await apiClient.get(`/api/students/stats/year-wise`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.data;
  }
};

export const updateStudent = async () => {

}

export const getStudentDeptStats = async () => {

}

export const createStudent = async () => {

}

export const getAllStudents = async () => {
  
}
