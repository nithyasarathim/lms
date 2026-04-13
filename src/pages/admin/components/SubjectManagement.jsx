import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  Plus,
  ListFilter,
  LayoutGrid,
} from "lucide-react";
import toast from "react-hot-toast";
import HeaderComponent from "../../shared/components/HeaderComponent";
import DepartmentList from "./DepartmentList";
import SubjectAllocation from "./SubjectAllocation";
import SubjectTable from "./SubjectTable";
import { fetchRegulation } from "../api/admin.api";
import AddDepartmentModal from "../modals/AddDepartmentModal";
import AddRegulationModal from "../modals/AddRegulationModal";

const SubjectManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [regulations, setRegulations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const viewMode = searchParams.get("view") || "departments";
  const selectedDeptId = searchParams.get("deptId");

  const [selectedRegId, setSelectedRegId] = useState(
    searchParams.get("regulationId") ||
      sessionStorage.getItem("selectedRegId") ||
      "",
  );

  const currentPath = window.location.pathname;

  useEffect(() => {
    const urlRegId = searchParams.get("regulationId");
    const cachedRegId = sessionStorage.getItem("selectedRegId");

    if (!urlRegId && cachedRegId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("regulationId", cachedRegId);
      setSearchParams(newParams);
      setSelectedRegId(cachedRegId);
    }
  }, []);

  useEffect(() => {
    const loadRegulations = async () => {
      try {
        const data = await fetchRegulation();
        setRegulations(data || []);
      } catch (err) {
        console.error("Failed to load regulations", err);
      }
    };
    loadRegulations();
  }, [refreshKey]);

  const handleRegulationChange = (e) => {
    const regId = e.target.value;
    const newParams = new URLSearchParams(searchParams);

    if (regId) {
      newParams.set("regulationId", regId);
      sessionStorage.setItem("selectedRegId", regId);
      setSelectedRegId(regId);
    } else {
      newParams.delete("regulationId");
      sessionStorage.removeItem("selectedRegId");
      setSelectedRegId("");
    }
    setSearchParams(newParams);
  };

  const handleViewChange = (mode) => {
    const newParams = new URLSearchParams(searchParams);
    if (mode === "departments") {
      newParams.delete("view");
    } else {
      newParams.set("view", mode);
    }
    setSearchParams(newParams);
  };

  const handleDeptClickCapture = (e) => {
    if (!selectedRegId) {
      e.preventDefault();
      e.stopPropagation();
      toast("Please select a regulation.", {
        id: "reg-selection-error",
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "linear" }}
      className="flex w-full h-fit overflow-hidden relative"
    >
      <div className="w-full h-fit flex flex-col">
        <HeaderComponent title="Subject Management" />
        <main className="flex-1 overflow-y-auto hide-scroll bg-[#FBFBFB]">
          <div className="w-full mx-auto py-4">
            {!selectedDeptId ? (
              <>
                <div className="px-6 mb-6 flex justify-between sticky top-0 items-center bg-[#FBFBFB]/80 backdrop-blur-md py-3 gap-4 z-10">
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl shadow-inner shrink-0">
                    <button
                      onClick={() => handleViewChange("departments")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        viewMode === "departments"
                          ? "bg-white text-[#08384F] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <LayoutGrid size={16} /> Departments
                    </button>
                    <button
                      onClick={() => handleViewChange("all-subjects")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        viewMode === "all-subjects"
                          ? "bg-white text-[#08384F] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <ListFilter size={16} /> All Subjects
                    </button>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="relative flex-1 max-w-md group">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F]"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={
                          viewMode === "departments"
                            ? "Search Department..."
                            : "Search Code or Name..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CACACA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F] transition-all text-sm shadow-sm"
                      />
                    </div>
                    <button
                      className="flex items-center gap-2 bg-white text-[#08384F] border border-[#08384F] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shrink-0 shadow-sm active:scale-95"
                      onClick={() => setIsRegModalOpen(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      Regulation
                    </button>
                    <button
                      className="flex items-center gap-2 bg-[#08384F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0a4763] hover:shadow-lg active:scale-95 transition-all shrink-0"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      Department
                    </button>
                    <div className="relative group min-w-[180px]">
                      <select
                        value={selectedRegId}
                        onChange={handleRegulationChange}
                        className={`w-full pl-4 pr-8 py-2.5 bg-white border rounded-xl text-sm font-bold appearance-none cursor-pointer shadow-sm transition-all ${
                          !selectedRegId
                            ? "border-red-300 text-red-500 animate-pulse"
                            : "border-[#CACACA] text-[#08384F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#08384F]/10`}
                      >
                        <option value="">Choose Regulation</option>
                        {regulations.map((reg) => (
                          <option key={reg._id} value={reg._id}>
                            {reg.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                </div>

                {viewMode === "departments" ? (
                  <div
                    onClickCapture={handleDeptClickCapture}
                    className={`transition-all duration-300 ${
                      !selectedRegId
                        ? "opacity-40 grayscale pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    <DepartmentList
                      key={refreshKey}
                      basePath={currentPath + "?" + searchParams.toString()}
                      filter={searchTerm}
                    />
                  </div>
                ) : (
                  <div className="px-6">
                    <SubjectTable
                      isGlobalView={true}
                      searchQuery={searchTerm}
                      regulationId={selectedRegId}
                      key={refreshKey}
                    />
                  </div>
                )}
              </>
            ) : (
              <SubjectAllocation
                deptId={selectedDeptId}
                regId={selectedRegId}
                regName={regulations.find((r) => r._id === selectedRegId)?.name}
              />
            )}
          </div>
        </main>
      </div>

      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />

      <AddRegulationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
    </motion.section>
  );
};

export default SubjectManagement;
