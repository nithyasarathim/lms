import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderComponent from "../../shared/components/HeaderComponent";
import StudentStats, { clearStatsCache } from "./StudentStats";
import StudentPieChart, { clearPieCache } from "./StudentPieChart";
import StudentTable, { clearTableCache } from "./StudentTable";
import { getAllAcademicYears } from "../api/hod.api";

let yearsCache = null;

const ManagementShimmer = () => (
  <div className="py-8 px-6 min-h-fit space-y-6 animate-pulse">
    <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[25vh]">
      <div className="lg:w-[70%] w-full h-[200px] bg-gray-200 rounded-2xl"></div>
      <div className="lg:w-[30%] w-full h-[200px] bg-gray-200 rounded-2xl"></div>
    </div>
    <div className="w-full h-[400px] bg-gray-200 rounded-3xl"></div>
  </div>
);

const StudentManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [academicYears, setAcademicYears] = useState(yearsCache || []);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (yearsCache && yearsCache.length > 0) {
      const active = yearsCache.find((y) => y.isActive) || yearsCache[0];
      return active._id;
    }
    return "";
  });

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
  }, [selectedYear]);

  const handleRefreshData = () => {
    clearStatsCache();
    clearPieCache();
    clearTableCache();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "linear" }}
      className=" overflow-hidden font-['Poppins'] bg-gray-50/30"
    >
      <HeaderComponent
        title="Student Management"
        showAcademicYear={true}
        academicYears={academicYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <AnimatePresence mode="wait">
        {!selectedYear ? (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ManagementShimmer />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className=" py-4 px-6 min-h-fit space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[25vh]">
              <div className="lg:w-[70%] w-full flex">
                <StudentStats
                  key={`stats-${selectedYear}-${refreshKey}`}
                  academicYearId={selectedYear}
                />
              </div>
              <div className="lg:w-[30%] w-full flex">
                <StudentPieChart
                  key={`pie-${selectedYear}-${refreshKey}`}
                  academicYearId={selectedYear}
                />
              </div>
            </div>

            <div className="lg:w-[100%] w-full">
              <StudentTable
                key={`table-${selectedYear}-${refreshKey}`}
                academicYearId={selectedYear}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentManagement;
