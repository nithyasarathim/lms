import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronDown, PieChart as PieIcon } from "lucide-react";
import { getDepartments, getDeptWiseStats } from "../api/admin.api";

const COLORS = ["#59AAFF", "#58A08B", "#FFA73A", "#707070"];

let deptsCache = [];
let pieStatsCache = {}; 

const FacultyPieChart = () => {
  const [depts, setDepts] = useState(deptsCache);
  const [selectedDeptId, setSelectedDeptId] = useState(deptsCache[0]?._id || "");
  const [loading, setLoading] = useState(selectedDeptId ? !pieStatsCache[selectedDeptId] : true);
  const [chartData, setChartData] = useState(pieStatsCache[selectedDeptId]?.chartData || []);
  const [total, setTotal] = useState(pieStatsCache[selectedDeptId]?.total || 0);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getDepartments();
        const deptList = res?.data?.departments || res || [];
        if (deptList.length > 0) {
          deptsCache = deptList;
          setDepts(deptList);
          if (!selectedDeptId) setSelectedDeptId(deptList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const fetchDeptStats = async () => {
      if (!selectedDeptId) return;
      
      if (!pieStatsCache[selectedDeptId]) setLoading(true);

      try {
        const res = await getDeptWiseStats(selectedDeptId);
        if (res.success && res.data) {
          const summary = res.data.categorySummary;
          const formattedData = [
            { name: "Deans & HODs", value: summary?.deansAndHods || 0 },
            { name: "Professors", value: summary?.professors || 0 },
            { name: "Assoc. & Assist.", value: summary?.associateAssistant || 0 },
            { name: "Others", value: summary?.others || 0 },
          ].filter((item) => item.value > 0);

          pieStatsCache[selectedDeptId] = { chartData: formattedData, total: res.data.total || 0 };
          
          setChartData(formattedData);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptStats();
  }, [selectedDeptId]);

  return (
    <div className="w-full bg-white border border-gray-100 h-full rounded-2xl shadow-sm">
      <div className="bg-white rounded-2xl p-4 h-full flex mx-auto flex-col w-[350px] overflow-hidden font-['Poppins']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <PieIcon size={16} className="text-[#08384F]" />
          </div>
          <h3 className="text-[11px] font-bold text-[#08384F] uppercase tracking-wider">
            Dept Stats
          </h3>
        </div>
        <div className="relative">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-[10px] font-bold text-[#08384F] outline-none cursor-pointer min-w-[80px]"
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
        {loading && !pieStatsCache[selectedDeptId] ? (
          <div className="w-full h-full bg-gray-100/50 rounded-xl animate-pulse" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius="70%"
                outerRadius="95%"
                paddingAngle={2}
                dataKey="value"
                cx="46%"
                cy="50%"
                stroke="none"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800} 
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
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
          <div className="flex h-full items-center justify-center text-[11px] text-gray-400 font-medium">
            No faculty data found
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default FacultyPieChart;