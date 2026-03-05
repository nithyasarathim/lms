import React, { useState, useEffect } from "react";
import {
  Users,
  Loader2,
  GraduationCap,
  Crown,
  UserCheck,
  UserCog,
} from "lucide-react";
import { getFacultyDashboardStats } from "../api/admin.api";

const FacultyStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    deansAndHods: 0,
    professors: 0,
    associateAssistant: 0,
    others: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getFacultyDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50/50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 min-h-[250px]">
        <Loader2 className="animate-spin text-[#08384F]" size={32} />
      </div>
    );
  }

  return (
    <section className="w-full h-full font-['Poppins']">
      <section className="grid grid-cols-20 gap-4 h-full">
        <div className="col-span-6 flex flex-col justify-center bg-[#DED9F9] rounded-2xl py-6 px-6 transition-transform hover:scale-[1.01]">
          <div className="space-y-4 text-[#282526]">
            <div className="w-12 h-12 bg-[#927DFF] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#927DFF]/20">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                Total Faculty
              </h2>
              <p className="text-5xl font-extrabold text-[#08384F]">
                {stats.totalFaculty}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-14 grid grid-cols-2 gap-4">
          <div className="bg-[#D9EBFE] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-[#59AAFF] rounded-xl flex items-center justify-center shrink-0">
              <Crown size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase">
                Deans & HODs
              </h3>
              <p className="text-2xl font-bold text-[#08384F]">
                {stats.deansAndHods}
              </p>
            </div>
          </div>

          <div className="bg-[#D2F8ED] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-[#58A08B] rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase">
                Professors
              </h3>
              <p className="text-2xl font-bold text-[#08384F]">
                {stats.professors}
              </p>
            </div>
          </div>

          <div className="bg-[#FFEED9] rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-[#FFA73A] rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase">
                Assoc. & Assist.
              </h3>
              <p className="text-2xl font-bold text-[#08384F]">
                {stats.associateAssistant}
              </p>
            </div>
          </div>

          <div className="bg-[#F5F5F5] border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-[#707070] rounded-xl flex items-center justify-center shrink-0">
              <UserCog size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">
                Others
              </h3>
              <p className="text-2xl font-bold text-[#08384F]">
                {stats.others}
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FacultyStats;
