import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieIcon, Ban } from "lucide-react";
import { getStudentByDeptStats } from "../api/hod.api";

const COLORS = ["#59AAFF", "#58A08B", "#FFA73A", "#707070"];
let pieStatsCache = {};

const StudentPieChart = ({ academicYearId }) => {
  const cacheKey = academicYearId || "default";
  const [loading, setLoading] = useState(!pieStatsCache[cacheKey]);
  const [chartData, setChartData] = useState(
    pieStatsCache[cacheKey]?.chartData || [],
  );
  const [total, setTotal] = useState(pieStatsCache[cacheKey]?.total || 0);
  const user = JSON.parse(localStorage.getItem("lms-user") || "{}");
  const deptId = user.departmentId;

  useEffect(() => {
    const fetchStats = async () => {
      if (!academicYearId) return;
      if (pieStatsCache[cacheKey]) {
        setChartData(pieStatsCache[cacheKey].chartData);
        setTotal(pieStatsCache[cacheKey].total);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const res = await getStudentByDeptStats(academicYearId, deptId);
        if (res.success && res.data?.departments?.length > 0) {
          const deptData = res.data.departments[0];
          const formattedData = [
            { name: "1st Year", value: deptData.yearWise?.firstYear || 0 },
            { name: "2nd Year", value: deptData.yearWise?.secondYear || 0 },
            { name: "3rd Year", value: deptData.yearWise?.thirdYear || 0 },
            { name: "4th Year", value: deptData.yearWise?.fourthYear || 0 },
          ];

          const result = {
            chartData: formattedData,
            total: deptData.totalStudents || 0,
          };

          pieStatsCache[cacheKey] = result;
          setChartData(formattedData);
          setTotal(result.total);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
        setChartData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [academicYearId, cacheKey]);

  const hasData = total > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm w-full">
      <div className=" p-4 h-full flex flex-col w-[340px] mx-auto overflow-hidden font-['Poppins']">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <PieIcon size={16} className="text-[#08384F]" />
            </div>
            <h3 className="text-[11px] font-bold text-[#08384F] uppercase tracking-wider">
              Year Distribution
            </h3>
          </div>
        </div>
        <div className="flex-1 relative">
          {loading && !pieStatsCache[cacheKey] ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse" />
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius="65%"
                  outerRadius="95%"
                  paddingAngle={2}
                  dataKey="value"
                  cx="45%"
                  cy="50%"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value > 0
                          ? COLORS[index % COLORS.length]
                          : "#d7d7d7ff"
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <text
                  x="25%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[#08384F] font-bold"
                  style={{ fontSize: total > 99 ? "18px" : "26px" }}
                >
                  {String(total).padStart(2, "0")}
                </text>
                <text
                  x="25%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 font-bold uppercase tracking-widest"
                  style={{ fontSize: "10px" }}
                >
                  Total
                </text>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "10px",
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    width: "45%",
                    fontSize: "11px",
                    fontWeight: "700",
                    lineHeight: "24px",
                    paddingLeft: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col h-full items-center justify-center gap-2">
              <div className="p-3 bg-gray-50 rounded-full text-gray-300">
                <Ban size={24} />
              </div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                No Students Found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const clearPieCache = () => {
  pieStatsCache = {};
};

export default StudentPieChart;
