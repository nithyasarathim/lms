import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CustomMonthDropdown = ({ selectedMonth, setSelectedMonth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoveredOption(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    setSelectedMonth(val);
    setIsOpen(false);
    setHoveredOption(null);
  };

  return (
    <div ref={dropdownRef} className="relative w-full font-['Poppins']">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 px-4 focus:outline-none bg-white flex items-center justify-between hover:bg-gray-50 text-xs w-full h-10 rounded-full"
      >
        <span className="truncate">{selectedMonth || "Month"}</span>
        <ChevronDown
          size={14}
          className={`transform transition-all ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl z-50 text-xs rounded-xl overflow-hidden">
          <div
            onClick={() => handleSelect("odd-semester")}
            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-50"
          >
            Odd Sem
          </div>
          <div
            onClick={() => handleSelect("even-semester")}
            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-50"
          >
            Even Sem
          </div>
          <div
            className="relative"
            onMouseEnter={() => setHoveredOption("month")}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <div className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
              Month <span>→</span>
            </div>
            {hoveredOption === "month" && (
              <div className="absolute left-full top-0 ml-1 max-h-[200px] overflow-auto bg-white border border-gray-200 rounded-xl shadow-xl min-w-[100px]">
                {academicMonths.map((m) => (
                  <div
                    key={m.value}
                    onClick={() => handleSelect(m.label)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMonthDropdown;
