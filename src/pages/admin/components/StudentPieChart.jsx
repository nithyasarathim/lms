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

const COLORS = ["#59AAFF", "#58A08B", "#FFA73A", "#707070"];

const DUMMY_DEPTS = [
  { _id: "1", code: "CSE", name: "Computer Science" },
  { _id: "2", code: "ECE", name: "Electronics" },
  { _id: "3", code: "MECH", name: "Mechanical" },
];

const DUMMY_STATS = {
  1: {
    total: 450,
    yearWise: {
      firstYear: 120,
      secondYear: 110,
      thirdYear: 120,
      fourthYear: 100,
    },
  },
  2: {
    total: 320,
    yearWise: { firstYear: 80, secondYear: 90, thirdYear: 75, fourthYear: 75 },
  },
  3: {
    total: 280,
    yearWise: { firstYear: 70, secondYear: 70, thirdYear: 70, fourthYear: 70 },
  },
};

const StudentPieChart = () => {
  const [depts, setDepts] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setDepts(DUMMY_DEPTS);
    setSelectedDeptId(DUMMY_DEPTS[0]._id);
  }, []);

  useEffect(() => {
    if (!selectedDeptId) return;
    setLoading(true);
    const timer = setTimeout(() => {
      const res = DUMMY_STATS[selectedDeptId];
      if (res) {
        const { yearWise } = res;
        const formattedData = [
          { name: "1st Year", value: yearWise.firstYear },
          { name: "2nd Year", value: yearWise.secondYear },
          { name: "3rd Year", value: yearWise.thirdYear },
          { name: "4th Year", value: yearWise.fourthYear },
        ].filter((item) => item.value > 0);
        setChartData(formattedData);
        setTotal(res.total);
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedDeptId]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm h-full flex flex-col w-full overflow-hidden font-['Poppins']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg">
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
        {loading ? (
          <div className="w-full h-full bg-gray-100/50 rounded-xl animate-pulse" />
        ) : chartData.length > 0 ? (
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
            No student data found
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPieChart;
