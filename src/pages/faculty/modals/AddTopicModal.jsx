import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { addTopic, updateTopic } from "../api/faculty.api";

const AddTopicModal = ({
  isOpen,
  onClose,
  classroomId,
  onTopicAction,
  initialData = null,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      let res;
      if (initialData) {
        // UPDATE MODE
        res = await updateTopic(classroomId, initialData._id, { name });
      } else {
        // CREATE MODE
        console.log(classroomId);
        res = await addTopic(classroomId, { name });
      }

      if (res.success) {
        onTopicAction();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Error processing topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
        <h2 className="text-2xl font-bold text-[#08384F] mb-2">
          {initialData ? "Rename topic" : "Add topic"}
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Topics help organize classwork into modules or units.
        </p>

        <div className="relative group mb-8">
          <input
            autoFocus
            className="w-full text-base p-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[#08384F] outline-none transition-all placeholder:text-gray-400"
            placeholder="Topic name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#08384F] transition-all group-focus-within:w-full"></span>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold text-right">
            {name.length} / 100
          </p>
        </div>

        <div className="flex justify-end gap-6">
          <button
            onClick={onClose}
            className="text-gray-500 font-bold hover:text-gray-700 transition-colors uppercase tracking-wider text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="text-[#08384F] font-bold hover:bg-[#08384F]/10 px-4 py-2 rounded transition-all uppercase tracking-wider text-sm flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {initialData ? "Rename" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTopicModal;
