import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Save,
  LayoutGrid,
  Users,
  MapPin,
  UserCheck,
  ChevronDown,
  Search,
  Plus,
  UserMinus,
} from "lucide-react";
import { getAllFaculties } from "../api/admin.api";
import toast from "react-hot-toast";

const EditSectionModal = ({ isOpen, onClose, onSave, section, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    venue: "",
    advisor: "",
    tutors: [],
  });
  const [faculties, setFaculties] = useState([]);
  const [facultiesLoaded, setFacultiesLoaded] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");

  const advisorRef = useRef(null);
  const tutorRef = useRef(null);

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || "",
        capacity: section.capacity || "",
        venue: section.venue || "",
        advisor: section.advisor?._id || section.advisor || "",
        tutors:
          section.tutors?.map((t) => (typeof t === "object" ? t._id : t)) || [],
      });
    }
    if (isOpen) fetchFaculties();
  }, [section, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (advisorRef.current && !advisorRef.current.contains(event.target)) {
        setIsAdvisorOpen(false);
        setAdvisorSearch("");
      }
      if (tutorRef.current && !tutorRef.current.contains(event.target)) {
        setIsTutorOpen(false);
        setTutorSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await getAllFaculties();
      setFaculties(res?.data?.facultyList || []);
      setFacultiesLoaded(true);
    } catch (err) {
      toast.error("Failed to load faculty list");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTutor = (id) => {
    setFormData((prev) => {
      const isRemoving = prev.tutors.includes(id);
      if (!isRemoving && prev.tutors.length >= 2) {
        toast.error("Maximum 2 tutors allowed per section");
        return prev;
      }
      return {
        ...prev,
        tutors: isRemoving
          ? prev.tutors.filter((tId) => tId !== id)
          : [...prev.tutors, id],
      };
    });
  };

  const filteredAdvisors = faculties.filter(
    (f) =>
      f.fullName?.toLowerCase().includes(advisorSearch.toLowerCase()) ||
      f.employeeId?.toLowerCase().includes(advisorSearch.toLowerCase()),
  );

  const filteredTutors = faculties.filter(
    (f) =>
      (f.fullName?.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        f.employeeId?.toLowerCase().includes(tutorSearch.toLowerCase())) &&
      !formData.tutors.includes(f._id),
  );

  const selectedAdvisor = faculties.find((f) => f._id === formData.advisor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-[#08384F]/10 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border-none">
        <div className="flex items-center justify-between px-8 py-6 flex-shrink-0">
          <h3 className="text-xl font-semibold text-[#282526]">
            Edit Section Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="px-8 pb-8 pt-2 space-y-1 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
                Section Name
              </label>
              <div className="relative group">
                <LayoutGrid
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F] transition-colors"
                  size={16}
                />
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border-none rounded-2xl focus:bg-gray-100/50 focus:ring-2 focus:ring-[#08384F]/5 outline-none transition-all font-semibold uppercase text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
                Capacity
              </label>
              <div className="relative group">
                <Users
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F] transition-colors"
                  size={16}
                />
                <input
                  required
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border-none rounded-2xl focus:bg-gray-100/50 focus:ring-2 focus:ring-[#08384F]/5 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
              Venue
            </label>
            <div className="relative group">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F] transition-colors"
                size={16}
              />
              <input
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border-none rounded-2xl focus:bg-gray-100/50 focus:ring-2 focus:ring-[#08384F]/5 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="relative space-y-1.5" ref={advisorRef}>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
              Section Advisor
            </label>
            <div
              onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
              className="w-full pl-11 pr-10 py-3 bg-gray-50/80 border-none rounded-2xl cursor-pointer flex items-center min-h-[52px] relative group hover:bg-gray-100/50 transition-all"
            >
              <UserCheck
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  selectedAdvisor ? "text-[#08384F]" : "text-gray-400"
                }`}
                size={16}
              />
              {!facultiesLoaded ? (
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              ) : selectedAdvisor ? (
                <p className="text-sm text-gray-700 leading-tight">
                  <span className="font-semibold">
                    {selectedAdvisor.salutation} {selectedAdvisor.fullName}
                  </span>
                  <span className="text-gray-400 font-medium ml-1">
                    , {selectedAdvisor.designation} /{" "}
                    {selectedAdvisor.departmentId?.code}
                  </span>
                </p>
              ) : (
                <span className="text-gray-400 text-sm font-medium">
                  Select an Advisor
                </span>
              )}
              <ChevronDown
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${
                  isAdvisorOpen ? "rotate-180" : ""
                }`}
                size={16}
              />
            </div>
            {isAdvisorOpen && (
              <div className="absolute z-[120] mt-2 w-full bg-white border-none rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-gray-50/50">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      autoFocus
                      placeholder="Search name or ID..."
                      value={advisorSearch}
                      onChange={(e) => setAdvisorSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border-none rounded-xl text-sm outline-none shadow-sm font-medium"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, advisor: "" });
                      setIsAdvisorOpen(false);
                      setAdvisorSearch("");
                    }}
                    className="px-5 py-3.5 hover:bg-red-50 cursor-pointer text-xs transition-colors flex items-center gap-2 text-red-500 font-medium border-b border-gray-50"
                  >
                    <UserMinus size={14} />
                    None (Remove Advisor)
                  </div>
                  {filteredAdvisors.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => {
                        setFormData({ ...formData, advisor: f._id });
                        setIsAdvisorOpen(false);
                        setAdvisorSearch("");
                      }}
                      className="px-5 py-3.5 hover:bg-blue-50/50 cursor-pointer text-sm transition-colors"
                    >
                      <span className="font-semibold text-gray-700">
                        {f.salutation} {f.fullName}
                      </span>
                      <span className="text-gray-400 font-medium ml-1">
                        , {f.designation} / {f.departmentId?.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Section Tutors (Max 2)
              </label>
              <div className="relative" ref={tutorRef}>
                <button
                  type="button"
                  disabled={formData.tutors.length >= 2}
                  onClick={() => setIsTutorOpen(!isTutorOpen)}
                  className="flex items-center gap-1.5 text-[#08384F] text-[11px] font-semibold bg-[#08384F]/5 px-3 py-1.5 rounded-full hover:bg-[#08384F]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={12} /> Add Tutor
                </button>
                {isTutorOpen && (
                  <div className="absolute right-0 z-[120] mt-2 w-72 bg-white border-none rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-gray-50/50">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={14}
                        />
                        <input
                          autoFocus
                          placeholder="Search tutors..."
                          value={tutorSearch}
                          onChange={(e) => setTutorSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border-none rounded-xl text-xs outline-none shadow-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                      {filteredTutors.map((f) => (
                        <div
                          key={f._id}
                          onClick={() => {
                            toggleTutor(f._id);
                            setIsTutorOpen(false);
                            setTutorSearch("");
                          }}
                          className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer text-[12px] transition-colors"
                        >
                          <span className="font-semibold text-gray-700">
                            {f.salutation} {f.fullName}
                          </span>
                          <span className="text-gray-400 font-medium ml-1">
                            , {f.designation} / {f.departmentId?.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 p-2 bg-gray-50/50 rounded-[1.5rem] min-h-[70px]">
              {!facultiesLoaded ? (
                <div className="flex flex-col gap-2">
                  <div className="h-12 w-full bg-gray-100 animate-pulse rounded-2xl" />
                </div>
              ) : formData.tutors.length === 0 ? (
                <div className="flex items-center justify-center h-12 text-gray-400 text-[12px] font-medium italic">
                  No tutors assigned to this section
                </div>
              ) : (
                formData.tutors.map((id) => {
                  const f = faculties.find((fac) => fac._id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border-none animate-in fade-in slide-in-from-right-2"
                    >
                      <p className="text-[13px] text-gray-700 leading-tight">
                        <span className="font-semibold">
                          {f?.salutation} {f?.fullName}
                        </span>
                        <span className="text-gray-400 font-medium ml-1">
                          , {f?.designation} / {f?.departmentId?.code}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleTutor(id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-300 hover:text-red-500 transition-colors ml-2"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-gray-500 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#08384F] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#0a4763] shadow-lg shadow-[#08384F]/20 transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSectionModal;
