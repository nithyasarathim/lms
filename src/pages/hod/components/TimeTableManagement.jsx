import React, { useState } from "react";
import {
  X,
  Download,
  Calendar,
  BookOpen,
  Beaker,
  Plus,
  User,
  ChevronDown,
  Edit2,
  Clock,
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Settings,
} from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";

const INITIAL_SLOTS = [
  { type: "period", time: "08:45 - 09:40", id: 0 },
  { type: "period", time: "09:40 - 10:35", id: 1 },
  { type: "break", name: "BREAK", id: "b1" },
  { type: "period", time: "10:50 - 11:45", id: 2 },
  { type: "period", time: "11:45 - 12:40", id: 3 },
  { type: "break", name: "LUNCH", id: "b2" },
  { type: "period", time: "01:30 - 02:25", id: 4 },
  { type: "period", time: "02:25 - 03:20", id: 5 },
  { type: "period", time: "03:20 - 04:15", id: 6 },
];

const INITIAL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const ALL_SUBJECTS = [
  { code: "22MG501", sub: "Business Ethics and corporate Social Responsibilities", short: "BE&CSR", type: "theory" },
  { code: "22CS501", sub: "Database Management Systems", short: "DBMS", type: "theory" },
  { code: "22CS511", sub: "Application Design", short: "AD", type: "lab" },
  { code: "22CS503", sub: "Theory of Computation", short: "TOC", type: "theory" },
  { code: "22CS504", sub: "Networks", short: "NW", type: "theory" },
];

const INITIAL_DATA = {
  MON: {
    0: { sub: "Business Ethics and Corporate Social Responsibilities", code: "22MG501", short: "BE&CSR", type: "theory" },
    1: { sub: "Database Management Systems", code: "22CS501", short: "DBMS", type: "theory" },
    4: { sub: "Application Design", code: "22CS511", short: "AD", type: "lab" },
  },
  TUE: {
    0: { sub: "Theory of Computation", code: "22CS503", short: "TOC", type: "theory" },
    2: { sub: "Application Design", code: "22CS511", short: "AD", type: "lab" },
    3: { sub: "Application Design", code: "22CS511", short: "AD", type: "lab" },
  },
};

const INITIAL_MATRIX = {
  theory: [
    { short: "BE&CSR", code: "22MG501", title: "Business Ethics and Corporate Social Responsibilities", faculties: ["Dr. A. Sivakumar"], venue: "LH 201", category: "HSMC", credits: 3, hrs: 3 },
  ],
  theoryCumLab: [
    {
      short: "DBMS",
      code: "22CS501",
      category: "PCC",
      items: [
        { title: "Database Management Systems", faculties: ["Mrs. S. Shanthi"], venue: "LH 202", credits: 3, hrs: 3 },
        { title: "Database Management Systems (Laboratory)", faculties: ["Mrs. S. Shanthi", "Mr. Tech"], venue: "CS Lab 1", credits: 1, hrs: 2 },
      ],
    },
  ],
  theoryLabProject: [
    {
      short: "AD",
      code: "22CS511",
      category: "PCC",
      items: [
        { title: "Application Design", faculties: ["Ms. R. Deepa"], venue: "LH 203", credits: 2, hrs: 2 },
        { title: "Application Design (Laboratory)", faculties: ["Ms. R. Deepa", "Ms. Assistant"], venue: "Project Lab", credits: 1, hrs: 2 },
        { title: "Application Design (Project)", faculties: ["Ms. R. Deepa"], venue: "Project Lab", credits: 1, hrs: 2 },
      ],
    },
  ],
  elective: [],
  practical: [],
  project: [],
  additional: [],
};

