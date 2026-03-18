// AddAdditionalHourModal.js
import React, { useState, useRef, useEffect } from "react";
import { PlusCircle, ChevronDown, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const AddAdditionalHourModal = ({
  onClose,
  onAdd,
  availableFaculties,
  editingHour,
}) => {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    venue: "",
    hours: 1,
    facultyIds: [],
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editingHour) {
      setForm({
        name: editingHour.name || "",
        shortName: editingHour.shortName || "",
        venue: editingHour.venue || "",
        hours: editingHour.hours || 1,
        facultyIds: editingHour.facultyIds || [],
      });
    }
  }, [editingHour]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFacultyToggle = (facultyId) => {
    setForm((prev) => {
      const isSelected = prev.facultyIds.includes(facultyId);
      if (isSelected) {
        return {
          ...prev,
          facultyIds: prev.facultyIds.filter((id) => id !== facultyId),
        };
      } else {
        return { ...prev, facultyIds: [...prev.facultyIds, facultyId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.shortName)
      return toast.error("Please fill all fields");
    onAdd(form, !!editingHour, editingHour?._id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-[#08384F] mb-4 flex items-center gap-2">
          {editingHour ? (
            <>
              <Edit3 size={20} /> Edit Additional Hour
            </>
          ) : (
            <>
              <PlusCircle size={20} /> Add Additional Hour
            </>
          )}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Hour Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#08384F]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Short Name
              </label>
              <input
                type="text"
                required
                value={form.shortName}
                onChange={(e) =>
                  setForm({ ...form, shortName: e.target.value.toUpperCase() })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#08384F]"
                maxLength="10"
              />
            </div>
            <div className="w-24">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Hours
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.hours}
                onChange={(e) =>
                  setForm({ ...form, hours: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#08384F]"
              />
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Faculties
            </label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer flex justify-between items-center mt-1"
            >
              <span
                className={
                  form.facultyIds.length > 0
                    ? "text-[#08384F]"
                    : "text-slate-400 font-normal"
                }
              >
                {form.facultyIds.length > 0
                  ? `${form.facultyIds.length} Faculty Selected`
                  : "Select Faculties"}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {availableFaculties.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">
                    No faculties available
                  </div>
                ) : (
                  availableFaculties.map((fac) => (
                    <label
                      key={fac._id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none"
                    >
                      <input
                        type="checkbox"
                        checked={form.facultyIds.includes(fac._id)}
                        onChange={() => handleFacultyToggle(fac._id)}
                        className="mt-1 w-4 h-4 text-[#08384F] border-slate-300 rounded focus:ring-[#08384F] cursor-pointer"
                      />
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-bold text-[#08384F]">
                          {fac.salutation}{" "}
                          {fac.fullName || `${fac.firstName} ${fac.lastName}`}
                        </span>
                        <span className="text-slate-500 font-medium whitespace-nowrap">
                          {fac.designation}/
                          {fac.departmentId?.code ||
                            fac.department?.code ||
                            "N/A"}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Venue (Optional)
            </label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#08384F]"
              placeholder="Enter venue"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-xs font-black shadow-sm hover:shadow-lg transition-colors"
            >
              {editingHour ? "Update Hour" : "Add Hour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdditionalHourModal;
