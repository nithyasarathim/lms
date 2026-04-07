import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import SriEshwarLogo from "../../../assets/EshwarImg.png";
import banner from "../../../assets/popup-banner.svg";
import { getClassroomById, respondToInvitation } from "../api/auth.api";

const InvitationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [classroomData, setClassroomData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const verificationToken = searchParams.get("token");
  const classroomId = searchParams.get("classroomId");
  const storedUser = JSON.parse(localStorage.getItem("lms-user"));
  const token = storedUser?.token;

  useEffect(() => {
    const getDetails = async () => {
      if (classroomId && token) {
        try {
          const response = await getClassroomById(classroomId);
          if (response.success) {
            setClassroomData(response.data.classroom);
          }
        } catch (err) {
          console.error("Error fetching classroom details:", err);
        } finally {
          setFetching(false);
        }
      } else {
        setFetching(false);
      }
    };
    getDetails();
  }, [classroomId, token]);

  const handleResponse = async (actionType) => {
    if (!token || !verificationToken || !classroomId) return;
    setLoading(true);

    const apiAction = actionType === "accept" ? "accepted" : "rejected";

    try {
      await respondToInvitation(classroomId, verificationToken, apiAction);

      toast.success(
        actionType === "accept" ? "Joined successfully!" : "Declined",
      );

      navigate(
        actionType === "accept"
          ? `/faculty/dashboard?tab=classrooms&classroomId=${classroomId}`
          : `/${storedUser.role.toLowerCase()}/dashboard`,
      );
    } catch (err) {
      toast.error(err.message || "Link expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-['Poppins'] bg-white overflow-hidden">
      <style>
        {`
          @keyframes slowFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: slowFloat 3s ease-in-out infinite;
          }
        `}
      </style>

      <img src={SriEshwarLogo} alt="Logo" className="h-14 w-auto mb-8" />

      <div className="w-full max-w-sm">
        <div className="w-full h-[20%] mb-6 animate-float">
          <img
            src={banner}
            alt="Banner"
            className="w-full h-full object-contain opacity-90"
          />
        </div>

        <div className="p-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0B56A4] rounded-full text-[10px] font-bold uppercase mb-4">
            <Sparkles size={12} /> New Classroom Invitation
          </div>

          <h1 className="text-2xl font-bold text-[#08384F]">
            {classroomData ? classroomData.subjectId.shortName : "You’re In!"}
          </h1>

          {classroomData && (
            <div className="mt-2">
              <p className="text-slate-600 font-medium text-sm">
                {classroomData.subjectId.name}
              </p>
              <div className="flex items-center justify-center gap-2 text-[#0B56A4] text-xs font-bold mt-2">
                <BookOpen size={14} />
                <span>
                  Section {classroomData.sectionId.name} • Sem{" "}
                  {classroomData.semesterNumber}
                </span>
              </div>
            </div>
          )}

          <p className="text-slate-400 text-xs mt-6 px-4 leading-relaxed">
            You’ve been invited to join this classroom. Hit the button below to
            get started.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => handleResponse("accept")}
                disabled={loading || fetching}
                className="flex-1 py-3 bg-[#08384F] hover:bg-[#0B56A4] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Accept <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                onClick={() => handleResponse("reject")}
                disabled={loading || fetching}
                className="flex-1 py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Decline
              </button>
            </div>

            <button
              onClick={() => navigate("/")}
              disabled={loading}
              className="w-full py-3 bg-white border border-gray-200 hover:border-[#0B56A4] text-[#0B56A4] rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98]"
            >
              <LayoutDashboard size={16} /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
