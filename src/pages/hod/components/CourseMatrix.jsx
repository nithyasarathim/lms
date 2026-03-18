import React from "react";
import {
  PlusCircle,
  User,
  Trash2,
  BookOpen,
  AlertCircle,
  Edit3,
} from "lucide-react";

const getCategoryShort = (category) => {
  if (!category) return "-";
  return category
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const formatFacultyName = (faculty) => {
  if (!faculty) return "";
    console.log(faculty);
  const salutation = faculty.salutation || "";
  const fullName =
    faculty.fullName ||
    `${faculty.firstName || ""} ${faculty.lastName || ""}`.trim();
  const designation = faculty.designation || "";
  const deptCode = faculty.departmentId?.code || "";

  return (
    <span>
      <span className="font-bold text-[#08384F]">
        {salutation} {fullName}
      </span>
      {designation && deptCode && (
        <span className="text-slate-500 font-medium">
          , {designation} / {deptCode}
        </span>
      )}
    </span>
  );
};

const MatrixShimmer = () => (
  <div className="max-w-[1400px] mx-auto pb-10 space-y-8 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white"
      >
        <div className="h-14 bg-slate-100 border-b border-slate-200 flex items-center px-6">
          <div className="h-4 w-48 bg-slate-300 rounded"></div>
        </div>
        <div className="p-4">
          <div className="flex gap-4 border-b border-slate-100 pb-3 mb-3">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-40 bg-slate-200 rounded"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex gap-4 py-2">
              <div className="h-6 w-24 bg-slate-100 rounded"></div>
              <div className="h-6 w-32 bg-slate-100 rounded"></div>
              <div className="h-6 w-48 bg-slate-100 rounded"></div>
              <div className="h-6 w-40 bg-slate-100 rounded"></div>
              <div className="h-6 w-20 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const NoSectionsMessage = () => (
  <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm max-w-[620px] mx-auto my-12 text-center">
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-[#08384F]/10 rounded-2xl flex items-center justify-center">
        <AlertCircle className="text-[#08384F]" size={38} />
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-[#08384F]/10"></div>
    </div>

    <h3 className="text-xl font-bold text-[#08384F]">No Sections Available</h3>

    <p className="text-slate-500 text-sm mt-2">
      Please select a section to view the course matrix.
    </p>

    <div className="mt-6 w-16 h-[2px] bg-[#08384F]/20 rounded-full"></div>
  </div>
);

const NoDataMessage = () => (
  <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm max-w-[620px] mx-auto my-12 text-center">
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-[#08384F]/10 rounded-2xl flex items-center justify-center">
        <BookOpen className="text-[#08384F]" size={38} />
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-[#08384F]/10"></div>
    </div>

    <h3 className="text-xl font-bold text-[#08384F]">No Courses Found</h3>

    <p className="text-slate-500 text-sm mt-2">
      To continue, please request the administrator to complete the setup.
    </p>

    <div className="flex flex-col gap-2 mt-5 text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#08384F]/10 text-[#08384F] text-xs font-bold">
          1
        </span>
        Map subjects to this section
      </div>

      <div className="flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#08384F]/10 text-[#08384F] text-xs font-bold">
          2
        </span>
        Assign faculties to the subjects
      </div>
    </div>

    <div className="mt-6 w-16 h-[2px] bg-[#08384F]/20 rounded-full"></div>
  </div>
);

const MatrixSection = ({
  title,
  data = [],
  isAdditional = false,
  additionalHours = [],
  facultyVenues,
  allAvailableFaculties,
  onVenueChange,
  onAdditionalVenueChange,
  onAddAdditional,
  onDeleteAdditional,
  onEditAdditional,
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
      <thead className="bg-white text-[11px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200">
        <tr>
          <th className="p-4 border-r border-slate-100 w-32">Short Name</th>
          {!isAdditional && (
            <th className="p-4 border-r border-slate-100 w-36">Code</th>
          )}
          <th className="p-4 border-r border-slate-100">Course Title</th>
          <th className="p-4 border-r border-slate-100 w-72">
            Faculty Incharge
          </th>
          <th className="p-4 border-r border-slate-100 w-32">Venue</th>
          <th className="p-4 text-center border-r border-slate-100 w-20">
            Category
          </th>
          <th className="p-4 text-center border-r border-slate-100 w-20">
            Credits
          </th>
          <th className="p-4 text-center w-20">Hours</th>
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
                <td className="p-4 font-bold text-slate-700 border-r border-slate-100">
                  <div className="flex items-center justify-between">
                    {ah.name}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditAdditional && onEditAdditional(ah)}
                        className="text-blue-400 hover:text-blue-600 ml-2"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() =>
                          onDeleteAdditional && onDeleteAdditional(ah._id)
                        }
                        className="text-red-400 hover:text-red-600 ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600 font-medium border-r border-slate-100">
                  <div className="flex flex-col gap-1">
                    {ah.facultyIds?.length > 0 ? (
                      ah.facultyIds.map((f, fi) => {
                        let facultyObj = f;
                        if (typeof f === "string") {
                          facultyObj = allAvailableFaculties?.find(
                            (fac) => fac._id === f,
                          );
                        }
                        return facultyObj ? (
                          <div
                            key={fi}
                            className="flex items-start gap-1.5 text-xs"
                          >
                            <span className="text-xs">
                              {formatFacultyName(facultyObj)}
                            </span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <span className="text-slate-300 italic text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 border-r border-slate-100 w-32">
                  <input
                    value={ah.venue || ""}
                    onChange={(e) =>
                      onAdditionalVenueChange(ah._id, e.target.value)
                    }
                    className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs font-bold focus:border-[#08384F] outline-none placeholder:text-slate-300 text-center"
                    placeholder={ah.venue ? "Enter venue" : "No venue"}
                  />
                </td>
                <td className="p-4 text-center text-slate-400 border-r border-slate-100">
                  -
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
                    className="p-4 font-bold text-center text-[#08384F] border-r border-slate-200"
                  >
                    {course.short}
                  </td>
                )}
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 font-mono text-center font-bold text-[#0B56A4] border-r border-slate-200"
                  >
                    {course.code}
                  </td>
                )}
                <td className="p-4 font-bold text-[12px] text-slate-700 border-r border-slate-100">
                  {item.title}
                </td>
                <td className="p-4 text-slate-600 text-xs font-medium border-r border-slate-100">
                  <div className="flex flex-col gap-1">
                    {item.facultiesData?.length > 0 ? (
                      item.facultiesData.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-1.5">
                          
                          <span className="text-xs whitespace-normal break-words">
                            {formatFacultyName(f)}
                          </span>
                        </div>
                      ))
                    ) : item.faculties?.length > 0 ? (
                      item.faculties.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-1.5">
                          <span className="text-xs whitespace-normal break-words">
                            {f}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-300 italic text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 border-r border-slate-100 w-32">
                  <input
                    value={facultyVenues[item.id] || ""}
                    onChange={(e) => onVenueChange(item.id, e.target.value)}
                    className="w-full bg-white text-center px-2 py-1 rounded border border-slate-200 text-xs font-bold focus:border-[#08384F] outline-none placeholder:text-slate-300"
                    placeholder={facultyVenues[item.id] ? "Enter venue" : "N/A"}
                  />
                </td>
                {iIdx === 0 && (
                  <td
                    rowSpan={course.items.length}
                    className="p-4 text-center font-black text-slate-400 border-r border-slate-200"
                  >
                    {getCategoryShort(course.category)}
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

const CourseMatrix = ({
  matrixData,
  facultyVenues,
  onVenueChange,
  additionalHours,
  onAdditionalVenueChange,
  allAvailableFaculties,
  onAddAdditional,
  onEditAdditional,
  onDeleteAdditional,
  isLoading,
  hasSelectedSection = true,
}) => {
  const handleAdditionalChange = (id, field, value) => {
    const target = additionalHours.find((a) => a._id === id);
    if (!target) return;
    const updated = { ...target, [field]: value };
    onEditAdditional(updated);
  };

  const hasData =
    Object.values(matrixData).some((arr) => arr.length > 0) ||
    (additionalHours && additionalHours.length > 0);

  if (isLoading) {
    return <MatrixShimmer />;
  }

  if (!hasSelectedSection) {
    return <NoSectionsMessage />;
  }

  if (!hasData) {
    return <NoDataMessage />;
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <MatrixSection
        title="THEORY COURSES"
        data={matrixData.theory}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="THEORY CUM PRACTICAL COURSES"
        data={matrixData.theoryCumLab}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="THEORY WITH PRACTICAL AND PROJECT COURSES"
        data={matrixData.theoryLabProject}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="PRACTICAL COURSES"
        data={matrixData.practical}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="PROJECT WORK"
        data={matrixData.project}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="ADDITIONAL HOURS"
        data={matrixData.additional}
        isAdditional
        additionalHours={additionalHours}
        onAdditionalVenueChange={onAdditionalVenueChange}
        onAdditionalFieldChange={handleAdditionalChange}
        allAvailableFaculties={allAvailableFaculties}
        onAddAdditional={onAddAdditional}
        onDeleteAdditional={onDeleteAdditional}
        onEditAdditional={onEditAdditional}
      />
    </div>
  );
};

export default CourseMatrix;
