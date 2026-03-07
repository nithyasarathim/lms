import React, { useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import FacultyStats from "./FacultyStats";
import FacultyPieChart from "./FacultyPieChart";
import FacultyTable from "./FacultyTable";
import AddFacultyModal from "../modal/AddFacultyModal";
import FacultyStatusModal from "../modal/FacultyStatusModal";
import { updateFaculty } from "../api/admin.api";
import toast from "react-hot-toast";

const FacultyManagement = () => {
  const [isCanvas, setIsCanvas] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
  const [isUpdating, setIsUpdating] = useState(false);

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
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-fit flex flex-col font-['Poppins'] bg-gray-50/30 relative">
      <HeaderComponent title="Faculty Management" />
      
      <div className="flex-1 flex flex-col px-6 py-6 space-y-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 shrink-0">
          <div className="lg:w-[70%] w-full h-[200px]">
            <FacultyStats />
          </div>
          <div className="lg:w-[30%] w-full h-[200px]">
            <FacultyPieChart />
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <FacultyTable
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
        />
      )}
      <FacultyStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, data: null })}
        onConfirm={handleStatusToggle}
        faculty={statusModal.data}
        loading={isUpdating}
      />
    </div>
  );
};

export default FacultyManagement;