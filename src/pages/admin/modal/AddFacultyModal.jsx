import {
  X,
  UploadCloud,
  ChevronDown,
  User,
  Briefcase,
  FileText,
  Check,
  Loader2,
  Info,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import {
  getDepartments,
  addFaculty,
  updateFaculty,
  facultyBulkUpload,
  getAllFaculties,
} from "../api/admin.api";
import toast from "react-hot-toast";

const steps = ["Personal Details", "Professional Info", "Documents"];

const designations = [
  "Professor",
  "Assistant Professor",
  "Associate Professor",
  "HOD",
  "Dean",
  "Faculty",
  "Professor of Practice",
  "Lab Technician",
  "Department Secretary",
  "Senior Lab Technician",
];

const requiredFields = [
  "email",
  "firstName",
  "lastName",
  "employeeId",
  "primaryPhone",
  "departmentCode",
  "salutation",
  "gender",
  "dateOfBirth",
  "joiningDate",
  "qualification",
  "designation",
];

const InputGroup = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  icon: Icon,
  value,
  onChange,
}) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border border-gray-100 bg-gray-50 rounded-2xl ${
          Icon ? "pl-11" : "px-4"
        } py-3 text-[15px] focus:bg-white focus:border-[#08384F] focus:ring-4 focus:ring-[#08384F]/5 transition-all outline-none font-medium`}
      />
    </div>
  </div>
);

const SelectGroup = ({
  label,
  name,
  options,
  required = false,
  displayKey = "name",
  valueKey = "_id",
  value,
  onChange,
}) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full appearance-none border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-[15px] focus:bg-white focus:border-[#08384F] focus:ring-4 focus:ring-[#08384F]/5 transition-all outline-none font-medium cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option
            key={typeof opt === "string" ? opt : opt[valueKey]}
            value={typeof opt === "string" ? opt : opt[valueKey]}
          >
            {typeof opt === "string" ? opt : opt[displayKey]}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  </div>
);

