import React, { useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import FacultyStats from "./FacultyStats";
import FacultyPieChart from "./FacultyPieChart";
import FacultyTable from "./FacultyTable";
import AddFacultyModal from "../modal/AddFacultyModal";

const FacultyManagement = () => {
  const [isCanvas, setIsCanvas] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50/30 font-['Poppins']">
      <HeaderComponent title="Faculty Management" />

      <div className="px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[45vh]">
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
          />
        </div>
      </div>

      {isCanvas && (
        <AddFacultyModal
          setIsCanvas={setIsCanvas}
          isEdit={isEdit}
          editData={editData}
          setIsEdit={setIsEdit}
        />
      )}
    </div>
  );
};

export default FacultyManagement;
