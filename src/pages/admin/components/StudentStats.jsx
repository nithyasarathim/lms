import React, { useState, useEffect } from "react";
import { Users, BookOpen, School, GraduationCap, Award } from "lucide-react";
import { getStudentStats } from "../api/admin.api";

let globalStudentCache = {};

const StudentStats = ({ academicYearId }) => {
  const cacheKey = academicYearId || "default";
  const [loading, setLoading] = useState(!globalStudentCache[cacheKey]);
  const [stats, setStats] = useState(
    globalStudentCache[cacheKey] || {
      totalStudents: 0,
      yearWise: {
        firstYear: 0,
        secondYear: 0,
        thirdYear: 0,
        fourthYear: 0,
      },
    },
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!academicYearId) return;
      if (globalStudentCache[cacheKey]) {
        setStats(globalStudentCache[cacheKey]);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const res = await getStudentStats(academicYearId);
        if (res.success) {
          globalStudentCache[cacheKey] = res.data;
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [academicYearId, cacheKey]);

  const Container = ({ children }) => (
    <section className="w-full h-[185px] font-['Poppins']">
      <section className="grid grid-cols-20 gap-4 h-full">{children}</section>
    </section>
  );

  if (loading && !globalStudentCache[cacheKey]) {
    return (
      <Container>
        <div className="col-span-6 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="col-span-14 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="col-span-6 relative overflow-hidden flex flex-col justify-center bg-gradient-to-br from-[#DED9F9] to-[#F2F0FF] rounded-2xl py-6 px-8 transition-all hover:shadow-lg group">
        <div className="relative z-10 space-y-5">
          <div className="w-14 h-14 bg-white text-[#927DFF] rounded-2xl flex items-center justify-center shadow-sm border border-[#927DFF]/10">
            <Users size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold text-[#6B6684] uppercase tracking-[0.1em]">
              Total Students
            </h2>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black text-[#08384F] tracking-tight leading-none">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-14 grid grid-cols-2 gap-4">
        <div className="bg-[#D9EBFE] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-[#59AAFF] rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase leading-none mb-1">
              1st Year
            </h3>
            <p className="text-2xl font-bold text-[#08384F] leading-none">
              {stats.yearWise.firstYear}
            </p>
          </div>
        </div>
        <div className="bg-[#D2F8ED] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-[#58A08B] rounded-xl flex items-center justify-center shrink-0">
            <School size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase leading-none mb-1">
              2nd Year
            </h3>
            <p className="text-2xl font-bold text-[#08384F] leading-none">
              {stats.yearWise.secondYear}
            </p>
          </div>
        </div>
        <div className="bg-[#FFEED9] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-[#FFA73A] rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase leading-none mb-1">
              3rd Year
            </h3>
            <p className="text-2xl font-bold text-[#08384F] leading-none">
              {stats.yearWise.thirdYear}
            </p>
          </div>
        </div>
        <div className="bg-[#F5F5F5] border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-[#707070] rounded-xl flex items-center justify-center shrink-0">
            <Award size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase leading-none mb-1">
              4th Year
            </h3>
            <p className="text-2xl font-bold text-[#08384F] leading-none">
              {stats.yearWise.fourthYear}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export const clearStatsCache = () => {
  globalStudentCache = {};
};

export default StudentStats;
