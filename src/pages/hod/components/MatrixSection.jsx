import React from "react";
import { PlusCircle, User } from "lucide-react";

const MatrixSection = ({
  title,
  data,
  isAdditional = false,
  additionalHours = [],
  facultyVenues,
  allAvailableFaculties,
  onVenueChange,
  onAdditionalVenueChange,
  onAddAdditional,
}) => (
  <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center px-4 justify-between bg-slate-50/80 py-4 border-b border-slate-200">
      <h3 className="text-xs font-black text-[#08384F] uppercase tracking-[2px]">
        {title}
      </h3>
      {isAdditional && (
        <button
          onClick={onAddAdditional}
          className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          <PlusCircle size={14} /> ADD ROW
        </button>
      )}
    </div>
    <table className="w-full text-left border-collapse">
      <thead className="bg-white text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
        <tr>
          <th className="p-4 border-r border-slate-100">Short Name</th>
          {!isAdditional && (
            <th className="p-4 border-r border-slate-100">Code</th>
          )}
          <th className="p-4 border-r border-slate-100">Course Title</th>
          <th className="p-4 border-r border-slate-100">Faculty Incharge</th>
          <th className="p-4 border-r border-slate-100">Venue</th>
          <th className="p-4 text-center border-r border-slate-100">
            Category
          </th>
          <th className="p-4 text-center border-r border-slate-100">Credits</th>
          <th className="p-4 text-center">Hours</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {isAdditional ? (
          additionalHours.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="p-4 text-center text-[12px] text-slate-300 italic"
              >
                No additional hours configured
              </td>
            </tr>
          ) : (
            additionalHours.map((ah, idx) => (
              <tr key={ah._id || idx} className="hover:bg-slate-50/50 text-sm">
                <td className="p-4 font-bold text-[#08384F] border-r border-slate-100">
                  {ah.shortName}
                </td>
                {!isAdditional && (
                  <td className="p-4 font-mono text-slate-300 border-r border-slate-100 text-center">
                    -
                  </td>
                )}
                <td className="p-4 font-bold text-slate-700 border-r border-slate-100">
                  {ah.name}
                </td>
                <td className="p-4 text-slate-600 font-medium border-r border-slate-100">
                  <div className="flex flex-col gap-1">
                    {ah.facultyIds?.length > 0 ? (
                      ah.facultyIds.map((f, fi) => {
                        let name = "";
                        if (typeof f === "object" && f !== null) {
                          name =
                            `${f.salutation || ""} ${f.fullName || f.lastName || ""}`.trim();
                        } else {
                          const found = allAvailableFaculties?.find(
                            (fac) => fac._id === f,
                          );
                          name = found
                            ? `${found.salutation || ""} ${found.fullName || found.lastName || ""}`.trim()
                            : "Unknown";
                        }
                        return (
                          <div key={fi} className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" /> {name}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-slate-300 italic text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 border-r border-slate-100 w-48">
                  <input
                    value={ah.venue || ""}
                    onChange={(e) =>
                      onAdditionalVenueChange(ah._id, e.target.value)
                    }
                    className="w-full bg-white px-3 py-1.5 rounded border border-slate-200 text-xs font-bold focus:border-[#08384F] outline-none"
                  />
                </td>
                <td className="p-4 text-center font-black text-slate-400 border-r border-slate-100">
                  Dynamic
                </td>
                <td className="p-4 text-center text-slate-400 border-r border-slate-100">
                  -
                </td>
                <td className="p-4 text-center font-bold text-[#08384F]">
                  {ah.hours || 1}
                </td>
              </tr>
            ))
          )
        ) : data.length === 0 ? (
          <tr>
            <td
              colSpan="8"
              className="p-4 text-center text-[12px] text-slate-300 italic"
            >
              No courses in this category
            </td>
          </tr>
        ) : (
          data.map((course) =>
            course.items.map((item, iIdx) => (
              <tr
                key={`${course.code}-${item.id || iIdx}`}
                className="hover:bg-slate-50/50 text-sm"
              >
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 font-bold text-[#08384F] border-r border-slate-200"
                  >
                    {course.short}
                  </td>
                )}
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 font-mono font-bold text-[#0B56A4] border-r border-slate-200"
                  >
                    {course.code}
                  </td>
                )}
                <td className="p-4 font-bold text-slate-700 border-r border-slate-100">
                  {item.title}
                </td>
                <td className="p-4 text-slate-600 font-medium border-r border-slate-100">
                  <div className="flex flex-col gap-1">
                    {item.faculties?.length > 0 ? (
                      item.faculties.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" /> {f}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-300 italic text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 border-r border-slate-100 w-48">
                  <input
                    value={facultyVenues[item.id] || ""}
                    onChange={(e) => onVenueChange(item.id, e.target.value)}
                    className="w-full bg-white px-3 py-1.5 rounded border border-slate-200 text-xs font-bold focus:border-[#08384F] outline-none"
                  />
                </td>
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 text-center font-black text-slate-400 border-r border-slate-200"
                  >
                    {course.category}
                  </td>
                )}
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 text-center font-bold text-[#08384F] border-r border-slate-200"
                  >
                    {course.credits || "-"}
                  </td>
                )}
                <td className="p-4 text-center font-bold text-[#08384F]">
                  {item.hrs || "-"}
                </td>
              </tr>
            )),
          )
        )}
      </tbody>
    </table>
  </div>
);

export default MatrixSection;
