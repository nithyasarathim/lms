import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, ChevronDown, Layers, CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import HeaderComponent from "../../shared/components/HeaderComponent";
import DepartmentList from "./DepartmentList";
import AddBatchModal from "../modal/AddBatchModal";
import ManageAcademicYearsModal from "../modal/ManageAcademicYearsModal";
import BatchAllocation from "./BatchAllocation";
import { fetchBatch } from "../api/admin.api";

const BatchManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batches, setBatches] = useState([]);

  const selectedDeptId = searchParams.get("deptId");
  const isYearModalOpen = searchParams.get("manageYears") === "true";

  const [selectedBatchId, setSelectedBatchId] = useState(
    searchParams.get("batchId") ||
      sessionStorage.getItem("selectedBatchId") ||
      "",
  );

  const currentPath = window.location.pathname;

  useEffect(() => {
    const urlBatchId = searchParams.get("batchId");
    const cachedBatchId = sessionStorage.getItem("selectedBatchId");

    if (!urlBatchId && cachedBatchId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("batchId", cachedBatchId);
      setSearchParams(newParams, { replace: true });
      setSelectedBatchId(cachedBatchId);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await fetchBatch();
        const data = response?.data?.batches || response || [];
        setBatches(data);
      } catch (err) {
        toast.error("Error loading batches");
      }
    };
    loadBatches();
  }, []);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const newParams = new URLSearchParams(searchParams);

    if (batchId) {
      newParams.set("batchId", batchId);
      sessionStorage.setItem("selectedBatchId", batchId);
      setSelectedBatchId(batchId);
    } else {
      newParams.delete("batchId");
      sessionStorage.removeItem("selectedBatchId");
      setSelectedBatchId("");
    }
    setSearchParams(newParams);
  };

  const openYearModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("manageYears", "true");
    setSearchParams(newParams);
  };

  const closeYearModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("manageYears");
    setSearchParams(newParams);
  };

  const handleDeptClickCapture = (e) => {
    if (!selectedBatchId) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("Please select a Batch before choosing a department.", {
        id: "select-batch-warning",
      });
    }
  };

  return (
    <section className="flex w-full h-screen overflow-hidden relative font-['Poppins']">
      <div className="w-full h-full flex flex-col">
        <HeaderComponent title="Batch Management" />

        <main className="flex-1 overflow-y-auto hide-scroll bg-[#FBFBFB]">
          <div className="w-full mx-auto py-4">
            {!selectedDeptId ? (
              <>
                <div className="px-6 mb-6 flex justify-between sticky top-0 items-center bg-[#FBFBFB]/80 backdrop-blur-md py-3 gap-4 z-10 border-b border-gray-100/50">
                  <div className="relative flex-1 max-w-md group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08384F] transition-colors"
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
                    <button
                      onClick={openYearModal}
                      className="flex items-center gap-2 bg-white border border-[#CACACA] text-[#08384F] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-[#08384F]/40 transition-all shadow-sm active:scale-95 group"
                    >
                      <CalendarPlus
                        size={18}
                        className="text-[#08384F] group-hover:scale-110 transition-transform"
                      />
                      Manage Academic Years
                    </button>

                    <div className="relative group">
                      <Layers
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-[#08384F] transition-colors"
                        size={16}
                      />
                      <select
                        value={selectedBatchId}
                        onChange={handleBatchChange}
                        className={`pl-9 pr-10 py-2.5 bg-white border rounded-xl text-sm font-bold appearance-none cursor-pointer shadow-sm min-w-[160px] transition-all ${
                          !selectedBatchId
                            ? "border-red-200 text-red-400 ring-2 ring-red-50"
                            : "border-[#CACACA] text-[#08384F] hover:border-[#08384F]/40"
                        } focus:outline-none focus:ring-2 focus:ring-[#08384F]/10`}
                      >
                        <option value="">Choose Batch</option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={batch._id}>
                            {batch.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#08384F] transition-colors"
                        size={16}
                      />
                    </div>

                    <button
                      className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0a4763] transition-all shrink-0 shadow-lg shadow-blue-900/10 active:scale-95"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus size={18} strokeWidth={3} />
                      Add Batch
                    </button>
                  </div>
                </div>

                <div
                  onClickCapture={handleDeptClickCapture}
                  className={`transition-all duration-300 ${
                    !selectedBatchId
                      ? "opacity-40 grayscale pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <DepartmentList
                    basePath={currentPath + "?" + searchParams.toString()}
                    filter={searchTerm}
                  />
                </div>
              </>
            ) : (
              <BatchAllocation
                deptId={selectedDeptId}
                regId={selectedBatchId}
                regName={batches.find((b) => b._id === selectedBatchId)?.name}
              />
            )}
          </div>
        </main>
      </div>

      <AddBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {isYearModalOpen && (
        <ManageAcademicYearsModal isOpen={true} onClose={closeYearModal} />
      )}
    </section>
  );
};

export default BatchManagement;
