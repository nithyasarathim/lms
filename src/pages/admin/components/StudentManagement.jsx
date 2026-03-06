import React, { useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import StudentStats from "./StudentStats";
import StudentPieChart from "./StudentPieChart";
import StudentTable from "./StudentTable";
import AddStudentModal from "../modal/AddStudentModal";
import StudentStatusModal from "../modal/StudentStatusModal";
import { updateStudent } from "../api/admin.api";
import toast from "react-hot-toast";

const StudentManagement = () => {
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

  const handleEditClick = (student) => {
    setIsEdit(true);
    setEditData(student);
    setIsCanvas(true);
  };

  const handleStatusToggle = async () => {
    if (!statusModal.data?._id) return;
    setIsUpdating(true);
    try {
      const newStatus = !statusModal.data.isActive;
      await updateStudent(statusModal.data._id, { isActive: newStatus });
      toast.success(
        `Student ${newStatus ? "activated" : "deactivated"} successfully`,
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
      <HeaderComponent title="Student Management" showAcademicYear={true} />
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[25vh]">
          <div className="lg:w-[70%] w-full flex">
            <StudentStats />
          </div>
          <div className="lg:w-[30%] w-full flex">
            <StudentPieChart />
          </div>
        </div>
        <div className="w-full">
          <StudentTable
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
            onStatusClick={(student) =>
              setStatusModal({ isOpen: true, data: student })
            }
          />
        </div>
      </div>
      {isCanvas && (
        <AddStudentModal
          onClose={() => setIsCanvas(false)} // Fixed prop name
          isEdit={isEdit}
          editData={editData}
          handleApicall={() => window.location.reload()}
        />
      )}
      <StudentStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, data: null })}
        onConfirm={handleStatusToggle}
        student={statusModal.data}
        loading={isUpdating}
      />
    </div>
  );
};

export default StudentManagement;
