import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FileDown, CheckCircle, Check, BookOpen } from "lucide-react";
import CourseDetails from "./CourseDetails";
import COPOMapping from "./COPOMapping";
import ReferencePlan from "./ReferencePlan";
import SubjectPlanner from "./SubjectPlanner";
import TheoryPlanner from "./TheoryPlanner";
import LabPlanner from "./LabPlanner";
import { getCoursePlan, saveCoursePlan } from "../api/faculty.api";

const ProgressCircle = ({ percentage }) => {
  // Reduced radius and stroke width for smaller ring
  const radius = 14;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // viewBox and dimensions reduced for smaller size
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
          strokeLinecap="round"
          className="text-[#08384F]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {percentage === 100 ? (
          <div className="bg-[#08384F] rounded-full p-0.5 animate-in zoom-in duration-300">
            <Check size={10} className="text-white" strokeWidth={4} />
          </div>
        ) : (
          <span className="text-[9px] font-bold text-[#08384F]">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};

const CoursePlanTab = ({
  tabs,
  activeTab,
  setActiveTab,
  tabProgress,
  overallProgress,
  deliveryType,
}) => (
  <div className="flex flex-col h-full bg-white">
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-black text-[#08384F] tracking-tight">
            Course Plan
          </h2>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-blue-50 text-[#08384F] rounded-lg font-black uppercase border border-blue-100">
          {deliveryType}
        </span>
      </div>
      <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
        <div className="relative flex-shrink-0">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#E5E7EB"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#08384F"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - overallProgress / 100)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-black text-[#08384F] text-[10px]">
            {overallProgress}%
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#08384F] uppercase tracking-tight">
            Overall Progress
          </span>
          <span className="text-[10px] font-bold text-gray-400 italic">
            {overallProgress === 100
              ? "Ready for submission"
              : `${100 - overallProgress}% remaining`}
          </span>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => setActiveTab(idx)}
          className={`w-full group relative flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
            activeTab === idx
              ? "bg-[#08384F] text-white shadow-lg shadow-blue-900/10 translate-x-1"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold tracking-tight ${activeTab === idx ? "text-white" : "text-gray-600"}`}
            >
              {tab}
            </span>
          </div>
          <div
            className={
              activeTab === idx
                ? "opacity-100"
                : "opacity-70 group-hover:opacity-100"
            }
          >
            <ProgressCircle percentage={tabProgress[idx] || 0} />
          </div>
        </button>
      ))}
    </div>

    {/* Reduced padding */}
    <div className="p-4 mt-auto border-t border-gray-100">
      <button
        disabled={overallProgress < 100}
        // Reduced padding and smaller shadow
        className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg ${
          overallProgress >= 100
            ? "bg-[#08384F] text-white shadow-blue-900/20 hover:bg-[#0a4661]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
        }`}
        onClick={() => alert("Generating PDF...")}
      >
        {overallProgress >= 100 ? (
          <FileDown size={18} strokeWidth={3} />
        ) : (
          <CheckCircle size={18} strokeWidth={3} />
        )}
        {overallProgress >= 100 ? "GENERATE DOCUMENT" : "COMPLETE STEPS"}
      </button>
    </div>
  </div>
);

const CoursePlan = ({ classroom }) => {
  const sectionId = classroom?.sectionId?._id;
  const academicYearId = classroom?.academicYearId?._id;
  const subjectId = classroom?.subjectId?._id;
  const deliveryType = classroom?.subjectId?.deliveryType || "T";

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planningData, setPlanningData] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!subjectId || !sectionId || !academicYearId) return;
    setLoading(true);
    try {
      const res = await getCoursePlan(subjectId, sectionId, academicYearId);
      if (res?.data) setPlanningData(res.data);
    } catch (err) {
      console.error("Error fetching course plan:", err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, sectionId, academicYearId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredTabs = useMemo(() => {
    const tabs = [
      { id: "details", label: "Course Details", component: CourseDetails },
      { id: "copo", label: "CO-PO Mapping", component: COPOMapping },
      { id: "refs", label: "References", component: ReferencePlan },
    ];
    if (deliveryType !== "I") {
      if (["T", "TP", "TPJ"].includes(deliveryType))
        tabs.push({
          id: "theory",
          label: "Theory Planner",
          component: TheoryPlanner,
        });
      if (["P", "TP", "TPJ", "PJ"].includes(deliveryType))
        tabs.push({ id: "lab", label: "Lab Planner", component: LabPlanner });
    }
    tabs.push({
      id: "planner",
      label: "Subject Planner",
      component: SubjectPlanner,
    });
    return tabs;
  }, [deliveryType]);

  const tabStats = useMemo(() => {
    if (!planningData?.coursePlan)
      return { progress: filteredTabs.map(() => 0), overall: 0 };
    const cp = planningData.coursePlan;

    const progress = filteredTabs.map((tab) => {
      if (tab.id === "details") {
        const d = cp.courseDetails;
        if (!d) return 0;
        let score = 0;
        if (d.description?.trim().length > 20) score += 20;
        if (d.preRequisites?.trim().length > 2) score += 20;
        if (d.coRequisites?.trim().length > 2) score += 20;
        if (d.objectives?.length > 2) score += 20;
        if (
          d.outcomes?.length >= 5 &&
          d.outcomes.every((o) => o.statement?.trim().length > 5)
        )
          score += 20;
        return score;
      }
      if (tab.id === "copo") {
        if (!cp.coPoMapping || cp.coPoMapping.length === 0) return 0;
        const totalCOs = cp.courseDetails?.outcomes?.length || 5;
        return Math.min(
          Math.round((cp.coPoMapping.length / totalCOs) * 100),
          100,
        );
      }
      if (tab.id === "refs") {
        const r = cp.references;
        if (!r) return 0;
        let score = 0;
        if (r.textBooks?.filter((t) => t.trim()).length > 0) score += 40;
        if (r.referenceBooks?.filter((t) => t.trim()).length > 0) score += 40;
        if (r.webResources?.length > 0 || r.journals?.length > 0) score += 20;
        return score;
      }
      if (tab.id === "theory") {
        const theory = cp.planners?.theory;
        if (!theory) return 0;
        const unitsWithTopics = Object.keys(theory).filter(
          (key) => theory[key]?.topics?.length > 0,
        ).length;
        return Math.round((unitsWithTopics / 5) * 100);
      }
      if (tab.id === "lab") {
        const lab = cp.planners?.lab;
        if (!lab) return 0;
        const unitsWithExperiments = Object.keys(lab).filter(
          (key) => lab[key]?.experiments?.length > 0,
        ).length;
        return Math.round((unitsWithExperiments / 5) * 100);
      }
      if (tab.id === "planner") {
        const planner = cp.planner;
        if (!planner) return 0;
        let score = 0;
        if (planner.assessments?.some((a) => a.proposedDates?.length > 0))
          score += 50;
        if (planner.activities?.some((a) => a.proposedDates?.length > 0))
          score += 50;
        return score;
      }
      return 0;
    });

    const overall = Math.round(
      progress.reduce((a, b) => a + b, 0) / progress.length,
    );
    return { progress, overall };
  }, [filteredTabs, planningData, deliveryType]);

  const handleNext = () =>
    setActiveTab((prev) => Math.min(prev + 1, filteredTabs.length - 1));
  const handlePrev = () => setActiveTab((prev) => Math.max(prev - 1, 0));

  if (loading && !planningData)
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 border-4 border-[#08384F] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#08384F] font-black text-sm uppercase tracking-widest animate-pulse">
          Synchronizing Academic Data
        </p>
      </div>
    );

  const CurrentStepComponent = filteredTabs[activeTab]?.component;

  return (
    <div className="w-full flex gap-4 p-4 bg-gray-50 h-[75vh]">
      <div className="w-1/4 bg-white rounded-3xl h-full shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 flex flex-col">
        <CoursePlanTab
          tabs={filteredTabs.map((t) => t.label)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabProgress={tabStats.progress}
          overallProgress={tabStats.overall}
          deliveryType={deliveryType}
        />
      </div>
      <div className="w-3/4 bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 h-full flex flex-col">
        {/* Main Content Area - Padding kept substantial for component layout */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar h-full">
          {CurrentStepComponent ? (
            <CurrentStepComponent
              data={planningData}
              classroom={classroom}
              onNext={activeTab === filteredTabs.length - 1 ? null : handleNext}
              onPrev={activeTab === 0 ? null : handlePrev}
              refreshData={fetchAllData}
              saveCoursePlan={saveCoursePlan}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <BookOpen size={64} strokeWidth={1} />
              <p className="mt-4 font-bold uppercase tracking-widest text-xs">
                Initialization Error
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlan;
