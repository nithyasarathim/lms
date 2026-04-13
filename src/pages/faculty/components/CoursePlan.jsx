import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  FileDown,
  CheckCircle,
  Check,
  ChevronLeft,
  PartyPopper
} from 'lucide-react';
import CourseDetails from './CourseDetails';
import COPOMapping from './COPOMapping';
import ReferencePlan from './ReferencePlan';
import SubjectPlanner from './SubjectPlanner';
import TheoryPlanner from './TheoryPlanner';
import LabPlanner from './LabPlanner';
import CoursePlanReview from './CoursePlanReview';
import { getCoursePlan, saveCoursePlan } from '../api/faculty.api';
import { generateCoursePlanPDF } from '../GeneratePDF'; // Import the helper

const ProgressCircle = ({ percentage }) => {
  const radius = 14;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
            transition: 'stroke-dashoffset 0.5s ease'
          }}
          strokeLinecap="round"
          className="text-[#08384F]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {percentage === 100 ? (
          <div className="bg-[#08384F] rounded-full p-0.5">
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
  isFinished,
  onComplete
}) => (
  <div className="flex flex-col h-full bg-white">
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-black text-[#08384F] tracking-tight">
          Course Plan
        </h2>
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
              ? 'Ready for completion'
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
            activeTab === idx && !isFinished
              ? 'bg-[#dbeafe] text-white shadow-lg translate-x-1'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span
            className={`text-sm font-bold tracking-tight ${activeTab === idx && !isFinished ? 'text-blue-950' : 'text-gray-600'}`}
          >
            {tab}
          </span>
          <ProgressCircle percentage={tabProgress[idx] || 0} />
        </button>
      ))}
    </div>

    <div className="p-4 mt-auto border-t border-gray-100">
      <button
        disabled={overallProgress < 100}
        onClick={onComplete}
        className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg border-2 ${
          isFinished
            ? 'bg-[#08384F] border-[#08384F] text-white'
            : overallProgress === 100
              ? 'bg-[#08384F] border-[#08384F] text-white hover:bg-[#0a4661]'
              : 'bg-white border-gray-100 text-gray-300 cursor-not-allowed shadow-none'
        }`}
      >
        <CheckCircle size={18} strokeWidth={3} />
        COMPLETE STEPS
      </button>
    </div>
  </div>
);

const CoursePlan = ({ classroom }) => {
  const sectionId = classroom?.sectionId?._id;
  const academicYearId = classroom?.academicYearId?._id;
  const subjectId = classroom?.subjectId?._id;
  const deliveryType = classroom?.subjectId?.deliveryType || 'T';

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planningData, setPlanningData] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!subjectId || !sectionId || !academicYearId) return;
    setLoading(true);
    try {
      const res = await getCoursePlan(subjectId, sectionId, academicYearId);
      if (res?.data) setPlanningData(res.data);
    } catch (err) {
      console.error('Error fetching course plan:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, sectionId, academicYearId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredTabs = useMemo(() => {
    const tabs = [
      { id: 'details', label: 'Course Details', component: CourseDetails },
      { id: 'copo', label: 'CO-PO Mapping', component: COPOMapping },
      { id: 'refs', label: 'References', component: ReferencePlan }
    ];
    if (deliveryType !== 'I') {
      if (['T', 'TP', 'TPJ'].includes(deliveryType))
        tabs.push({
          id: 'theory',
          label: 'Theory Planner',
          component: TheoryPlanner
        });
      if (['P', 'TP', 'TPJ', 'PJ'].includes(deliveryType))
        tabs.push({ id: 'lab', label: 'Lab Planner', component: LabPlanner });
    }
    tabs.push({
      id: 'planner',
      label: 'Subject Planner',
      component: SubjectPlanner
    });
    return tabs;
  }, [deliveryType]);

  const tabStats = useMemo(() => {
    if (!planningData?.coursePlan)
      return { progress: filteredTabs.map(() => 0), overall: 0 };
    const cp = planningData.coursePlan;
    const progress = filteredTabs.map((tab) => {
      if (tab.id === 'details') {
        const d = cp.courseDetails;
        if (!d) return 0;
        let score = 0;
        if (d.description?.trim().length > 20) score += 20;
        if (d.preRequisites?.trim().length > 2) score += 20;
        if (d.coRequisites?.trim().length > 2) score += 20;
        if (d.objectives?.length > 0) score += 20;
        if (
          d.outcomes?.length > 0 &&
          d.outcomes.every((o) => o.statement?.trim().length > 5)
        )
          score += 20;
        return score;
      }
      if (tab.id === 'copo') return cp.coPoMapping?.length > 0 ? 100 : 0;
      if (tab.id === 'refs')
        return cp.references?.textBooks?.length > 0 ? 100 : 0;
      if (tab.id === 'theory') return cp.theory?.length > 0 ? 100 : 0;
      if (tab.id === 'lab') return cp.lab?.length > 0 ? 100 : 0;
      if (tab.id === 'planner')
        return cp.assessments?.length > 0 || cp.activities?.length > 0
          ? 100
          : 0;
      return 0;
    });
    const overall = Math.round(
      progress.reduce((a, b) => a + b, 0) / progress.length
    );
    return { progress, overall };
  }, [filteredTabs, planningData]);

  const handleNext = () => {
    if (activeTab === filteredTabs.length - 1) setIsFinished(true);
    else setActiveTab((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isFinished) setIsFinished(false);
    else setActiveTab((prev) => Math.max(prev - 1, 0));
  };

  if (loading && !planningData)
    return <div className="p-40 text-center font-bold">Synchronizing...</div>;

  const CurrentStepComponent = filteredTabs[activeTab]?.component;

  return (
    <div className="w-full flex gap-4 h-[75vh]">
      <div className="w-1/4 bg-white rounded-3xl h-full border border-gray-200 flex flex-col overflow-hidden">
        <CoursePlanTab
          tabs={filteredTabs.map((t) => t.label)}
          activeTab={activeTab}
          setActiveTab={(idx) => {
            setIsFinished(false);
            setActiveTab(idx);
          }}
          tabProgress={tabStats.progress}
          overallProgress={tabStats.overall}
          deliveryType={deliveryType}
          isFinished={isFinished}
          onComplete={() => setIsFinished(true)}
        />
      </div>

      <div className="w-3/4 bg-white rounded-3xl border border-gray-200 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isFinished ? (
            <CoursePlanReview
              onGenerate={() => generateCoursePlanPDF(planningData, classroom)}
              onBack={() => setIsFinished(false)}
            />
          ) : CurrentStepComponent ? (
            <CurrentStepComponent
              data={planningData}
              classroom={classroom}
              onNext={handleNext}
              onPrev={activeTab === 0 ? null : handlePrev}
              refreshData={fetchAllData}
              saveCoursePlan={saveCoursePlan}
              isLastStep={activeTab === filteredTabs.length - 1}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CoursePlan;
