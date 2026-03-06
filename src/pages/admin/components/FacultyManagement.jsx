import React, { useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import FacultyStats from "./FacultyStats";
import FacultyPieChart from "./FacultyPieChart";
import FacultyTable from "./FacultyTable";
import AddFacultyModal from "../modal/AddFacultyModal";
import InactivateFacultyModal from "../modal/InactivateFacultyModal";
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
      // Note: Backend expectation for status toggle should be verified (Boolean vs String)
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
    <div className="min-h-screen font-['Poppins'] bg-gray-50/30">
      <HeaderComponent title="Faculty Management" />
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[30vh]">
          <div className="lg:w-[70%] w-full flex">
            <FacultyStats />
          </div>
          <div className="lg:w-[30%] w-full flex">
            <FacultyPieChart />
          </div>
        </div>
        <div className="w-full">
          <FacultyTable
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
            onStatusClick={(faculty) =>
              setStatusModal({ isOpen: true, data: faculty })
            }
          />
        </div>
      </div>
      {isCanvas && (
        <AddFacultyModal
          setIsCanvas={setIsCanvas}
          isEdit={isEdit}
          editData={editData}
        />
      )}
      <InactivateFacultyModal
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
