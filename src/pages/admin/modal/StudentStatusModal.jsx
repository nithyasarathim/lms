import React from "react";
import { Power, Loader2 } from "lucide-react";

const StudentStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  loading,
}) => {
  if (!isOpen || !student) return null;

  const isDeactivating = student.isActive;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-['Poppins']">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto ${isDeactivating ? "bg-red-500" : "bg-green-500"} text-white shadow-lg`}
        >
          <Power size={24} />
        </div>

        <h3 className="text-xl font-black text-[#08384F] text-center mb-2">
          {isDeactivating ? "Deactivate Student?" : "Activate Student?"}
        </h3>

        <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed px-2">
          Are you sure you want to {isDeactivating ? "deactivate" : "activate"}
          <span className="font-black text-[#08384F]"> {student.fullName}</span>
          ? This will {isDeactivating ? "prevent" : "enable"} their portal
          access.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-[1.5] py-3 bg-[#08384F] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Confirm Action"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentStatusModal;
