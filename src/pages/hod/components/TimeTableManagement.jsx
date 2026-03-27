import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, AlertCircle, Save, X, Lock, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PrintTableComponent from "../components/PrintTableComponent";

import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  getDeptAcademicStructure,
  getSectionsByBatchProgramId,
  getSubjectsBySemester,
  getTimeTable,
  getActiveAcademicYear,
  saveTimeTable,
} from "../api/hod.api";

import AdjustSlotModal from "../modals/AdjustSlotModal";
import AssignSubjectModal from "../modals/AssignSubjectModal";
import AddAdditionalHourModal from "../modals/AddAdditionalHourModal";
import TimeTableGrid from "./TimeTableGrid";
import CourseMatrix from "./CourseMatrix";

const INITIAL_SLOTS = [
  { type: "class", startTime: "08:45", endTime: "09:40", order: 1 },
  { type: "class", startTime: "09:40", endTime: "10:35", order: 2 },
  {
    type: "break",
    name: "BREAK",
    startTime: "10:35",
    endTime: "10:50",
    order: 3,
  },
  { type: "class", startTime: "10:50", endTime: "11:45", order: 4 },
  { type: "class", startTime: "11:45", endTime: "12:40", order: 5 },
  {
    type: "lunch",
    name: "LUNCH",
    startTime: "12:40",
    endTime: "01:30",
    order: 6,
  },
  { type: "class", startTime: "01:30", endTime: "02:25", order: 7 },
  { type: "class", startTime: "02:25", endTime: "03:20", order: 8 },
  { type: "class", startTime: "03:20", endTime: "04:15", order: 9 },
];

