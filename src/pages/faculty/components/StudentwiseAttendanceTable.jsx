import React from 'react';
import { Download, Eye } from 'lucide-react';

const StudentwiseAttendanceTable = ({
  variant = 'period',
  data = [],
  onViewDetails,
  onDownloadRow
}) => {
  const isSemesterView = variant === 'semester';

  return (
    <div className="mt-4 font-['Poppins']">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#08384F] text-[11px] uppercase text-white">
            <tr>
              {isSemesterView && <th className="p-4">Month</th>}
              <th className="p-4">Roll no</th>
              <th className="p-4">Student Name</th>
              <th className="p-4 text-center">Total Classes</th>
              <th className="p-4 text-center text-green-300">Present Count</th>
              <th className="p-4 text-center text-red-300">Absent Count</th>
              <th className="p-4 text-center text-blue-200">Onduty Count</th>
              <th className="p-4">Attendance Percentage</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {data.length ? (
              data.map((item, index) => (
                <tr
                  key={
                    item.monthValue
                      ? `${item.studentId}-${item.monthValue}`
                      : `${item.studentId}-${index}`
                  }
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  {isSemesterView && (
                    <td className="p-4 font-medium text-[#08384F]">{item.month}</td>
                  )}
                  <td className="p-4 font-medium text-[#08384F]">{item.rollNo}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4 text-center">{item.totalClasses}</td>
                  <td className="p-4 text-center font-semibold text-green-600">
                    {item.presentCount}
                  </td>
                  <td className="p-4 text-center font-semibold text-red-600">
                    {item.absentCount}
                  </td>
                  <td className="p-4 text-center font-semibold text-blue-600">
                    {item.onDutyCount}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#1565c0]"
                          style={{ width: `${item.attendancePercentage || 0}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#08384F]">
                        {item.attendancePercentage || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(item)}
                        className="text-[#1565c0] transition-colors hover:text-[#0d47a1]"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadRow?.(item)}
                        className="text-[#1565c0] transition-colors hover:text-[#0d47a1]"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isSemesterView ? 9 : 8}
                  className="p-6 text-center text-sm text-gray-400"
                >
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

export default StudentwiseAttendanceTable;
