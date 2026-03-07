import React from "react";
import { User, Bell, ChevronDown, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderComponent = ({
  title,
  showAcademicYear = false,
  academicYears = [],
  selectedYear = "",
  onYearChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full grid grid-cols-3 items-center px-6 pt-5 font-['Poppins']">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-[#282526] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex justify-center">
        {showAcademicYear && (
          <>
            {academicYears.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  Academic Year :
                </span>

                <div className="relative group flex items-center">
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="appearance-none bg-transparent pr-6 text-sm font-black text-[#08384F] outline-none cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {academicYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#08384F] transition-colors">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate(
                    "/admin/dashboard?tab=batch-management&manageYears=true",
                  )
                }
                className="flex items-center gap-2 px-4 py-1.5 bg-[#08384F]/5 text-[#08384F] border border-[#08384F]/20 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#08384F] hover:text-white transition-all active:scale-95"
              >
                <PlusCircle size={14} />
                Add Academic Year
              </button>
            )}
          </>
        )}
      </div>

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
