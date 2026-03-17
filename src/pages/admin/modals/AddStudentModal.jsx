import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  UploadCloud,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertOctagon,
} from "lucide-react";
import {
  createStudent,
  updateStudent,
  getDepartments,
  fetchBatch,
  getBatchProgram,
  getSections,
  getAcademicYear,
  bulkUploadStudents,
  getAllAcademicYears,
} from "../api/admin.api";
import { clearTableCache } from "../components/StudentTable";
import toast from "react-hot-toast";

const ValidationStatus = ({ loading, isValid, onSetup, hasSelection }) => {
  if (!hasSelection) return null;

  if (loading)
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        Validating configuration...
      </div>
    );

  if (isValid)
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-semibold">
        <CheckCircle2 size={16} />
        Configurations verified successfully
      </div>
    );

  return (
    <button
      type="button"
      onClick={onSetup}
      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[11px] font-semibold hover:bg-red-100 transition-all"
    >
      <AlertCircle size={16} />
      Setup Required — Click here to continue
    </button>
  );
};

const AddStudentModal = ({
  academicYearId,
  onClose,
  isEdit,
  editData,
  handleApicall,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("single");
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYear, setacademicYear] = useState(null);
  const [activeAcadYear, setActiveAcadYear] = useState(null);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
    dateOfBirth: "",
    email: "",
    password: "sece@123",
  });

  const [bulkValidate, setBulkValidate] = useState({
    deptId: "",
    batchId: "",
    isValid: false,
    loading: false,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [deptRes, batchRes, academicYearRes, allAcadRes] =
          await Promise.all([
            getDepartments(),
            fetchBatch(),
            getAcademicYear(academicYearId),
            getAllAcademicYears(),
          ]);
        setDepartments(deptRes?.data?.departments || deptRes || []);
        setBatches(batchRes?.data?.batches || batchRes || []);
        setacademicYear(academicYearRes?.data?.academicYear);

        const currentActive = allAcadRes?.data?.academicYears?.find(
          (y) => y.isActive,
        );
        setActiveAcadYear(currentActive);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    loadInitialData();
  }, [academicYearId]);

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
    const checkBulkBatchProgram = async () => {
      if (bulkValidate.deptId && bulkValidate.batchId) {
        setBulkValidate((prev) => ({ ...prev, loading: true }));
        try {
          const bpRes = await getBatchProgram(
            bulkValidate.batchId,
            bulkValidate.deptId,
          );
          setBulkValidate((prev) => ({
            ...prev,
            isValid: !!bpRes?.data?.batchProgram?._id,
          }));
        } catch (err) {
          setBulkValidate((prev) => ({ ...prev, isValid: false }));
        } finally {
          setBulkValidate((prev) => ({ ...prev, loading: false }));
        }
      }
    };
    checkBulkBatchProgram();
  }, [bulkValidate.deptId, bulkValidate.batchId]);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        registerNumber: editData.registerNumber || "",
        rollNumber: editData.rollNumber || "",
        departmentId: editData.department?._id || "",
        batchId: editData.batch?._id || "",
        sectionId: editData.section?._id || editData.sectionId || "",
        semesterNumber: editData.semesterNumber || "",
        gender: editData.user?.gender || "",
        dateOfBirth: editData.user?.dateOfBirth
          ? editData.user.dateOfBirth.split("T")[0]
          : "",
        email: editData.user?.email || "",
        password: "sece@123",
      });
    }
  }, [isEdit, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split(".").pop().toLowerCase();
      if (fileExt === "csv" || fileExt === "xlsx") {
        setSelectedFile(file);
      } else {
        toast("Please upload only .csv or .xlsx files");
        setSelectedFile(null);
      }
    }
  };

  const getAvailableSemesters = () => {
    if (!formData.batchId || !academicYear) return [];
    const selectedBatch = batches.find((b) => b._id === formData.batchId);
    if (!selectedBatch) return [];

    const batchStart = selectedBatch.startYear;
    const acadStart = academicYear.startYear;
    const diffInYears = acadStart - batchStart;

    if (diffInYears < 0) return [];

    const semStart = diffInYears * 2 + 1;
    const semEnd = semStart + 1;
    const totalPossibleSems = selectedBatch.programDuration * 2;

    const result = [];
    if (semStart <= totalPossibleSems) result.push(semStart);
    if (semEnd <= totalPossibleSems) result.push(semEnd);
    return result;
  };

  const handleRedirectToManagement = () => {
    const bId =
      activeTab === "single" ? formData.batchId : bulkValidate.batchId;
    const dId =
      activeTab === "single" ? formData.departmentId : bulkValidate.deptId;
    navigate(
      `/admin/dashboard?tab=batch-management&batchId=${bId}&deptId=${dId}&highlight=reg`,
    );
    onClose();
  };

  const handleRedirectToAcadYear = () => {
    navigate(`/admin/dashboard?tab=batch-management&manageYears=true`);
    onClose();
  };

  const handleSubmit = async () => {
    if (activeTab === "multiple") {
      if (!selectedFile) return toast("Please select a file first");

      const bulkFormData = new FormData();
      bulkFormData.append("file", selectedFile);

      toast.promise(bulkUploadStudents(bulkFormData), {
        loading: "Uploading and processing file...",
        success: () => {
          clearTableCache();
          onClose();
          if (handleApicall) handleApicall();
          return "Bulk upload completed successfully!";
        },
        error: (err) => err.message || "Bulk upload failed",
      });
      return;
    }

    const apiCall = isEdit
      ? updateStudent(editData._id, formData)
      : createStudent(formData);

    toast.promise(apiCall, {
      loading: isEdit
        ? "Updating student details..."
        : "Creating new student...",
      success: () => {
        clearTableCache();
        onClose();
        if (handleApicall) handleApicall();
        return isEdit
          ? "Student updated successfully!"
          : "Student added successfully!";
      },
      error: (err) =>
        err.response?.data?.message || err.message || "Operation failed",
    });
  };

  const availableSemesters = getAvailableSemesters();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>
      <section className="w-[400px] md:w-[600px] bg-white fixed right-0 top-0 h-full z-[60] flex flex-col shadow-2xl font-['Poppins']">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
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

        <div className="mx-6 mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <AlertOctagon size={18} className="text-gray-700 shrink-0" />
            <p className="text-[11px] text-gray-900">
              The student's year will be considered for this academic year :{" "}
              <strong className="text-red-500">
                {activeAcadYear?.name || "Loading..."}
              </strong>
            </p>
          </div>
          <button
            onClick={handleRedirectToAcadYear}
            className="text-[10px] font-bold text-gray-700 underline uppercase tracking-tighter"
          >
            Change
          </button>
        </div>

        {!isEdit && (
          <div className="px-6 mt-4 shrink-0">
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
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
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
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Register No
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
                    Roll No
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
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  >
                    <option value="">Select Dept</option>
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
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
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

              <ValidationStatus
                hasSelection={formData.departmentId && formData.batchId}
                loading={loadingSections}
                isValid={sections.length > 0}
                onSetup={handleRedirectToManagement}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Section
                  </label>
                  <select
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleChange}
                    disabled={!sections.length}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Semester
                  </label>
                  <select
                    name="semesterNumber"
                    value={formData.semesterNumber}
                    onChange={handleChange}
                    disabled={!formData.batchId}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  >
                    <option value="">Select Semester</option>
                    {availableSemesters.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
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
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    DOB
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#08384F]/5 border border-[#08384F]/10 rounded-xl p-4 space-y-4 text-[11px]">
                <div className="flex items-center gap-2 font-bold text-[#08384F]">
                  <Info size={14} />
                  Excel Upload Format
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-2">
                    Mandatory Columns
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "firstName",
                      "lastName",
                      "registerNumber",
                      "rollNumber",
                      "semesterNumber",
                      "email",
                      "departmentCode",
                      "batchName",
                    ].map((field) => (
                      <span
                        key={field}
                        className="px-3 py-1 rounded-full border font-semibold border-gray-300 bg-white text-[10px] tracking-wider"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-10 text-center cursor-pointer hover:border-[#08384F]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv, .xlsx"
                />
                {selectedFile ? (
                  <p className="text-sm font-bold text-[#08384F]">
                    {selectedFile.name}
                  </p>
                ) : (
                  <div className="text-gray-400">
                    <UploadCloud size={40} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">Upload Student List</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-white shrink-0">
          <button
            className="flex-1 py-3 border rounded-xl text-sm font-bold text-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-sm font-bold"
            onClick={handleSubmit}
            disabled={activeTab === "single" ? !formData.email : !selectedFile}
          >
            {isEdit
              ? "Update"
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
