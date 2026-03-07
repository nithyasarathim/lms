import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import HeaderComponent from "../../shared/components/HeaderComponent";
import DepartmentList from "./DepartmentList";
import AddRegulationModal from "../modal/AddRegulationModal";
import SubjectAllocation from "./SubjectAllocation";
import { fetchRegulation } from "../api/admin.api";

const RegulationManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regulations, setRegulations] = useState([]);

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
  }, []);

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

  const handleDeptClickCapture = (e) => {
    if (!selectedRegId) {
      e.preventDefault();
      e.stopPropagation();
      toast("Please select a regulation.", {
        id: "reg-selection-error"
      });
    }
  };

  return (
    <section className="flex w-full h-screen overflow-hidden relative">
      <div className="w-full h-full flex flex-col">
        <HeaderComponent title="Regulation Management" />
        <main className="flex-1 overflow-y-auto hide-scroll bg-[#FBFBFB]">
          <div className="w-full mx-auto py-4">
            {!selectedDeptId ? (
              <>
                <div className="px-6 mb-6 flex justify-between sticky top-0 items-center bg-[#FBFBFB]/80 backdrop-blur-md py-3 gap-4 z-10">
                  <div className="relative flex-1 max-w-md group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F]"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search Department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CACACA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F] transition-all text-sm shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <select
                        value={selectedRegId}
                        onChange={handleRegulationChange}
                        className={`pl-4 pr-8 py-2.5 bg-white border rounded-xl text-sm font-bold appearance-none cursor-pointer shadow-sm min-w-[150px] transition-all ${
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

                    <button
                      className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0a4763] transition-all shrink-0 shadow-md active:scale-95"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      Add Regulation
                    </button>
                  </div>
                </div>

                <div
                  onClickCapture={handleDeptClickCapture}
                  className={!selectedRegId ? "opacity-60 grayscale-[0.5]" : ""}
                >
                  <DepartmentList
                    basePath={currentPath + "?" + searchParams.toString()}
                    filter={searchTerm}
                  />
                </div>
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

      <AddRegulationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </section>
  );
};

export default RegulationManagement;
