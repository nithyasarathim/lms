import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getClassrooms } from "../api/faculty.api";

import ClassroomBanner1 from "../../../assets/classroombanner1.svg";
import ClassroomBanner2 from "../../../assets/classroombanner2.svg";
import ClassroomBanner3 from "../../../assets/classroombanner3.svg";

const ShimmerCard = () => (
  <div className="relative flex flex-col h-50 overflow-hidden rounded-2xl animate-pulse">
    <div
      className="absolute inset-0 bg-gradient-to-r opacity-40 from-gray-200 via-gray-300 to-gray-200 animate-shimmer"
      style={{ backgroundSize: "200% 100%" }}
    />
    <div className="relative h-full p-6 flex flex-col justify-between">
      <div className="flex justify-between">
        <div className="h-6 w-24 bg-gray-300 rounded" />
        <div className="h-4 w-16 bg-gray-300 rounded" />
      </div>
      <div>
        <div className="h-8 w-3/4 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-300 rounded" />
      </div>
    </div>
  </div>
);

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setSearchParams] = useSearchParams();

  const banners = [ClassroomBanner1, ClassroomBanner2, ClassroomBanner3];

  const toRomanYear = (semester) => {
    const year = Math.ceil((semester || 0) / 2);
    const roman = { 1: "I", 2: "II", 3: "III", 4: "IV" };
    return roman[year] || "N/A";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fdata = JSON.parse(localStorage.getItem("lms-user"));
        const facultyId = fdata?._id;
        const res = await getClassrooms(facultyId);
        setClassrooms(res?.data?.classrooms || []);
      } catch (err) {
        setError(err?.message || "Failed to fetch classrooms");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClassrooms = classrooms.filter((item) => {
    const subjectName =
      item?.subjectComponentId?.subjectId?.name?.toLowerCase() || "";
    const subjectCode =
      item?.subjectComponentId?.subjectId?.code?.toLowerCase() || "";
    return (
      subjectName.includes(searchTerm.toLowerCase()) ||
      subjectCode.includes(searchTerm.toLowerCase())
    );
  });

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 font-medium">{error}</div>
    );
  }

  return (
    <div className="p-6">
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 1.5s infinite linear;
          }
        `}
      </style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => <ShimmerCard key={i} />)
          : filteredClassrooms.map((item, index) => {
              const subject = item?.subjectComponentId?.subjectId;
              const randomBanner = banners[index % banners.length];
              const yearRoman = toRomanYear(item?.semesterNumber);
              const deptCode = item?.department?.code || "N/A";

              return (
                <div
                  key={item?._id}
                  onClick={() =>
                    setSearchParams({
                      tab: "classrooms",
                      classroomId: item._id,
                    })
                  }
                  className="group relative flex flex-col h-50 overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 cursor-pointer"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={randomBanner}
                      alt="Classroom Banner"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  <div className="relative h-full p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/50 backdrop-blur-md text-black text-xs px-2 py-1 rounded font-mono border border-white/30 uppercase tracking-wider">
                        {subject?.code || "N/A"}
                      </span>
                      <div className="flex gap-2">
                        <span className="bg-black/50 text-white text-sm font-[bahnschrift] tracking-widest font-bold px-3 py-1 rounded shadow-sm backdrop-blur-sm border border-white/10">
                          {yearRoman} {deptCode} -{" "}
                          {item?.sectionId?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-white leading-tight group-hover:translate-x-1 transition-transform duration-300">
                        {subject?.name || "Unnamed Subject"}
                      </h3>
                      <p className="text-white/70 text-xs mt-1 font-medium">
                        {item?.academicYearId?.name || "N/A"} • Sem{" "}
                        {item?.semesterNumber || "N/A"} •{" "}
                        {item?.subjectComponentId?.componentType}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && filteredClassrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-medium">
            No classrooms found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassroomList;
