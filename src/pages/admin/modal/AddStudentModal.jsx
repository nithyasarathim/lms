import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  UploadCloud,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  createStudent,
  updateStudent,
  getDepartments,
  fetchBatch,
  getBatchProgram,
  getSections,
} from "../api/admin.api";
import toast from "react-hot-toast";

const AddStudentModal = ({ onClose, isEdit, editData, handleApicall }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("single");
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    registerNumber: "",
    rollNumber: "",
    departmentId: "",
    batchId: "",
    sectionId: "",
    semesterNumber: "",
    gender: "",
    dob: "",
    email: "",
    password: "sece@123",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [deptRes, batchRes] = await Promise.all([
          getDepartments(),
          fetchBatch(),
        ]);
        setDepartments(deptRes?.data?.departments || deptRes || []);
        setBatches(batchRes?.data?.batches || batchRes || []);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchLinkedData = async () => {
      if (formData.departmentId && formData.batchId) {
        setLoadingSections(true);
        try {
          const bpRes = await getBatchProgram(
            formData.batchId,
            formData.departmentId,
          );
          const bpId = bpRes?.data?.batchProgram?._id;

          if (bpId) {
            const secRes = await getSections(bpId);
            const sectionList = secRes?.data?.sections || secRes || [];
            setSections(sectionList);
          } else {
            setSections([]);
          }
        } catch (err) {
          setSections([]);
        } finally {
          setLoadingSections(false);
        }
      }
    };
    fetchLinkedData();
  }, [formData.departmentId, formData.batchId]);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        registerNumber: editData.studentId || "",
        rollNumber: editData.rollNumber || "",
        departmentId: editData.departmentId?._id || "",
        batchId: editData.batchId?._id || "",
        sectionId: editData.sectionId?._id || editData.sectionId || "",
        semesterNumber: editData.currentSemester || "",
        gender: editData.gender || "",
        dob: editData.dob ? editData.dob.split("T")[0] : "",
        email: editData.userId?.email || "",
        password: "sece@123",
      });
    }
  }, [isEdit, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRedirectToManagement = () => {
    const { batchId, departmentId } = formData;
    navigate(
      `/admin/dashboard?tab=batch-management&batchId=${batchId}&deptId=${departmentId}&highlight=reg`,
    );
    onClose();
  };

  const handleSubmit = async () => {
    const apiCall = isEdit
      ? updateStudent(editData._id, formData)
      : createStudent(formData);

    toast.promise(
      apiCall,
      {
        loading: isEdit
          ? "Updating student details..."
          : "Creating new student...",
        success: (res) => {
          onClose();
          if (handleApicall) handleApicall();
          return isEdit
            ? "Student updated successfully!"
            : "Student added successfully!";
        },
        error: (err) => {
          return (
            err.response?.data?.message ||
            err.message ||
            `Failed to ${isEdit ? "update" : "add"} student`
          );
        },
      },
      {
        style: {
          minWidth: "250px",
          borderRadius: "12px",
          background: "#08384F",
          color: "#fff",
          fontSize: "14px",
          fontFamily: "Poppins",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#fff",
            secondary: "#08384F",
          },
        },
      },
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>
      <section className="w-[400px] md:w-[600px] bg-white absolute right-0 top-0 h-screen z-[60] flex flex-col shadow-2xl font-['Poppins']">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#08384F]">
            {isEdit ? "Edit Student" : "Add Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {!isEdit && (
          <div className="px-6 mt-4">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full">
              <button
                className={`py-2 rounded-lg text-xs w-1/2 font-bold transition-all ${activeTab === "single" ? "bg-white text-[#08384F] shadow-sm" : "text-gray-500"}`}
                onClick={() => setActiveTab("single")}
              >
                Single Entry
              </button>
              <button
                className={`py-2 rounded-lg text-xs w-1/2 font-bold transition-all ${activeTab === "multiple" ? "bg-white text-[#08384F] shadow-sm" : "text-gray-500"}`}
                onClick={() => setActiveTab("multiple")}
              >
                Bulk Upload
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "single" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm focus:bg-white focus:border-[#08384F] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm focus:bg-white focus:border-[#08384F] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Register Number
                  </label>
                  <input
                    type="text"
                    name="registerNumber"
                    value={formData.registerNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Batch
                  </label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                    Section{" "}
                    {loadingSections && (
                      <Loader2 size={10} className="animate-spin" />
                    )}
                  </label>
                  {formData.departmentId &&
                  formData.batchId &&
                  !loadingSections &&
                  sections.length === 0 ? (
                    <button
                      type="button"
                      onClick={handleRedirectToManagement}
                      className="flex items-center gap-2 w-full px-17 py-2 bg-white border border-[#08384F] text-[#08384F] rounded-xl text-[10px] text-center font-bold uppercase hover:bg-sky-50 transition-all text-left"
                    >
                      <AlertCircle size={14} />
                      Setup Sections
                    </button>
                  ) : (
                    <select
                      name="sectionId"
                      value={formData.sectionId}
                      onChange={handleChange}
                      disabled={!sections.length}
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Section</option>
                      {sections.map((sec) => (
                        <option key={sec._id} value={sec._id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Semester
                  </label>
                  <input
                    type="number"
                    name="semesterNumber"
                    value={formData.semesterNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none focus:bg-white focus:border-[#08384F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-100 px-4 py-2 pr-10 rounded-xl text-sm outline-none focus:bg-white focus:border-[#08384F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#08384F] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-10 text-center hover:border-[#08384F] transition-all cursor-pointer group">
              <UploadCloud
                size={40}
                className="mx-auto text-gray-300 mb-4 group-hover:text-[#08384F] transition-colors"
              />
              <p className="text-sm font-bold text-[#08384F]">
                Upload Students List
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Accepts .xlsx or .csv files
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
          <button
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 hover:bg-[#0b4a68] transition-all disabled:opacity-50"
            onClick={handleSubmit}
            disabled={
              activeTab === "single" &&
              formData.departmentId &&
              formData.batchId &&
              sections.length === 0
            }
          >
            {isEdit
              ? "Update Changes"
              : activeTab === "multiple"
                ? "Upload File"
                : "Save Student"}
          </button>
        </div>
      </section>
    </>
  );
};

export default AddStudentModal;