const TimeTableHeader = ({
  activeYear,
  academicStructure,
  structLoading,
  selectedStructureIndex,
  onStructureChange,
  deps,
  depsLoading,
  selectedSection,
  onSectionChange,
  onSave,
  onCancelEdit,
  isSaving,
  isConfigMode,
  onToggleConfigMode,
  activeTab,
  onTabChange,
  isTabChangeDisabled,
  onPrint,
  isTimeTableLoading,
  isSaveEnabled,
}) => {
  const showEditTimeline = activeTab === "timetable";

  // Check if all data is loaded for print functionality
  const isPrintEnabled =
    !structLoading &&
    !depsLoading &&
    !isTimeTableLoading &&
    selectedSection &&
    activeYear;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-8 py-3 bg-white border-b border-slate-100 gap-4 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col border-r border-slate-200 pr-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Academic Year
          </span>
          <span className="text-xs font-bold text-[#08384F]">
            {activeYear?.name || "..."}
          </span>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col">
            {structLoading ? (
              <div className="flex items-center gap-2 h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-lg min-w-[180px]">
                <Loader2 size={16} className="animate-spin text-[#08384F]" />
                <span className="text-xs font-semibold text-slate-500">
                  Loading semesters...
                </span>
              </div>
            ) : academicStructure.length > 0 ? (
              <select
                value={selectedStructureIndex}
                onChange={(e) => onStructureChange(Number(e.target.value))}
                disabled={isConfigMode}
                className={`bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-[#08384F] outline-none h-[38px] ${
                  isConfigMode
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {academicStructure.map((item, idx) => (
                  <option key={idx} value={idx}>
                    Sem {item.semester} ({item.batch?.name})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 h-[38px]">
                <AlertCircle size={14} className="text-orange-400" />
                <span className="text-xs text-orange-600 font-bold">
                  No semesters
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {depsLoading ? (
              <div className="flex items-center gap-2 h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-lg min-w-">
                <Loader2 size={16} className="animate-spin text-[#08384F]" />
                <span className="text-xs font-semibold text-slate-500">
                  Loading ..
                </span>
              </div>
            ) : academicStructure.length > 0 ? (
              deps.sections.length > 0 ? (
                <select
                  value={selectedSection?._id || ""}
                  onChange={(e) => onSectionChange(e.target.value)}
                  disabled={isConfigMode}
                  className={`bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#08384F] outline-none h-[38px] ${
                    isConfigMode
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {deps.sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 h-[38px]">
                  <AlertCircle size={14} className="text-red-400" />
                  <span className="text-xs text-red-600 font-bold">N/A</span>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isConfigMode ? (
          <>
            <button
              onClick={onCancelEdit}
              className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!isSaveEnabled || isSaving || !selectedSection}
              className="flex items-center gap-2 px-5 py-2 
                bg-[#08384F] text-white rounded-xl text-[11px] font-black uppercase tracking-widest 
                shadow-lg transition-all duration-200
                hover:bg-gradient-to-r hover:from-[#08384F] hover:to-[#0B56A4] hover:shadow-xl
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSave}
              disabled={!isSaveEnabled || isSaving || !selectedSection}
              className="flex items-center gap-2 px-5 py-2 bg-[#08384F] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 hover:bg-[#0B56A4]"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save changes
            </button>
            {showEditTimeline && (
              <button
                onClick={onToggleConfigMode}
                className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border text-slate-400 hover:text-[#08384F]"
              >
                Edit Timeline
              </button>
            )}
          </>
        )}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange("timetable")}
            disabled={isTabChangeDisabled}
            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "timetable"
                ? "bg-white text-[#08384F] shadow-sm"
                : "text-slate-400"
            } ${isTabChangeDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Timetable
          </button>
          <button
            onClick={() => onTabChange("faculty")}
            disabled={isTabChangeDisabled}
            className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "faculty"
                ? "bg-white text-[#08384F] shadow-sm"
                : "text-slate-400"
            } ${isTabChangeDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Course Matrix
          </button>
        </div>
        <button
          onClick={onPrint}
          disabled={!isPrintEnabled}
          className={`px-4 py-2 font-semibold text-sm items-center flex gap-2 rounded-lg transition-colors ${
            isPrintEnabled
              ? "bg-green-100 text-green-900 cursor-pointer hover:bg-green-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
          }`}
          title={
            !isPrintEnabled
              ? "Please wait for all data to load completely"
              : "Print timetable"
          }
        >
          <Printer size={15} />
          Print
        </button>
      </div>
    </div>
  );
};

const NoSectionsOverlay = () => (
  <div className="relative h-full w-full">
    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 p-7 rounded-3xl shadow-xl max-w-md text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-[#08384F]/10 rounded-2xl flex items-center justify-center">
          <Lock className="text-[#08384F]" size={30} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#08384F]">
            Sections Not Available
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
            No sections are created for this semester yet. Please contact the
            administrator to create sections before managing the timetable.
          </p>
        </div>
        <div className="w-full h-px bg-slate-100" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Academic structure required
        </span>
      </div>
    </div>
    <div className="opacity-30 pointer-events-none grayscale">
      <TimeTableGrid
        isLoading={true}
        slots={[]}
        timetableData={{}}
        isConfigMode={false}
      />
    </div>
  </div>
);

const TimeTableManagement = () => {
  const queryClient = useQueryClient();
  const printRef = useRef(null);
  const [activeTab, setActiveTab] = useState("timetable");
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [selectedStructureIndex, setSelectedStructureIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetableData, setTimetableData] = useState({});
  const [facultyVenues, setFacultyVenues] = useState({});
  const [additionalHours, setAdditionalHours] = useState([]);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAdditionalHourModal, setShowAdditionalHourModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingAdditionalHour, setEditingAdditionalHour] = useState(null);
  const [printData, setPrintData] = useState(null);
  const user = JSON.parse(localStorage.getItem("lms-user") || "{}");
  const deptId = user.departmentId;

  const { data: activeYear, isLoading: activeYearLoading } = useQuery({
    queryKey: ["activeYear"],
    queryFn: async () => {
      const res = await getActiveAcademicYear();
      const ayData = res.data?.academicYears || res.data;
      return Array.isArray(ayData) ? ayData.find((ay) => ay.isActive) : ayData;
    },
  });

  const { data: academicStructure = [], isLoading: structLoading } = useQuery({
    queryKey: ["academicStructure"],
    queryFn: async () => {
      const res = await getDeptAcademicStructure(deptId);
      return (
        res.data?.academicStructure || res.data?.data?.academicStructure || []
      );
    },
  });

  const current = academicStructure[selectedStructureIndex];
  const ayId = activeYear?._id || activeYear?.id;
  const secId = selectedSection?._id || selectedSection?.id;
  const semNum = current?.semester;

  const {
    data: deps = { sections: [], subjects: [] },
    isLoading: depsLoading,
  } = useQuery({
    queryKey: [
      "deps",
      current?.batchProgramId?._id || current?.batchProgramId,
      semNum,
    ],
    queryFn: async () => {
      const bpId = current?.batchProgramId?._id || current?.batchProgramId;
      const [secRes, subRes] = await Promise.all([
        getSectionsByBatchProgramId(bpId),
        getSubjectsBySemester(bpId, semNum),
      ]);
      return {
        sections: (secRes.data?.sections || []).filter(
          (s) => s.name !== "UNALLOCATED",
        ),
        subjects: subRes.data?.subjects || [],
      };
    },
    enabled: !!current?.batchProgramId && !!semNum,
  });

  const { data: serverData, isLoading: timeTableLoading } = useQuery({
    queryKey: ["timeTableFetch", ayId, secId, semNum],
    queryFn: async () => {
      const res = await getTimeTable(ayId, secId, semNum);
      return res.data || res;
    },
    enabled: !!ayId && !!secId && !!semNum,
  });

  useEffect(() => {
    if (serverData) {
      const timetableObj = serverData.timetable || serverData.data?.timetable;
      const responseSlots =
        timetableObj?.slots || serverData.slots || serverData.data?.slots;

      if (responseSlots?.length > 0) {
        setSlots([...responseSlots].sort((a, b) => a.order - b.order));
      } else {
        setSlots(INITIAL_SLOTS);
      }

      const grid = {};
      ["MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((day) => {
        grid[day] = {};
      });

      const responseEntries =
        timetableObj?.entries ||
        serverData.entries ||
        serverData.data?.entries ||
        [];
      responseEntries.forEach((entry) => {
        if (grid[entry.day]) {
          grid[entry.day][entry.slotOrder] = {
            code: entry.subjectCode || entry.additionalHourId?.shortName,
            short: entry.subjectShortName || entry.additionalHourId?.shortName,
            facultyAssignmentId: entry.facultyAssignmentId,
            additionalHourId:
              entry.additionalHourId?._id || entry.additionalHourId,
          };
        }
      });
      setTimetableData(grid);

      const venues = {};
      const responseFA =
        serverData.facultyAssignments ||
        serverData.data?.facultyAssignments ||
        [];
      responseFA.forEach((fa) => {
        venues[fa._id] = fa.venue || "";
      });
      setFacultyVenues(venues);

      const responseAH =
        serverData.additionalHours || serverData.data?.additionalHours || [];
      setAdditionalHours(responseAH);
    }
  }, [serverData]);

  const saveMutation = useMutation({
    mutationFn: (payload) => saveTimeTable(payload),
    onSuccess: () => {
      toast.success("Timetable saved successfully");
      queryClient.invalidateQueries(["timeTableFetch"]);
      setIsConfigMode(false);
    },
    onError: (err) => toast.error(err.message || "Failed to save"),
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Timetable_${selectedSection?.name || ""}_Sem${semNum || ""}`,
    onAfterPrint: () => toast.success("Print initiated"),
  });

  const preparePrintData = () => {
    const currentAcademicStructure = academicStructure[selectedStructureIndex];
    const faList =
      serverData?.facultyAssignments ||
      serverData?.data?.facultyAssignments ||
      [];

    return {
      academicYear: activeYear,
      batch: currentAcademicStructure?.batch,
      semester: semNum,
      department: currentAcademicStructure?.department,
      section: selectedSection,
      slots: slots,
      timetableData: timetableData,
      facultyAssignments: faList,
      additionalHours: additionalHours,
      subjects: deps.subjects,
      sectionDetails: selectedSection,
    };
  };

  const handlePrintClick = () => {
    if (!selectedSection) {
      toast.error("Please select a section to print");
      return;
    }
    const data = preparePrintData();
    setPrintData(data);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleGlobalSave = () => {
    const entries = [];
    Object.entries(timetableData).forEach(([day, daySlots]) => {
      Object.entries(daySlots).forEach(([slotOrder, data]) => {
        entries.push({
          day,
          slotOrder: Number(slotOrder),
          facultyAssignmentId: data.facultyAssignmentId || null,
          additionalHourId: data.additionalHourId || null,
        });
      });
    });

    const payload = {
      academicYearId: ayId,
      sectionId: secId,
      semesterNumber: semNum,
      slots: slots.map((s, idx) => ({ ...s, order: idx + 1 })),
      entries,
      facultyAssignments: Object.entries(facultyVenues).map(([id, venue]) => ({
        _id: id,
        venue,
      })),
      additionalHours: additionalHours.map(({ _id, ...rest }) =>
        _id?.startsWith("temp-") ? rest : { _id, ...rest },
      ),
    };
    saveMutation.mutate(payload);
  };

  const handleCancelEdit = () => {
    setIsConfigMode(false);
    if (serverData) {
      const timetableObj = serverData.timetable || serverData.data?.timetable;
      const responseSlots =
        timetableObj?.slots || serverData.slots || serverData.data?.slots;

      if (responseSlots?.length > 0) {
        setSlots([...responseSlots].sort((a, b) => a.order - b.order));
      } else {
        setSlots(INITIAL_SLOTS);
      }

      const grid = {};
      ["MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((day) => {
        grid[day] = {};
      });

      const responseEntries =
        timetableObj?.entries ||
        serverData.entries ||
        serverData.data?.entries ||
        [];
      responseEntries.forEach((entry) => {
        if (grid[entry.day]) {
          grid[entry.day][entry.slotOrder] = {
            code: entry.subjectCode || entry.additionalHourId?.shortName,
            short: entry.subjectShortName || entry.additionalHourId?.shortName,
            facultyAssignmentId: entry.facultyAssignmentId,
            additionalHourId:
              entry.additionalHourId?._id || entry.additionalHourId,
          };
        }
      });
      setTimetableData(grid);
    }
  };

  useEffect(() => {
    if (activeTab !== "timetable" && isConfigMode) {
      setIsConfigMode(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (
      deps.sections.length > 0 &&
      (!selectedSection ||
        !deps.sections.find((s) => s._id === selectedSection._id))
    ) {
      setSelectedSection(deps.sections[0]);
    }
  }, [deps.sections]);

  const faList =
    serverData?.facultyAssignments ||
    serverData?.data?.facultyAssignments ||
    [];

  const matrixData = useMemo(() => {
    const matrix = {
      theory: [],
      theoryCumLab: [],
      theoryLabProject: [],
      elective: [],
      practical: [],
      project: [],
      additional: [],
    };
    if (!faList.length) return matrix;

    const subjectsMap = {};
    faList.forEach((fa) => {
      const sub = fa.subjectComponentId?.subjectId;
      const comp = fa.subjectComponentId;
      if (!sub || !comp) return;

      if (!subjectsMap[sub._id]) {
        subjectsMap[sub._id] = {
          short: sub.shortName || sub.code,
          code: sub.code,
          category: sub.courseCategory || "Professional Core",
          credits: sub.credits,
          components: [],
        };
      }

      subjectsMap[sub._id].components.push({
        title: comp.name,
        facultiesData: fa.facultyIds || [],
        venue: facultyVenues[fa._id] || "",
        hrs: comp.hours,
        id: fa._id,
        type: comp.componentType,
      });
    });

    Object.values(subjectsMap).forEach((course) => {
      const types = course.components.map((c) => c.type);
      const formatted = { ...course, items: course.components };
      if (
        types.includes("THEORY") &&
        types.includes("PRACTICAL") &&
        types.includes("PROJECT")
      )
        matrix.theoryLabProject.push(formatted);
      else if (types.includes("THEORY") && types.includes("PRACTICAL"))
        matrix.theoryCumLab.push(formatted);
      else if (types.includes("THEORY")) matrix.theory.push(formatted);
      else if (types.includes("PRACTICAL")) matrix.practical.push(formatted);
      else if (types.includes("PROJECT")) matrix.project.push(formatted);
      else matrix.theory.push(formatted);
    });
    return matrix;
  }, [faList, facultyVenues]);

  const allAvailableFaculties = useMemo(() => {
    const facMap = new Map();
    faList.forEach((fa) => fa.facultyIds?.forEach((f) => facMap.set(f._id, f)));
    return Array.from(facMap.values());
  }, [faList]);

  const handleStructureChange = (idx) => {
    setSelectedStructureIndex(idx);
    setSelectedSection(null);
  };

  const handleSectionChange = (val) => {
    setSelectedSection(deps.sections.find((s) => s._id === val));
  };

  const handleVenueChange = (id, value) => {
    setFacultyVenues((prev) => ({ ...prev, [id]: value }));
  };

  const handleAdditionalVenueChange = (id, value) => {
    setAdditionalHours((prev) =>
      prev.map((item) => (item._id === id ? { ...item, venue: value } : item)),
    );
  };

  const handleMoveSlot = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slots.length) return;

    const oldOrder1 = slots[index].order;
    const oldOrder2 = slots[targetIndex].order;

    const newSlots = [...slots];
    [newSlots[index], newSlots[targetIndex]] = [
      newSlots[targetIndex],
      newSlots[index],
    ];
    setSlots(newSlots.map((s, idx) => ({ ...s, order: idx + 1 })));

    setTimetableData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((day) => {
        const dayData = { ...updated[day] };
        const data1 = dayData[oldOrder1];
        const data2 = dayData[oldOrder2];
        if (data2) dayData[oldOrder1] = data2;
        else delete dayData[oldOrder1];
        if (data1) dayData[oldOrder2] = data1;
        else delete dayData[oldOrder2];
        updated[day] = dayData;
      });
      return updated;
    });
  };

  const handleRemoveCellData = (day, slotOrder) => {
    setTimetableData((prev) => {
      const newDayData = { ...prev[day] };
      delete newDayData[slotOrder];
      return { ...prev, [day]: newDayData };
    });
  };

  const handleAssignSubjectClick = (slot, day) => {
    setSelectedSlot(slot);
    setSelectedDay(day);
    setShowSubjectModal(true);
  };

  const handleEditSlotTimeClick = (slot) => {
    setSelectedSlot(slot);
    setShowTimeModal(true);
  };

  const handleTimeUpdate = (start, end) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.order === selectedSlot.order
          ? { ...s, startTime: start, endTime: end }
          : s,
      ),
    );
    setShowTimeModal(false);
  };

  const handleAddAdditionalHourSubmit = (form, isEdit, id) => {
    if (isEdit) {
      setAdditionalHours((prev) =>
        prev.map((item) => (item._id === id ? { ...item, ...form } : item)),
      );
      toast.success("Additional hour updated");
    } else {
      setAdditionalHours((prev) => [
        ...prev,
        { _id: `temp-${Date.now()}`, ...form },
      ]);
      toast.success("Additional hour added");
    }
    setShowAdditionalHourModal(false);
    setEditingAdditionalHour(null);
  };

  const handleDeleteAdditionalHour = (id) => {
    setAdditionalHours((prev) => prev.filter((item) => item._id !== id));
    toast.success("Additional hour deleted");
  };

  const handleEditAdditionalHour = (hour) => {
    setEditingAdditionalHour(hour);
    setShowAdditionalHourModal(true);
  };

  const handleSubjectUpdate = (val) => {
    if (val.startsWith("ADDITIONAL|")) {
      const ahId = val.split("|")[1];
      const ah = additionalHours.find(
        (a) => a._id === ahId || a.shortName === ahId,
      );
      if (ah) {
        setTimetableData((prev) => ({
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            [selectedSlot.order]: {
              code: ah.shortName,
              short: ah.shortName,
              additionalHourId: ah._id,
            },
          },
        }));
      }
    } else {
      const assignment = faList.find((fa) => fa._id === val);
      if (assignment) {
        setTimetableData((prev) => ({
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            [selectedSlot.order]: {
              code: assignment.subjectComponentId?.subjectId?.code || "N/A",
              short:
                assignment.subjectComponentId?.shortName ||
                assignment.subjectComponentId?.subjectId?.shortName ||
                "N/A",
              facultyAssignmentId: val,
            },
          },
        }));
      }
    }
    setShowSubjectModal(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const isInitialLoading = structLoading || activeYearLoading || depsLoading;

  const noSectionsFound =
    !depsLoading && academicStructure.length > 0 && deps.sections.length === 0;

  const isTabChangeDisabled = isInitialLoading;

  const isSaveEnabled =
    !structLoading && !depsLoading && !timeTableLoading && !activeYearLoading;

  return (
    <div className="h-screen flex flex-col bg-white font-['Poppins']">
      <HeaderComponent title="Academic Management" />

      <TimeTableHeader
        activeYear={activeYear}
        academicStructure={academicStructure}
        structLoading={structLoading}
        selectedStructureIndex={selectedStructureIndex}
        onStructureChange={handleStructureChange}
        deps={deps}
        depsLoading={depsLoading}
        selectedSection={selectedSection}
        onSectionChange={handleSectionChange}
        onSave={handleGlobalSave}
        onCancelEdit={handleCancelEdit}
        isSaving={saveMutation.isLoading}
        isConfigMode={isConfigMode}
        onToggleConfigMode={() => setIsConfigMode(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isTabChangeDisabled={isTabChangeDisabled}
        onPrint={handlePrintClick}
        isTimeTableLoading={timeTableLoading}
        isSaveEnabled={isSaveEnabled}
      />

      <div className="flex-1 overflow-y-auto bg-[#FCFDFE]">
        <div className="h-full px-6 py-6">
          {isInitialLoading ? (
            <TimeTableGrid
              isLoading={true}
              slots={[]}
              timetableData={{}}
              isConfigMode={false}
            />
          ) : noSectionsFound ? (
            <NoSectionsOverlay />
          ) : activeTab === "timetable" ? (
            <TimeTableGrid
              isLoading={timeTableLoading}
              slots={slots}
              timetableData={timetableData}
              isConfigMode={isConfigMode}
              onMoveSlot={handleMoveSlot}
              onRemoveCell={handleRemoveCellData}
              onEditSlotTime={handleEditSlotTimeClick}
              onAssignSubject={handleAssignSubjectClick}
            />
          ) : (
            <CourseMatrix
              matrixData={matrixData}
              facultyVenues={facultyVenues}
              onVenueChange={handleVenueChange}
              additionalHours={additionalHours}
              onAdditionalVenueChange={handleAdditionalVenueChange}
              allAvailableFaculties={allAvailableFaculties}
              onAddAdditional={() => {
                setEditingAdditionalHour(null);
                setShowAdditionalHourModal(true);
              }}
              onEditAdditional={handleEditAdditionalHour}
              onDeleteAdditional={handleDeleteAdditionalHour}
              isLoading={timeTableLoading}
              hasSelectedSection={!!selectedSection}
            />
          )}
        </div>
      </div>

      {showTimeModal && (
        <AdjustSlotModal
          slot={selectedSlot}
          onClose={() => setShowTimeModal(false)}
          onSave={handleTimeUpdate}
        />
      )}
      {showSubjectModal && (
        <AssignSubjectModal
          faList={faList}
          additionalHours={additionalHours}
          onClose={() => setShowSubjectModal(false)}
          onAssign={handleSubjectUpdate}
          academicYearId={ayId}
          sectionId={secId}
          semesterNumber={semNum}
        />
      )}
      {showAdditionalHourModal && (
        <AddAdditionalHourModal
          availableFaculties={allAvailableFaculties}
          onClose={() => {
            setShowAdditionalHourModal(false);
            setEditingAdditionalHour(null);
          }}
          onAdd={handleAddAdditionalHourSubmit}
          editingHour={editingAdditionalHour}
        />
      )}

      <div style={{ display: "none" }}>
        {printData && <PrintTableComponent ref={printRef} data={printData} />}
      </div>
    </div>
  );
};

export default TimeTableManagement;
