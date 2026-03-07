import React, { useState, useEffect } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import StudentStats from "./StudentStats";
import StudentPieChart from "./StudentPieChart";
import StudentTable from "./StudentTable";
import AddStudentModal from "../modal/AddStudentModal";
import StudentStatusModal from "../modal/StudentStatusModal";
import { updateStudent, getAllAcademicYears } from "../api/admin.api";
import toast from "react-hot-toast";

let yearsCache = null;

const StudentManagement = () => {
  const [isCanvas, setIsCanvas] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [academicYears, setAcademicYears] = useState(yearsCache || []);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchYears = async () => {
      if (yearsCache) {
        setAcademicYears(yearsCache);
        const active = yearsCache.find((y) => y.isActive) || yearsCache[0];
        if (active && !selectedYear) setSelectedYear(active._id);
        return;
      }
      try {
        const res = await getAllAcademicYears();
        if (res.success && res.data?.academicYears) {
          const years = res.data.academicYears;
          yearsCache = years;
          setAcademicYears(years);
          const active = years.find((y) => y.isActive) || years[0];
          if (active && !selectedYear) setSelectedYear(active._id);
        }
      } catch (err) {
        console.error("Failed to load academic years", err);
      }
    };
    fetchYears();
  }, []);

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
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className=" overflow-hidden font-['Poppins'] bg-gray-50/30">
      <HeaderComponent
        title="Student Management"
        showAcademicYear={true}
        academicYears={academicYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      <div className=" py-8 px-6 min-h-screen space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[25vh]">
          <div className="lg:w-[70%] w-full flex">
            <StudentStats
              key={`stats-${refreshKey}`}
              academicYearId={selectedYear}
            />
          </div>
          <div className="lg:w-[30%] w-full flex">
            <StudentPieChart
              key={`pie-${refreshKey}`}
              academicYearId={selectedYear}
            />
          </div>
        </div>
        <div className="lg:w-[100%] w-full">
          <StudentTable
            key={`table-${refreshKey}`}
            academicYearId={selectedYear}
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
          academicYearId={selectedYear}
          onClose={() => setIsCanvas(false)}
          isEdit={isEdit}
          editData={editData}
          handleApicall={() => setRefreshKey((prev) => prev + 1)}
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
