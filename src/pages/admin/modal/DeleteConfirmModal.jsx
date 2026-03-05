import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteSubject } from "../api/admin.api";
import toast from "react-hot-toast";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  subjectId,
  subjectName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSubject(subjectId);
      toast.success("Subject deleted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Poppins']">
      <div
        className="absolute inset-0 bg-red-900/10 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          You are about to delete{" "}
          <span className="font-bold text-gray-800">"{subjectName}"</span>. This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