const AddFacultyModal = ({ setIsCanvas, isEdit, editData }) => {
  const panelRef = useRef();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("single");
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [experienceCertificate, setExperienceCertificate] = useState(null);
  const [degreeCertificate, setDegreeCertificate] = useState(null);
  const [marksheet, setMarksheet] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);

  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    password: "",
    primaryPhone: "",
    secondaryPhone: "",
    qualification: "",
    workType: "",
    employeeId: "",
    joiningDate: "",
    designation: "",
    departmentId: "",
    reportingManager: "",
    noticePeriod: "",
    employmentStatus: "ACTIVE",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, facultyRes] = await Promise.all([
          getDepartments(),
          getAllFaculties(),
        ]);
        const deptData = deptRes?.data?.departments || deptRes || [];
        setDepartments(deptData);

        const allFaculties = facultyRes?.data?.facultyList || [];
        const filteredFaculties = isEdit
          ? allFaculties.filter((f) => f._id !== editData._id)
          : allFaculties;

        setFacultyOptions(
          filteredFaculties.map((f) => ({
            _id: f._id,
            name: `${f.salutation} ${f.firstName} ${f.lastName} (${f.employeeId})`,
          })),
        );
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    fetchData();

    if (isEdit && editData) {
      setFormData({
        salutation: editData.salutation || "",
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        gender: editData.userId.gender || "",
        dateOfBirth: editData.userId.dateOfBirth
          ? editData.userId.dateOfBirth.split("T")[0]
          : "",
        email: editData.userId.email || "",
        password: "",
        primaryPhone: editData.primaryPhone || "",
        secondaryPhone: editData.secondaryPhone || "",
        qualification: editData.qualification || "",
        workType: editData.workType || "",
        employeeId: editData.employeeId || "",
        joiningDate: editData.joiningDate
          ? editData.joiningDate.split("T")[0]
          : "",
        designation: editData.designation || "",
        departmentId: editData.departmentId?._id || editData.departmentId || "",
        reportingManager:
          editData.reportingManager?._id || editData.reportingManager || "",
        noticePeriod: editData.noticePeriod || "",
        employmentStatus: editData.employmentStatus || "ACTIVE",
      });
    }
  }, [isEdit, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = (e, field) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    if (field === "experience") setExperienceCertificate(uploadedFile);
    if (field === "marksheet") setMarksheet(uploadedFile);
    if (field === "degree") setDegreeCertificate(uploadedFile);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsUploading(true);
    try {
      if (activeTab === "multiple") {
        if (!file) throw new Error("Please select a file");
        const data = new FormData();
        data.append("file", file);
        await facultyBulkUpload(data);
        toast.success("Bulk upload successful");
      } else {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "password" && isEdit && !value) return;
          data.append(key, value);
        });
        if (experienceCertificate)
          data.append("experienceCertificate", experienceCertificate);
        if (degreeCertificate)
          data.append("degreeCertificate", degreeCertificate);
        if (marksheet) data.append("markSheet", marksheet);

        if (isEdit) {
          await updateFaculty(editData._id, data);
          toast.success("Faculty updated successfully");
        } else {
          await addFaculty(data);
          toast.success("Faculty registered successfully");
        }
      }
      setIsCanvas(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#08384F]/20 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={() => !isUploading && setIsCanvas(false)}
      />
      <section
        ref={panelRef}
        className="w-[45%] bg-white h-screen z-[60] fixed right-0 top-0 shadow-2xl transition-all duration-300 ease-in-out flex flex-col font-['Poppins']"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50 bg-white">
          <div>
            <h1 className="font-bold text-xl text-[#282526] tracking-tight">
              {isEdit ? "Update Faculty Profile" : "Add Faculty"}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Academic Resource Management
            </p>
          </div>
          <button
            onClick={() => setIsCanvas(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} className="text-gray-400" />
          </button>
        </div>

        {!isEdit && (
          <div className="px-8 mt-6">
            <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-2xl">
              <button
                onClick={() => setActiveTab("single")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "single"
                    ? "bg-white text-[#08384F] shadow-sm"
                    : "text-gray-400"
                }`}
              >
                <Plus size={14} /> Single Entry
              </button>
              <button
                onClick={() => setActiveTab("multiple")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "multiple"
                    ? "bg-white text-[#08384F] shadow-sm"
                    : "text-gray-400"
                }`}
              >
                <FileSpreadsheet size={14} /> Bulk Import
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-6 pb-32">
          {activeTab === "single" ? (
            <div className="space-y-6">
              <Box sx={{ width: "100%", mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconProps={{
                          style: {
                            color: activeStep >= index ? "#08384F" : "#E5E7EB",
                          },
                        }}
                      >
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            activeStep >= index
                              ? "text-[#08384F]"
                              : "text-gray-300"
                          }`}
                        >
                          {label}
                        </span>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {activeStep === 0 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-3 gap-4">
                    <SelectGroup
                      label="Title"
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      options={["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]}
                      required
                    />
                    <div className="col-span-2">
                      <InputGroup
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <InputGroup
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="doe"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectGroup
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      options={["Male", "Female", "Other"]}
                      required
                    />
                    <InputGroup
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <InputGroup
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="johndoe@sece.ac.in"
                  />
                  {!isEdit && (
                    <InputGroup
                      label="Initial Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Primary Mobile"
                      name="primaryPhone"
                      value={formData.primaryPhone}
                      onChange={handleChange}
                      required
                      placeholder="9876543210"
                    />
                    <InputGroup
                      label="Secondary Phone"
                      name="secondaryPhone"
                      value={formData.secondaryPhone}
                      onChange={handleChange}
                      placeholder="9123456780"
                    />
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Employee ID"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      placeholder="EMPXXX"
                    />
                    <InputGroup
                      label="Joining Date"
                      name="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <SelectGroup
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    options={designations}
                    required
                  />
                  <SelectGroup
                    label="Department"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    options={departments}
                    displayKey="name"
                    valueKey="_id"
                    required
                  />
                  <InputGroup
                    label="Highest Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. PhD"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectGroup
                      label="Contract Type"
                      name="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      options={["Full Time", "Part Time", "Contract"]}
                      required
                    />
                    <InputGroup
                      label="Notice Period"
                      name="noticePeriod"
                      value={formData.noticePeriod}
                      onChange={handleChange}
                      placeholder="e.g. 30 days"
                    />
                  </div>
                  <SelectGroup
                    label="Reporting Manager"
                    name="reportingManager"
                    value={formData.reportingManager}
                    onChange={handleChange}
                    options={facultyOptions}
                    displayKey="name"
                    valueKey="_id"
                  />
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {[
                    {
                      id: "experience",
                      label: "Experience Certificate",
                      state: experienceCertificate,
                    },
                    { id: "marksheet", label: "Marksheet", state: marksheet },
                    {
                      id: "degree",
                      label: "Degree Certificate",
                      state: degreeCertificate,
                    },
                  ].map((doc) => (
                    <div key={doc.id} className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block">
                        {doc.label}
                      </label>
                      <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all group ${
                          doc.state
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-gray-100 bg-gray-50 hover:border-[#08384F]/30"
                        }`}
                      >
                        <div className="p-3 bg-white rounded-2xl shadow-sm mb-2">
                          {doc.state ? (
                            <Check size={24} className="text-emerald-500" />
                          ) : (
                            <UploadCloud size={24} className="text-[#08384F]" />
                          )}
                        </div>
                        <span
                          className={`text-[12px] font-bold ${
                            doc.state ? "text-emerald-600" : "text-gray-500"
                          }`}
                        >
                          {doc.state ? doc.state.name : "Click to upload PDF"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(e, doc.id)}
                          accept=".pdf"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#08384F]/5 p-5 rounded-3xl border border-[#08384F]/10 space-y-4">
                <div className="flex gap-3">
                  <Info className="text-[#08384F] shrink-0" size={20} />
                  <div className="text-[12px] text-[#08384F] leading-relaxed">
                    <p className="font-bold uppercase mb-2 tracking-tight">
                      Required Columns
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredFields.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 bg-[#08384F]/10 rounded-md font-bold"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#08384F]/10">
                  <p className="text-[10px] font-bold text-[#08384F] uppercase mb-2 ml-8">
                    Valid Department Codes:
                  </p>
                  <div className="flex flex-wrap gap-1.5 ml-8">
                    {[...new Set(departments.map((d) => d.code))].map(
                      (code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 bg-[#08384F] text-white rounded-md text-[10px] font-bold"
                        >
                          {code}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#08384F]/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-5 bg-white rounded-3xl shadow-sm mb-4">
                  <UploadCloud className="text-[#08384F]" size={32} />
                </div>
                <p className="text-[16px] font-bold text-gray-700 text-center">
                  {file ? file.name : "Click to upload Faculty Directory"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Excel (.xlsx) files only
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 right-0 w-full bg-white border-t border-gray-50 p-8 flex gap-4">
          {activeTab === "single" ? (
            <>
              {activeStep !== 0 && (
                <button
                  onClick={() => setActiveStep((s) => s - 1)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={
                  activeStep === steps.length - 1
                    ? handleSubmit
                    : () => setActiveStep((s) => s + 1)
                }
                disabled={isUploading}
                className="flex-[1.5] py-3.5 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg shadow-[#08384F]/20 hover:bg-[#0a4763] transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : activeStep === steps.length - 1 ? (
                  <Check size={18} />
                ) : null}
                {activeStep === steps.length - 1
                  ? isEdit
                    ? "Update Profile"
                    : "Finalize Registration"
                  : "Next Step"}
              </button>
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isUploading || !file}
              className="w-full py-3.5 bg-[#08384F] text-white rounded-2xl font-bold shadow-lg shadow-[#08384F]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={18} />}
              {isUploading ? "Uploading..." : "Upload Faculty List"}
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default AddFacultyModal;
