import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const AddAdditionalHourModal = ({ onClose, onAdd, availableFaculties }) => {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    venue: "",
    facultyIds: [],
  });

  const handleFacultyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value,
    );
    setForm({ ...form, facultyIds: selectedOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.shortName)
      return toast.error("Please fill all fields");
    onAdd(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-[#08384F] mb-4 flex items-center gap-2">
          <PlusCircle size={20} /> Add Additional Hour
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
            />
          </div>
          <div>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
              maxLength="10"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Faculties (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={form.facultyIds}
              onChange={handleFacultyChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none min-h-[80px]"
            >
              {availableFaculties.map((fac) => (
                <option key={fac._id} value={fac._id}>
                  {fac.fullName || `${fac.firstName} ${fac.lastName}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Venue (Optional)
            </label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-emerald-700"
            >
              Add Hour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdditionalHourModal;
