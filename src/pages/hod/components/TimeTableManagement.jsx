import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
import TimeTableHeader from "./TimeTableHeader";
import TimetableGrid from "./TimetableGrid";
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

const TimeTableManagement = () => {
  const queryClient = useQueryClient();
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

  const { data: activeYear } = useQuery({
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
      const res = await getDeptAcademicStructure();
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
    },
    onError: (err) => toast.error(err.message || "Failed to save"),
  });

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
        faculties:
          fa.facultyIds?.map((f) =>
            `${f.salutation || ""} ${f.fullName || ""}`.trim(),
          ) || [],
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

  const handleAddAdditionalHourSubmit = (form) => {
    setAdditionalHours((prev) => [
      ...prev,
      { _id: `temp-${Date.now()}`, ...form },
    ]);
    setShowAdditionalHourModal(false);
    toast.success("Additional hour added");
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
        isSaving={saveMutation.isLoading}
        isConfigMode={isConfigMode}
        onToggleConfigMode={() => setIsConfigMode(!isConfigMode)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto bg-[#FCFDFE]">
        <div className="h-full px-6 py-6">
          {activeTab === "timetable" ? (
            <TimetableGrid
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
              onAddAdditional={() => setShowAdditionalHourModal(true)}
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
        />
      )}
      {showAdditionalHourModal && (
        <AddAdditionalHourModal
          availableFaculties={allAvailableFaculties}
          onClose={() => setShowAdditionalHourModal(false)}
          onAdd={handleAddAdditionalHourSubmit}
        />
      )}
    </div>
  );
};

export default TimeTableManagement;
