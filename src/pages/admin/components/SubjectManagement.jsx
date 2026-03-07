import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import DepartmentList from "./DepartmentList";
import SubjectTable from "./SubjectTable";
import AddDepartmentModal from "../modal/AddDepartmentModal";

const SubjectManagement = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedDeptId = searchParams.get("deptId");
  const currentPath = window.location.pathname + window.location.search;

  return (
    <section className="flex w-full min-h-screen fixed overflow-hidden relative ">
      <div className="w-full h-full flex flex-col ">
        <HeaderComponent title="Subject Management" />

        <main className="flex-1 overflow-y-auto pt-4 hide-scroll bg-[#FBFBFB]">
          <div className="w-full mx-auto">
            {!selectedDeptId ? (
              <>
                <div className="px-6 mb-6 flex justify-between sticky top-0 items-center bg-[#FBFBFB]/80 backdrop-blur-md py-3 gap-4 z-10">
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

                  <button
                    className="flex items-center gap-2 bg-[#08384F] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0a4763] hover:shadow-lg active:scale-95 transition-all shrink-0"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Add Department
                  </button>
                </div>

                <DepartmentList basePath={currentPath} filter={searchTerm} />
              </>
            ) : (
              <SubjectTable deptId={selectedDeptId} />
            )}
          </div>
        </main>
      </div>

      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </section>
  );
};

export default SubjectManagement;
