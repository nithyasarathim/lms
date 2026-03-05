import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, ChevronDown, Layers } from "lucide-react";
import toast from "react-hot-toast";
import HeaderComponent from "../../shared/components/HeaderComponent";
import DepartmentList from "./DepartmentList";
import AddBatchModal from "../modal/AddBatchModal";
import BatchAllocation from "./BatchAllocation";
import { fetchBatch } from "../api/admin.api";

const BatchManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batches, setBatches] = useState([]);

  const selectedDeptId = searchParams.get("deptId");
  const selectedBatchId = searchParams.get("batchId") || "";
  const currentPath = window.location.pathname;

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await fetchBatch();
        const data = response?.data?.batches || response || [];
        setBatches(data);
      } catch (err) {
        console.error("Failed to load Batches", err);
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
    } else {
      newParams.delete("batchId");
    }
    setSearchParams(newParams);
  };

  const handleDeptClickCapture = (e) => {
    if (!selectedBatchId) {
      e.preventDefault();
      e.stopPropagation();
      toast("Please select a Batch before choosing a department.", {
        id: "batch-selection-error",
        style: {
          borderRadius: "12px",
          background: "#08384F",
          color: "#fff",
          fontSize: "12px",
          fontFamily: "Poppins",
        },
      });
    }
  };

  return (
    <section className="flex w-full h-screen overflow-hidden relative">
      <div className="w-full h-full flex flex-col">
        <HeaderComponent title="Batch Management" />

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
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CACACA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08384F]/10 focus:border-[#08384F] transition-all text-sm shadow-sm font-header"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Layers
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16}
                      />
                      <select
                        value={selectedBatchId}
                        onChange={handleBatchChange}
                        className={`pl-9 pr-8 py-2.5 bg-white border rounded-xl text-sm font-bold appearance-none cursor-pointer shadow-sm min-w-[150px] transition-all ${
                          !selectedBatchId
                            ? "border-red-300 text-red-500 animate-pulse"
                            : "border-[#CACACA] text-[#08384F]"
                        } focus:outline-none focus:ring-2 focus:ring-[#08384F]/10 font-header`}
                      >
                        <option value="">Choose Batch</option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={batch._id}>
                            {batch.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16}
                      />
                    </div>

                    <button
                      className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a4763] transition-all shrink-0 shadow-md active:scale-95 font-header"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      Add Batch
                    </button>
                  </div>
                </div>

                <div
                  onClickCapture={handleDeptClickCapture}
                  className={
                    !selectedBatchId ? "opacity-60 grayscale-[0.5]" : ""
                  }
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
    </section>
  );
};

export default BatchManagement;
