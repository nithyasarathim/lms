import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronDown, Loader2, PieChart as PieIcon } from "lucide-react";
import { getDepartments, getDeptWiseStats } from "../api/admin.api";

const COLORS = ["#59AAFF", "#58A08B", "#FFA73A", "#707070"];

const FacultyPieChart = () => {
  const [depts, setDepts] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getDepartments();
        // Accessing nested data based on your previous getDepartments response
        const deptList = res?.data?.departments || res || [];

        if (deptList.length > 0) {
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
    const fetchDeptStats = async () => {
      if (!selectedDeptId) return;
      setLoading(true);
      try {
        const res = await getDeptWiseStats(selectedDeptId);

        if (res.success && res.data) {
          const summary = res.data.categorySummary;

          const formattedData = [
            { name: "Deans & HODs", value: summary?.deansAndHods || 0 },
            { name: "Professors", value: summary?.professors || 0 },
            {
              name: "Assoc. & Assist.",
              value: summary?.associateAssistant || 0,
            },
            { name: "Others", value: summary?.others || 0 },
          ].filter((item) => item.value > 0);

          setChartData(formattedData);
          setTotal(res.data.total || 0);
        } else {
          setChartData([]);
          setTotal(0);
        }
      } catch (err) {
        console.error("Error fetching stats", err);
        setChartData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptStats();
  }, [selectedDeptId]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm h-full flex flex-col w-full overflow-hidden font-['Poppins']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon size={16} className="text-[#08384F]" />
          <h3 className="text-[11px] font-bold text-[#08384F] uppercase tracking-wider">
            Dept Stats
          </h3>
        </div>

        <div className="relative">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-[11px] font-bold text-[#08384F] outline-none cursor-pointer min-w-[80px]"
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
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="animate-spin text-[#08384F]" size={20} />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius="65%"
                outerRadius="95%"
                paddingAngle={2}
                dataKey="value"
                cx="40%"
                cy="50%"
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
                x="23%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[#08384F] font-bold"
                style={{ fontSize: total > 99 ? "18px" : "26px" }}
              >
                {String(total).padStart(2, "0")}
              </text>
              <text
                x="24%"
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
                  fontSize: "11px",
                  fontWeight: "700",
                  lineHeight: "24px",
                  paddingLeft: "10px",
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
  );
};

export default FacultyPieChart;
