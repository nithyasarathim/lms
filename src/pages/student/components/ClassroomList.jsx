import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Assets
import ClassroomBanner1 from '../../../assets/classroombanner1.svg';
import ClassroomBanner2 from '../../../assets/classroombanner2.svg';
import ClassroomBanner3 from '../../../assets/classroombanner3.svg';

// Dummy Data
const DUMMY_CLASSROOMS = [
  {
    _id: "1",
    semesterNumber: 5,
    subjectId: { name: "Machine Learning", code: "CS801" },
    department: { code: "CSE" },
    sectionId: { name: "A" },
    academicYearId: { name: "2023-2024" }
  },
  {
    _id: "2",
    semesterNumber: 3,
    subjectId: { name: "Data Structures", code: "CS302" },
    department: { code: "CSE" },
    sectionId: { name: "B" },
    academicYearId: { name: "2023-2024" }
  },
  {
    _id: "3",
    semesterNumber: 7,
    subjectId: { name: "Digital Signal Processing", code: "EC705" },
    department: { code: "ECE" },
    sectionId: { name: "A" },
    academicYearId: { name: "2023-2024" }
  },
  {
    _id: "4",
    semesterNumber: 1,
    subjectId: { name: "Engineering Mathematics", code: "MA101" },
    department: { code: "MECH" },
    sectionId: { name: "C" },
    academicYearId: { name: "2024-2025" }
  }
];

const ShimmerCard = () => (
  <div className="relative flex flex-col h-50 overflow-hidden rounded-2xl animate-pulse">
    <div
      className="absolute inset-0 bg-gradient-to-r opacity-40 from-gray-200 via-gray-300 to-gray-200 animate-shimmer"
      style={{ backgroundSize: '200% 100%' }}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const banners = [ClassroomBanner1, ClassroomBanner2, ClassroomBanner3];

  const toRomanYear = (semester) => {
    const year = Math.ceil((semester || 0) / 2);
    const roman = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
    return roman[year] || 'N/A';
  };

  useEffect(() => {
    // Simulate a 1-second delay to show the shimmer effect
    const timer = setTimeout(() => {
      setClassrooms(DUMMY_CLASSROOMS);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredClassrooms = classrooms.filter((item) => {
    const subjectName = item?.subjectId?.name?.toLowerCase() || '';
    const subjectCode = item?.subjectId?.code?.toLowerCase() || '';
    return (
      subjectName.includes(searchTerm.toLowerCase()) ||
      subjectCode.includes(searchTerm.toLowerCase())
    );
  });

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

      {/* Optional: Add a search bar here if needed */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {loading
          ? Array(4).fill(0).map((_, i) => <ShimmerCard key={i} />)
          : filteredClassrooms.map((item, index) => {
              const subject = item?.subjectId;
              const randomBanner = banners[index % banners.length];
              const yearRoman = toRomanYear(item?.semesterNumber);
              const deptCode = item?.department?.code || 'N/A';

              return (
                <div
                  key={item?._id}
                  onClick={() =>
                    setSearchParams({
                      tab: 'classrooms',
                      classroomId: item._id
                    })
                  }
                  className="group relative flex flex-col h-50 overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 cursor-pointer"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={randomBanner}
                      alt="Classroom Banner"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>

                  <div className="relative h-full p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-mono border border-white/30 uppercase tracking-widest">
                        {subject?.code || 'N/A'}
                      </span>
                      <div className="flex gap-2">
                        <span className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded shadow-sm backdrop-blur-md border border-white/10 tracking-tight">
                          {yearRoman} {deptCode} - {item?.sectionId?.name || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight group-hover:translate-x-1 transition-transform duration-300">
                        {subject?.name || 'Unnamed Subject'}
                      </h3>
                      <p className="text-white/70 text-xs mt-1 font-medium tracking-wide">
                        {item?.academicYearId?.name || 'N/A'} • SEM {item?.semesterNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && filteredClassrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-medium">No classrooms found.</p>
        </div>
      )}
    </div>
  );
};

export default ClassroomList;