const TimeTableManagement = () => {
  const [activeTab, setActiveTab] = useState("timetable");
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [timetableData, setTimetableData] = useState(INITIAL_DATA);
  const [matrixData, setMatrixData] = useState(INITIAL_MATRIX);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const moveSlot = (index, direction) => {
    if (slots[index].type !== "break") return;
    const newSlots = [...slots];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSlots.length) return;
    [newSlots[index], newSlots[targetIndex]] = [newSlots[targetIndex], newSlots[index]];
    setSlots(newSlots);
  };

  const handleTimeUpdate = (e) => {
    e.preventDefault();
    const newTime = new FormData(e.target).get("time");
    setSlots(slots.map((s) => (s.id === selectedSlot.id && s.type === selectedSlot.type ? { ...s, time: newTime } : s)));
    setShowTimeModal(false);
  };

  const handleSubjectUpdate = (e) => {
    e.preventDefault();
    const code = e.target.subject.value;
    const subject = ALL_SUBJECTS.find((s) => s.code === code);
    setTimetableData((prev) => ({ ...prev, [selectedDay]: { ...prev[selectedDay], [selectedSlot.id]: subject } }));
    setShowSubjectModal(false);
  };

  const MatrixSection = ({ title, data }) => (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center px-3 justify-between bg-slate-50/80 py-4 border-b border-slate-200">
        <h3 className="text-xs font-black text-[#08384F] uppercase tracking-[2px]">{title}</h3>
        <button className="p-1 text-[#08384F] hover:bg-white rounded-lg transition-colors"><PlusCircle size={18} /></button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-white text-[12px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
          <tr>
            <th className="p-4 border-r border-slate-100">Short Name</th>
            <th className="p-4 border-r border-slate-100">Code</th>
            <th className="p-4 border-r border-slate-100">Course Title</th>
            <th className="p-4 border-r border-slate-100">Faculty Incharge</th>
            <th className="p-4 border-r border-slate-100">Venue</th>
            <th className="p-4 text-center border-r border-slate-100">Cat</th>
            <th className="p-4 text-center border-r border-slate-100">Cr</th>
            <th className="p-4 text-center">Hrs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr><td colSpan="8" className="p-4 text-center text-[12px] text-slate-300 italic">No courses added</td></tr>
          ) : (
            data.map((course, idx) => {
              if (course.items) {
                return course.items.map((item, iIdx) => (
                  <tr key={`${idx}-${iIdx}`} className="hover:bg-slate-50/50 transition-colors text-sm">
                    {iIdx === 0 && <td rowSpan={course.items.length} className="p-4 font-bold text-[#08384F] border-r border-slate-200">{course.short}</td>}
                    {iIdx === 0 && <td rowSpan={course.items.length} className="p-4 font-mono font-bold text-[#0B56A4] border-r border-slate-200">{course.code}</td>}
                    <td className="p-4 font-bold text-slate-700 border-r border-slate-100">{item.title}</td>
                    <td className="p-4 text-slate-600 font-medium border-r border-slate-100">
                      <div className="flex flex-col gap-1">
                        {item.faculties.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1"><User size={10} /> {f}</div>
                        ))}
                        <button className="text-[9px] flex items-center gap-1 text-[#0B56A4] font-bold mt-1 hover:underline"><Plus size={10}/> Add Faculty</button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 border-r border-slate-100">{item.venue}</td>
                    {iIdx === 0 && <td rowSpan={course.items.length} className="p-4 text-center font-black text-slate-400 border-r border-slate-200">{course.category}</td>}
                    <td className="p-4 text-center font-bold text-[#08384F] border-r border-slate-100">{item.credits}</td>
                    <td className="p-4 text-center font-bold text-slate-500">{item.hrs}</td>
                  </tr>
                ));
              }
              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 font-bold text-[#08384F] border-r border-slate-200">{course.short}</td>
                  <td className="p-4 font-mono font-bold text-[#0B56A4] border-r border-slate-200">{course.code}</td>
                  <td className="p-4 font-bold text-slate-700 border-r border-slate-100">{course.title}</td>
                  <td className="p-4 text-slate-600 font-medium border-r border-slate-100">
                    <div className="flex flex-col gap-1">
                      {course.faculties.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-1"><User size={10} /> {f}</div>
                      ))}
                      <button className="text-[9px] flex items-center gap-1 text-[#0B56A4] font-bold mt-1 hover:underline"><Plus size={10}/> Add Faculty</button>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 border-r border-slate-100">{course.venue}</td>
                  <td className="p-4 text-center font-black text-slate-400 border-r border-slate-100">{course.category}</td>
                  <td className="p-4 text-center font-bold text-[#08384F] border-r border-slate-100">{course.credits}</td>
                  <td className="p-4 text-center font-bold text-slate-500">{course.hrs}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white font-['Poppins']">
      <HeaderComponent title="Academic Management" />
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-3 bg-white border-b border-slate-100 gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col border-r border-slate-200 pr-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</span>
            <span className="text-sm font-bold text-[#08384F]">2025 - 2026</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Year</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-[#08384F] outline-none cursor-pointer">
                    <option>III Year</option>
                    <option>IV Year</option>
                </select>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Semester</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-[#08384F] outline-none cursor-pointer">
                    <option>Odd</option>
                    <option>Even</option>
                </select>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Section</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-[#08384F] outline-none cursor-pointer">
                    <option>Section A</option>
                    <option>Section B</option>
                </select>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsConfigMode(!isConfigMode)}
            className={`px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border ${isConfigMode ? "bg-[#08384F] text-white shadow-lg" : "text-slate-400 hover:text-[#08384F]"}`}
          >
            {isConfigMode ? "Done" : "Adjust timeline"}
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === "timetable" ? "bg-white text-[#08384F] shadow-sm" : "text-slate-400"}`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab("faculty")}
              className={`px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === "faculty" ? "bg-white text-[#08384F] shadow-sm" : "text-slate-400"}`}
            >
              Course Matrix
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FCFDFE]">
        <div className="h-full px-2 lg:px-6 py-6">
          {activeTab === "timetable" ? (
            <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse table-fixed min-w-[1100px] h-full">
                  <thead>
                    <tr className="bg-slate-50/50 sticky top-0 bg-white z-40 border-b border-slate-200">
                      <th className="w-20 p-4 text-[12px] font-black text-slate-400 border-r border-slate-200 sticky left-0 z-50 bg-slate-50">
                        DAY
                      </th>
                      {slots.map((slot, i) => (
                        <th
                          key={i}
                          onClick={() => isConfigMode && (setSelectedSlot(slot), setShowTimeModal(true))}
                          className={`p-4 text-center border-r border-slate-100 ${isConfigMode ? "cursor-pointer hover:bg-slate-100" : ""} ${slot.type === "break" ? "w-15 bg-[#08384F]/5" : ""}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="flex items-center gap-2 text-[9px] font-black text-[#0B56A4] opacity-50 uppercase">
                              {isConfigMode && slot.type === "break" && (
                                <ArrowLeft size={12} className="cursor-pointer hover:text-black" onClick={(e) => { e.stopPropagation(); moveSlot(i, -1); }} />
                              )}
                              {slot.type === "break" ? slot.name : `Slot ${slot.id + 1}`}
                              {isConfigMode && slot.type === "break" && (
                                <ArrowRight size={12} className="cursor-pointer hover:text-black" onClick={(e) => { e.stopPropagation(); moveSlot(i, 1); }} />
                              )}
                            </span>
                            <span className="text-[13px] font-black text-[#08384F] underline decoration-dotted underline-offset-4">
                              {slot.time}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {INITIAL_DAYS.map((day, rIdx) => (
                      <tr key={day} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 text-center text-xs font-black text-[#08384F] bg-slate-50/50 border-r border-slate-300 sticky left-0 z-20">
                          {day}
                        </td>
                        {slots.map((slot, i) =>
                          slot.type === "break" ? (
                            rIdx === 0 ? (
                              <td key={i} rowSpan={INITIAL_DAYS.length} className="bg-[#08384F] border-x border-white/5 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="[writing-mode:vertical-lr] rotate-180 text-[12px] font-black text-white/30 tracking-[0.4em] uppercase">{slot.name}</span>
                                </div>
                              </td>
                            ) : null
                          ) : (
                            <td key={i} className="p-2 text-center align-middle group/cell border-r border-slate-100">
                              {timetableData[day]?.[slot.id] ? (
                                <div className="relative w-full h-full min-h-[50px]">
                                  <div onClick={() => setSelectedCell({ ...timetableData[day][slot.id], day })}
                                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-2 border-2 ${timetableData[day][slot.id].code === "22MG501" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50/50 border-blue-100 text-[#0B56A4]"}`}
                                  >
                                    <span className="text-[9px] font-black opacity-40 mb-1">{timetableData[day][slot.id].code}</span>
                                    <span className="text-sm font-black uppercase text-center leading-tight">{timetableData[day][slot.id].short}</span>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedSlot(slot); setSelectedDay(day); setShowSubjectModal(true); }}
                                    className="absolute -top-1 -right-1 p-1 bg-white border border-slate-200 rounded-full opacity-0 group-hover/cell:opacity-100 z-10 hover:text-[#08384F] transition-opacity shadow-sm"><Settings size={10} /></button>
                                </div>
                              ) : (
                                <button onClick={() => { setSelectedSlot(slot); setSelectedDay(day); setShowSubjectModal(true); }}
                                  className="w-full h-full min-h-[80px] flex items-center justify-center group/add"><Plus size={14} className="text-slate-200 group-hover/add:text-slate-900" /></button>
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto pb-10">
              <MatrixSection title="THEORY COURSES" data={matrixData.theory} />
              <MatrixSection title="THEORY CUM PRACTICAL COURSES" data={matrixData.theoryCumLab} />
              <MatrixSection title="THEORY WITH PRACTICAL AND PROJECT COURSES" data={matrixData.theoryLabProject} />
              <MatrixSection title="PROFESSIONAL ELECTIVE COURSES" data={matrixData.elective} />
              <MatrixSection title="PRACTICAL COURSES" data={matrixData.practical} />
              <MatrixSection title="PROJECT WORK" data={matrixData.project} />
              <MatrixSection title="ADDITIONAL HOURS" data={matrixData.additional} />
            </div>
          )}
        </div>
      </div>
      {showTimeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-[#08384F] mb-4">Set Timeline</h3>
            <form onSubmit={handleTimeUpdate} className="space-y-4">
              <input name="time" autoFocus defaultValue={selectedSlot?.time} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-[#0B56A4]" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTimeModal(false)} className="flex-1 py-3 text-xs font-black text-slate-400">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-xs font-black shadow-lg">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-[#08384F] mb-4">Select Subject</h3>
            <form onSubmit={handleSubjectUpdate} className="space-y-4">
              <select name="subject" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                {ALL_SUBJECTS.map((s) => (<option key={s.code} value={s.code}>{s.code} - {s.sub}</option>))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 py-3 text-xs font-black text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-xs font-black shadow-lg">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTableManagement;