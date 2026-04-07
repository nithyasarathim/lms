import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
} from "lucide-react";

/**
 * ATTENDANCE SCHEMA DESIGN (Suggestion for Backend)
 * * ClassroomAttendance {
 * _id: ObjectId,
 * classroomId: ObjectId (Ref Classroom),
 * date: Date,
 * records: [
 * {
 * studentId: ObjectId (Ref User),
 * status: Enum ["present", "absent", "od"],
 * markedBy: ObjectId (Ref User/Faculty),
 * updatedAt: Timestamp
 * }
 * ],
 * isFinalized: Boolean,
 * lastUpdated: Date
 * }
 */

const ClassroomAttendance = ({ classroom }) => {
  if (!classroom || !classroom._id) {
    return (
      <div className="py-10 text-center text-gray-500 text-sm font-medium">
        No classroom data found.
      </div>
    );
  }

  const { _id: classroomId } = classroom;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar States
  const [currentViewDate, setCurrentViewDate] = useState(new Date(2026, 3, 1)); // For Month Switching
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 6)); // The actual attendance date

  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const loadDummyData = () => {
      setLoading(true);
      setTimeout(() => {
        const dummyStudents = [
          {
            _id: "s1",
            firstName: "Arjun",
            lastName: "Sharma",
            rollNumber: "CS202601",
          },
          {
            _id: "s2",
            firstName: "Sanya",
            lastName: "Iyer",
            rollNumber: "CS202602",
          },
          {
            _id: "s3",
            firstName: "Rohan",
            lastName: "Verma",
            rollNumber: "CS202603",
          },
          {
            _id: "s4",
            firstName: "Priya",
            lastName: "Patel",
            rollNumber: "CS202604",
          },
          {
            _id: "s5",
            firstName: "Aavya",
            lastName: "Reddy",
            rollNumber: "CS202605",
          },
          {
            _id: "s6",
            firstName: "Kabir",
            lastName: "Singh",
            rollNumber: "CS202606",
          },
          {
            _id: "s7",
            firstName: "Ishita",
            lastName: "Dutta",
            rollNumber: "CS202607",
          },
          {
            _id: "s8",
            firstName: "Zayan",
            lastName: "Khan",
            rollNumber: "CS202608",
          },
        ];
        setStudents(dummyStudents);
        const initial = {};
        dummyStudents.forEach((s) => (initial[s._id] = "present"));
        setAttendanceData(initial);
        setLoading(false);
      }, 500);
    };
    loadDummyData();
  }, [classroomId]);

  const changeMonth = (offset) => {
    setCurrentViewDate(
      new Date(currentViewDate.setMonth(currentViewDate.getMonth() + offset)),
    );
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleBulkUpdate = (status) => {
    const updated = { ...attendanceData };
    selectedStudents.forEach((id) => (updated[id] = status));
    setAttendanceData(updated);
    setSelectedStudents([]);
  };

  const toggleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === students.length
        ? []
        : students.map((s) => s._id),
    );
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-400 text-sm">
        Initializing...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-2 animate-in fade-in duration-500">
      {/* HEADER SECTION (Confirmation & Update on Top) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isConfirmed ? "bg-[#08384F] border-[#08384F]" : "bg-white border-gray-300"}`}
          >
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="hidden"
            />
            {isConfirmed && <Check size={14} className="text-white" />}
          </div>
          <span className="text-sm font-semibold text-[#08384F]">
            Confirm accuracy for{" "}
            {selectedDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
            })}
          </span>
        </label>

        <button
          disabled={!isConfirmed}
          className={`flex items-center gap-2 px-10 py-2.5 rounded-xl font-bold text-sm transition-all ${isConfirmed ? "bg-[#08384F] text-white shadow-md active:scale-95" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
        >
          <Save size={18} /> Update Attendance
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* CALENDAR ASIDE */}
        <aside className="w-full lg:w-64 sticky top-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#08384F] uppercase tracking-wider">
                {currentViewDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-2 mb-4">
              <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-gray-400 font-bold mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[
                  ...Array(
                    getFirstDayOfMonth(
                      currentViewDate.getFullYear(),
                      currentViewDate.getMonth(),
                    ),
                  ),
                ].map((_, i) => (
                  <div key={i} />
                ))}
                {[
                  ...Array(
                    getDaysInMonth(
                      currentViewDate.getFullYear(),
                      currentViewDate.getMonth(),
                    ),
                  ),
                ].map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentViewDate.getMonth();
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            currentViewDate.getFullYear(),
                            currentViewDate.getMonth(),
                            day,
                          ),
                        )
                      }
                      className={`h-7 w-7 flex items-center justify-center rounded-lg text-[11px] transition-all ${isSelected ? "bg-[#08384F] text-white font-bold" : "hover:bg-white text-gray-600"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg text-[11px] font-bold text-green-700">
                <span>Present</span>
                <span>
                  {
                    Object.values(attendanceData).filter((v) => v === "present")
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg text-[11px] font-bold text-red-700">
                <span>Absent</span>
                <span>
                  {
                    Object.values(attendanceData).filter((v) => v === "absent")
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* LIST MAIN CONTAINER */}
        <main className="flex-1 w-full">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedStudents.length === students.length &&
                    students.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#08384F] cursor-pointer"
                />
                <h2 className="text-sm font-bold text-[#08384F]">
                  Students ({students.length})
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {["present", "od", "absent"].map((type) => (
                  <button
                    key={type}
                    disabled={selectedStudents.length === 0}
                    onClick={() => handleBulkUpdate(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all disabled:opacity-30
                      ${type === "present" ? "bg-green-50 border-green-100 text-green-700" : type === "od" ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-red-50 border-red-100 text-red-700"}`}
                  >
                    Mark {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {students.map((student) => {
                const status = attendanceData[student._id];
                const isSelected = selectedStudents.includes(student._id);
                return (
                  <div
                    key={student._id}
                    className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isSelected ? "bg-blue-50/30" : "hover:bg-gray-50/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelectedStudents((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== student._id)
                              : [...prev, student._id],
                          )
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#08384F] cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-gray-800 leading-tight">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {student.rollNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-lg gap-0.5">
                      {[
                        {
                          id: "present",
                          icon: CheckCircle2,
                          label: "P",
                          color: "text-green-600",
                        },
                        {
                          id: "od",
                          icon: Clock,
                          label: "OD",
                          color: "text-blue-600",
                        },
                        {
                          id: "absent",
                          icon: XCircle,
                          label: "A",
                          color: "text-red-600",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() =>
                            setAttendanceData((prev) => ({
                              ...prev,
                              [student._id]: opt.id,
                            }))
                          }
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${status === opt.id ? `bg-white ${opt.color} shadow-sm` : "text-gray-400"}`}
                        >
                          <opt.icon size={11} /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomAttendance;
