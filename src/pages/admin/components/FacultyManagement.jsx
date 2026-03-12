import React, { useState } from "react";
import { motion } from "framer-motion";
import HeaderComponent from "../../shared/components/HeaderComponent";
import FacultyStats from "./FacultyStats";
import FacultyPieChart from "./FacultyPieChart";
import FacultyTable from "./FacultyTable";
import AddFacultyModal from "../modals/AddFacultyModal";
import FacultyStatusModal from "../modals/FacultyStatusModal";
import { updateFaculty } from "../api/admin.api";
import toast from "react-hot-toast";

const FacultyManagement = () => {
  const [isCanvas, setIsCanvas] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setIsEdit(false);
    setEditData(null);
    setIsCanvas(true);
  };

  const handleEditClick = (faculty) => {
    setIsEdit(true);
    setEditData(faculty);
    setIsCanvas(true);
  };

  const handleStatusToggle = async () => {
    if (!statusModal.data?._id) return;
    setIsUpdating(true);
    try {
      const newStatus = !statusModal.data.isActive;
      await updateFaculty(statusModal.data._id, { isActive: newStatus });
      toast.success(
        `Faculty ${newStatus ? "activated" : "deactivated"} successfully`,
      );
      setStatusModal({ isOpen: false, data: null });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "linear" }}
      className="h-fit flex flex-col font-['Poppins'] bg-gray-50/30 relative"
    >
      <HeaderComponent title="Faculty Management" />

      <div className="flex-1 flex flex-col px-6 py-6 space-y-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 shrink-0">
          <div className="lg:w-[70%] w-full h-[200px]">
            <FacultyStats key={`stats-${refreshKey}`} />
          </div>
          <div className="lg:w-[30%] w-full h-[200px]">
            <FacultyPieChart key={`pie-${refreshKey}`} />
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <FacultyTable
              key={`table-${refreshKey}`}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onStatusClick={(faculty) =>
                setStatusModal({ isOpen: true, data: faculty })
              }
            />
          </div>
        </div>
      </div>

      {isCanvas && (
        <AddFacultyModal
          setIsCanvas={setIsCanvas}
          isEdit={isEdit}
          editData={editData}
          handleRefresh={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
      <FacultyStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, data: null })}
        onConfirm={handleStatusToggle}
        faculty={statusModal.data}
        loading={isUpdating}
      />
    </motion.div>
  );
};

export default FacultyManagement;