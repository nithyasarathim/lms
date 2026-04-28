import React from "react";
import { Eye, Download } from "lucide-react";

const defaultData = [
  {
    date: "15/05/2026",
    classHour: "1st Hour",
    total: 50,
    present: 15,
    absent: 15,
    onduty: 15,
    percentage: 90,
  },
  {
    date: "16/05/2026",
    classHour: "2nd Hour",
    total: 50,
    present: 15,
    absent: 15,
    onduty: 15,
    percentage: 70,
  },
];

const MonthlyAttendanceTable = ({ data = defaultData }) => {
  return (
    <div className="mx-6 mt-6 font-['Poppins']">
      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#08384F] text-white text-[11px] uppercase">
            <tr>
              <th className="p-4 border-r border-[#0c4a68]">S.No</th>
              <th className="p-4 border-r border-[#0c4a68]">Date</th>
              <th className="p-4 border-r border-[#0c4a68]">Hour</th>
              <th className="p-4 border-r border-[#0c4a68] text-center">
                Total
              </th>
              <th className="p-4 border-r border-[#0c4a68] text-center text-green-300">
                Present
              </th>
              <th className="p-4 border-r border-[#0c4a68] text-center text-red-300">
                Absent
              </th>
              <th className="p-4 border-r border-[#0c4a68]">Percentage</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={`${item.date}-${item.classHour}-${index}`}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td className="p-4 border-r border-gray-100 text-center text-gray-400 font-bold">
                    {index + 1}
                  </td>
                  <td className="p-4 border-r border-gray-100 font-semibold text-[#08384F]">
                    {item.date}
                  </td>
                  <td className="p-4 border-r border-gray-100 text-gray-600">
                    {item.classHour}
                  </td>
                  <td className="p-4 border-r border-gray-100 text-center">
                    {item.total}
                  </td>
                  <td className="p-4 border-r border-gray-100 text-center text-green-600 font-bold">
                    {item.present}
                  </td>
                  <td className="p-4 border-r border-gray-100 text-center text-red-600 font-bold">
                    {item.absent}
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-100">
                        <div
                          className="h-full bg-[#08384F]"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-[#08384F]">
                        {item.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="text-[#08384f] hover:text-black transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-400">
                  No attendance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyAttendanceTable;
