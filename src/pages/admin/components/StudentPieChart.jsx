import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronDown, PieChart as PieIcon, Ban } from "lucide-react";
import { getDepartments, getStudentByDeptStats } from "../api/admin.api";

const COLORS = ["#59AAFF", "#58A08B", "#FFA73A", "#707070"];

let deptsCache = [];
let pieStatsCache = {};

const StudentPieChart = ({ academicYearId }) => {
  const [depts, setDepts] = useState(deptsCache);
  const [selectedDeptId, setSelectedDeptId] = useState(
    deptsCache[0]?._id || "",
  );

  const cacheKey = `${selectedDeptId}_${academicYearId}`;

  const [loading, setLoading] = useState(!pieStatsCache[cacheKey]);
  const [chartData, setChartData] = useState(
    pieStatsCache[cacheKey]?.chartData || [],
  );
  const [total, setTotal] = useState(pieStatsCache[cacheKey]?.total || 0);

  useEffect(() => {
    const fetchDepts = async () => {
      if (deptsCache.length > 0) {
        setDepts(deptsCache);
        if (!selectedDeptId) setSelectedDeptId(deptsCache[0]._id);
        return;
      }

      try {
        const res = await getDepartments();
        const deptList = res?.data?.departments || res || [];
        if (deptList.length > 0) {
          deptsCache = deptList;
          setDepts(deptList);
          setSelectedDeptId(deptList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedDeptId || !academicYearId) return;

      const key = `${selectedDeptId}_${academicYearId}`;

      if (pieStatsCache[key]) {
        setChartData(pieStatsCache[key].chartData);
        setTotal(pieStatsCache[key].total);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await getStudentByDeptStats(selectedDeptId, academicYearId);
        if (res.success && res.data) {
          const deptStats = res.data.departments?.find(
            (d) => d.departmentId === selectedDeptId,
          );

          const formattedData = [
            { name: "1st Year", value: deptStats?.yearWise?.firstYear || 0 },
            { name: "2nd Year", value: deptStats?.yearWise?.secondYear || 0 },
            { name: "3rd Year", value: deptStats?.yearWise?.thirdYear || 0 },
            { name: "4th Year", value: deptStats?.yearWise?.fourthYear || 0 },
          ];

          pieStatsCache[key] = {
            chartData: formattedData,
            total: deptStats?.totalStudents || 0,
          };

          setChartData(formattedData);
          setTotal(deptStats?.totalStudents || 0);
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
  }, [selectedDeptId, academicYearId]);

  const hasData = total > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm h-full flex flex-col w-full overflow-hidden font-['Poppins']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <PieIcon size={16} className="text-[#08384F]" />
          </div>
          <h3 className="text-[11px] font-bold text-[#08384F] uppercase tracking-wider">
            Year Distribution
          </h3>
        </div>
        <div className="relative">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="appearance-none bg-gray-100 border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-[10px] font-bold text-[#08384F] outline-none cursor-pointer min-w-[80px]"
          >
            {depts.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
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
  );
};

export default StudentPieChart;
