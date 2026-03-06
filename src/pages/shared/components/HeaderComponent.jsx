import React, { useState } from "react";
import { User, Bell, ChevronDown } from "lucide-react";

const HeaderComponent = ({ title, showAcademicYear = false, onYearChange }) => {
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    if (onYearChange) onYearChange(year);
  };

  return (
    <div className="w-full grid grid-cols-3 items-center px-6 pt-5 font-['Poppins']">
      {/* Left Section: Title */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-[#282526] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center Section: Academic Year */}
      <div className="flex justify-center">
        {showAcademicYear && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Academic Year :
            </span>

            <div className="relative group flex items-center">
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="appearance-none bg-transparent pr-6 text-sm font-black text-[#08384F] outline-none cursor-pointer hover:opacity-80 transition-opacity"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#08384F] transition-colors">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Icons */}
      <div className="flex items-center justify-end gap-4">
        <button className="p-2.5 rounded-xl bg-white text-[#08384F] border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center">
          <Bell size={20} />
        </button>

        <div className="p-2.5 rounded-xl bg-white text-[#08384F] border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center">
          <User size={20} />
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
