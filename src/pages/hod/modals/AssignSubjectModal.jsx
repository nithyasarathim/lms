import React from "react";

const AssignSubjectModal = ({ faList, additionalHours, onClose, onAssign }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(e.target.assignment.value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-[#08384F] mb-4">
          Select Component
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="assignment"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer"
          >
            <optgroup label="Academic Components">
              {faList.map((fa) => (
                <option key={fa._id} value={fa._id}>
                  {fa.subjectComponentId?.subjectId?.code || "N/A"} -{" "}
                  {fa.subjectComponentId?.name || "Unknown"}
                  {fa.facultyIds && fa.facultyIds.length > 0
                    ? ` (${fa.facultyIds.map((f) => f.lastName).join(", ")})`
                    : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Additional Hours">
              {additionalHours.map((ah, idx) => (
                <option
                  key={`ah-${ah._id || idx}`}
                  value={`ADDITIONAL|${ah._id || ah.shortName}`}
                >
                  {ah.name} ({ah.shortName})
                </option>
              ))}
            </optgroup>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-black text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-xs font-black shadow-lg"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignSubjectModal;