import {
  X,
  UploadCloud,
  ChevronDown,
  User,
  Briefcase,
  FileText,
  Check,
  Loader2,
} from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { getDepartments, addFaculty, updateFaculty } from "../api/admin.api";
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
  "admin",
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
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border border-gray-100 bg-gray-50 rounded-xl ${Icon ? "pl-11" : "px-4"} py-2.5 text-sm focus:bg-white focus:border-[#08384F] transition-all outline-none font-medium`}
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
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full appearance-none border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-[#08384F] transition-all outline-none font-medium"
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
        size={16}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  </div>
);

const AddFacultyModal = ({ setIsCanvas, isEdit, editData, setIsEdit }) => {
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

  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    mobileNumber: "",
    phone: "",
    qualification: "",
    workType: "",
    employeeId: "",
    joiningDate: "",
    designation: "",
    departmentId: "",
    reportingManager: "",
    noticePeriod: "",
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data || []);
      } catch (err) {
        toast.error("Failed to load departments");
      }
    };
    fetchDepts();

    if (isEdit && editData) {
      setFormData({
        salutation: editData.salutation || "",
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        gender: editData.gender || "",
        dob: editData.dateOfBirth ? editData.dateOfBirth.split("T")[0] : "",
        email: editData.email || "",
        password: "",
        mobileNumber: editData.mobileNumber || "",
        phone: editData.phone || "",
        qualification: editData.qualification || "",
        workType: editData.workType || "",
        employeeId: editData.employeeId || "",
        joiningDate: editData.joiningDate
          ? editData.joiningDate.split("T")[0]
          : "",
        designation: editData.designation || "",
        departmentId: editData.departmentId?._id || editData.departmentId || "",
        reportingManager: editData.reportingManager || "",
        noticePeriod: editData.noticePeriod || "",
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
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      !allowedTypes.includes(uploadedFile.type) ||
      uploadedFile.size > 5 * 1024 * 1024
    ) {
      toast.error("File must be PDF/DOC and under 5MB");
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
      // Find selected department details for payload
      const selectedDept = departments.find(
        (d) => d._id === formData.departmentId,
      );

      const payload = {
        ...formData,
        dateOfBirth: formData.dob,
        departmentName: selectedDept?.name || "",
        departmentCode: selectedDept?.code || "",
      };

      const data = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "password" && isEdit && !value) return;
        if (key !== "dob") data.append(key, value);
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
        className="fixed inset-0 bg-[#08384F]/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCanvas(false)}
      />
      <section
        ref={panelRef}
        className="w-[45%] bg-white h-screen z-[60] fixed right-0 top-0 shadow-2xl transition-all duration-300 ease-in-out flex flex-col font-['Poppins']"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50 bg-white">
          <div>
            <h1 className="font-bold text-xl text-[#08384F]">
              {isEdit ? "Update Faculty Profile" : "Register New Faculty"}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Academic Resource Management
            </p>
          </div>
          <button
            onClick={() => setIsCanvas(false)}
            className="rounded-2xl w-10 h-10 flex justify-center items-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {!isEdit && (
          <div className="px-8 mt-6">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              {["single", "multiple"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? "bg-white text-[#08384F] shadow-sm" : "text-gray-400"}`}
                >
                  {tab === "single" ? "Single Entry" : "Bulk Import"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-6 pb-32">
          {activeTab === "single" ? (
            <>
              <Box sx={{ width: "100%", mb: 6 }}>
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
                          className={`text-[10px] font-bold uppercase tracking-tight ${activeStep >= index ? "text-[#08384F]" : "text-gray-300"}`}
                        >
                          {label}
                        </span>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <div className="animate-in slide-in-from-right-4 duration-300">
                {activeStep === 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-[#08384F]" />
                      <h2 className="text-sm font-bold text-[#08384F]">
                        Basic Identity
                      </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <SelectGroup
                        label="Title"
                        name="salutation"
                        value={formData.salutation}
                        onChange={handleChange}
                        options={["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]}
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
                      placeholder="Doe"
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
                        name="dob"
                        type="date"
                        value={formData.dob}
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
                      placeholder="john.doe@university.edu"
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
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                        placeholder="+91 ..."
                      />
                      <InputGroup
                        label="Secondary Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={18} className="text-[#08384F]" />
                      <h2 className="text-sm font-bold text-[#08384F]">
                        Employment Details
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup
                        label="Employee ID"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                        placeholder="EMP001"
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
                      label="Current Designation"
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
                        options={[
                          "Full Time",
                          "Part Time",
                          "Contract",
                          "Visiting",
                        ]}
                        required
                      />
                      <SelectGroup
                        label="Notice Period"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        options={["1 month", "2 months", "3 months", "None"]}
                      />
                    </div>
                    <InputGroup
                      label="Reporting Manager"
                      name="reportingManager"
                      value={formData.reportingManager}
                      onChange={handleChange}
                      placeholder="Name of Supervisor"
                    />
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={18} className="text-[#08384F]" />
                      <h2 className="text-sm font-bold text-[#08384F]">
                        Document Verification
                      </h2>
                    </div>
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
                        <label className="text-[11px] font-bold text-gray-400 uppercase">
                          {doc.label}
                        </label>
                        <label
                          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-3xl cursor-pointer transition-all group ${doc.state ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100 bg-gray-50 hover:border-[#08384F]"}`}
                        >
                          {doc.state ? (
                            <Check
                              size={28}
                              className="text-emerald-500 mb-1"
                            />
                          ) : (
                            <UploadCloud
                              size={28}
                              className="text-gray-300 group-hover:text-[#08384F] mb-1"
                            />
                          )}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-tight ${doc.state ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {doc.state
                              ? doc.state.name
                              : "Upload PDF (Max 5MB)"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(e, doc.id)}
                            accept=".pdf,.doc,.docx"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                <UploadCloud size={40} className="text-[#08384F]" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Batch Import Faculty
                </p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Select the .xlsx file containing the faculty directory.
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                accept=".xlsx,.xls"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full max-w-xs py-3.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-[#08384F] hover:shadow-lg transition-all"
              >
                {file ? `File: ${file.name}` : "Select Spreadsheet"}
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 right-0 w-full bg-white border-t border-gray-50 p-8 flex gap-4">
          {activeTab === "single" ? (
            <>
              {activeStep !== 0 && (
                <button
                  onClick={() => setActiveStep((s) => s - 1)}
                  className="flex-1 py-4 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              {activeStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-[2] py-4 bg-[#08384F] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#08384F]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {isEdit ? "Update Account" : "Finalize Registration"}
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep((s) => s + 1)}
                  className="flex-[2] py-4 bg-[#08384F] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#08384F]/20 hover:scale-[1.02] transition-all"
                >
                  Next Step
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isUploading || !file}
              className="w-full py-4 bg-[#08384F] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#08384F]/20 disabled:opacity-30"
            >
              {isUploading ? "Processing Batch..." : "Begin Upload Process"}
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default AddFacultyModal;
