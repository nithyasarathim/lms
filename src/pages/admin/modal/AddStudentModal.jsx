import React, { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { createStudent, updateStudent } from "../api/admin.api";
import toast from "react-hot-toast";

const AddStudentModal = ({ onClose, isEdit, editData, handleApicall }) => {
  const [activeTab, setActiveTab] = useState("single");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    registerNumber: "",
    rollNumber: "",
    department: "",
    year: "",
    section: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        registerNumber: editData.studentId || "", // mapping ID
        rollNumber: editData.rollNumber || "",
        department: editData.departmentId?._id || "",
        year: editData.currentYear || "",
        section: editData.section || "",
        email: editData.userId?.email || "",
        mobileNumber: editData.primaryPhone || "",
        password: "", // Password usually hidden in edit
      });
    }
  }, [isEdit, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateStudent(editData._id, formData);
        toast.success("Student updated successfully!");
      } else {
        await createStudent(formData);
        toast.success("Student added successfully!");
      }
      onClose();
      if (handleApicall) handleApicall();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "add"} student`,
      );
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>
      <section className="w-[400px] md:w-[500px] bg-white absolute right-0 top-0 h-screen z-[60] flex flex-col shadow-2xl font-['Poppins']">
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

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Register / Roll Number
                </label>
                <input
                  type="text"
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm focus:bg-white focus:border-[#08384F] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  >
                    <option value="">Select</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
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
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                />
              </div>

              {!isEdit && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-10 text-center hover:border-[#08384F] transition-all cursor-pointer">
              <UploadCloud size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-bold text-[#08384F]">
                Upload Students List
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Accepts .xlsx or .csv files
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10"
            onClick={handleSubmit}
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
