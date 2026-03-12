import React from "react";
import { Power, Loader2 } from "lucide-react";

const StatusConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  section,
  loading,
}) => {
  if (!isOpen || !section) return null;

  const isDeactivating = section.isActive;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-[#08384F] text-white shadow-lg shadow-blue-900/20`}
        >
          <Power size={20} />
        </div>

        <h3 className="text-xl font-bold text-[#08384F] text-center mb-2">
          {isDeactivating ? "Deactivate Section?" : "Activate Section?"}
        </h3>

        <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed">
          Are you sure you want to {isDeactivating ? "deactivate" : "activate"}
          <span className="font-bold text-[#08384F]">
            {" "}
            Section {section.name} ?
          </span>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-[1.5] py-3 bg-[#08384F] hover:bg-[#0a4763] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationModal;
