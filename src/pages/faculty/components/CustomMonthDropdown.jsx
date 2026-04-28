import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const academicMonths = [
  { label: "JUN", value: "june" },
  { label: "JUL", value: "july" },
  { label: "AUG", value: "august" },
  { label: "SEP", value: "september" },
  { label: "OCT", value: "october" },
  { label: "NOV", value: "november" },
  { label: "DEC", value: "december" },
  { label: "JAN", value: "january" },
  { label: "FEB", value: "february" },
  { label: "MAR", value: "march" },
  { label: "APR", value: "april" },
  { label: "MAY", value: "may" },
];

const CustomMonthDropdown = ({
  selectedMonth,
  setSelectedMonth,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  setFilterMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSemesterSelect = (label, mode) => {
    setSelectedMonth(label);
    setFilterMode?.(mode);
    setIsOpen(false);
    setActiveSubMenu(null);
  };

  const handleMonthSelect = (label) => {
    setSelectedMonth(label);
    setFilterMode?.("month");
    setIsOpen(false);
    setActiveSubMenu(null);
  };

  const getDisplayText = () => {
    if (selectedMonth === "date-range") {
      if (dateFrom && dateTo) return `${dateFrom} - ${dateTo}`;
      return "Custom Range";
    }
    return selectedMonth ? `Filter: ${selectedMonth}` : "Select Period";
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block w-full max-w-[240px] font-['Poppins']"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 px-4 focus:outline-none bg-white flex items-center justify-between hover:bg-gray-50 text-xs w-full h-10 rounded-full transition-colors"
      >
        <span className="truncate font-medium text-gray-700">
          {getDisplayText()}
        </span>
        <ChevronDown
          size={14}
          className={`ml-2 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl z-50 text-xs rounded-xl min-w-[180px] py-1 animate-in fade-in zoom-in duration-150">
          <div
            onClick={() => handleSemesterSelect("Odd Semester", "semester")}
            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 font-medium text-gray-700"
          >
            Odd Semester
          </div>
          <div
            onClick={() => handleSemesterSelect("Even Semester", "semester")}
            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 font-medium text-gray-700"
          >
            Even Semester
          </div>

          <div
            className={`px-4 py-2.5 duration-300 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 transition-colors ${
              activeSubMenu === "month"
                ? "bg-[#08384F]/10 font-bold  text-[#08384F]"
                : "text-gray-700"
            }`}
            onMouseEnter={() => setActiveSubMenu("month")}
          >
            <span>Specific Month</span>
            <ChevronRight size={14} />
          </div>

          <div
            className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${
              activeSubMenu === "date"
                ? "bg-[#08384F]/10 font-bold  text-[#08384F]"
                : "text-gray-700"
            }`}
            onMouseEnter={() => setActiveSubMenu("date")}
          >
            <span>Custom Date</span>
            <ChevronRight size={14} />
          </div>

          {activeSubMenu === "month" && (
            <div
              className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[120px] max-h-[280px] overflow-y-auto py-1 animate-in slide-in-from-left-2 duration-150"
              onMouseLeave={() => setActiveSubMenu(null)}
            >
              {academicMonths.map((m) => (
                <div
                  key={m.value}
                  onClick={() => handleMonthSelect(m.label)}
                  className="px-4 py-2 hover:bg-[#08384F]/10 hover:text-[#08384F] cursor-pointer transition-colors"
                >
                  {m.label}
                </div>
              ))}
            </div>
          )}

          {activeSubMenu === "date" && (
            <div
              className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[240px] animate-in slide-in-from-left-2 duration-150"
              onMouseLeave={() => setActiveSubMenu(null)}
            >
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setSelectedMonth("date-range");
                      setFilterMode?.("date");
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F]/40 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setSelectedMonth("date-range");
                      setFilterMode?.("date");
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F]/40 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-[#08384F]/90 text-white font-semibold py-2 rounded-lg mt-1 hover:bg-[#08384F] active:scale-[0.98] transition-all shadow-md shadow-[#08384F]/10"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomMonthDropdown;
