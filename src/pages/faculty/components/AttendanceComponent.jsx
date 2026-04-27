import React, { useState, useRef, useEffect } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import {
  Download,
  ChevronDown,
  Eye,
  Search,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import homeImg from "../../../assets/reportImage.svg";
import Eshwar from "../../../assets/EshwarImg.png";
import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
import StudentwiseAttendanceTable from "./StudentwiseAttendanceTable";

const CustomMonthDropdown = ({ selectedMonth, setSelectedMonth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const dropdownRef = useRef(null);

  const academicMonths = [
    { label: "JUN", value: "june" },
    { label: "JUL", value: "july" },
    { label: "AUG", value: "august" },
    { label: "SEP", value: "september" },
    { label: "OCT", value: "october" },
    { label: "NOV", value: "november" },
    { label: "DEC", value: "december" },
    { label: "JAN", value: "january" },
    { label: "FEB", value: "february" },
    { label: "MAR", value: "march" },
    { label: "APR", value: "april" },
    { label: "MAY", value: "may" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoveredOption(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    setSelectedMonth(val);
    setIsOpen(false);
    setHoveredOption(null);
  };

  return (
    <div ref={dropdownRef} className="relative w-full font-['Poppins']">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 px-4 focus:outline-none bg-white flex items-center justify-between hover:bg-gray-50 text-xs w-full h-10 rounded-full"
      >
        <span className="truncate">{selectedMonth || "Month"}</span>
        <ChevronDown
          size={14}
          className={`transform transition-all ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl z-50 text-xs rounded-xl overflow-hidden">
          <div
            onClick={() => handleSelect("odd-semester")}
            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-50 font-semibold"
          >
            Odd Semester
          </div>
          <div
            onClick={() => handleSelect("even-semester")}
            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-50 font-semibold"
          >
            Even Semester
          </div>
          <div
            className="relative"
            onMouseEnter={() => setHoveredOption("month")}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <div className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between">
              Month <span>→</span>
            </div>
            {hoveredOption === "month" && (
              <div className="absolute left-full top-0 ml-1 max-h-[200px] overflow-auto bg-white border border-gray-200 rounded-xl shadow-xl min-w-[100px]">
                {academicMonths.map((m) => (
                  <div
                    key={m.value}
                    onClick={() => handleSelect(m.label)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AttendanceComponent = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for demonstration
  const sampleAttendanceData = [
    {
      rollNo: "CSE001",
      name: "Aarushi Sharma",
      total: 30,
      present: 28,
      attendance: 93,
    },
    {
      rollNo: "CSE002",
      name: "Bhavna Patel",
      total: 30,
      present: 25,
      attendance: 83,
    },
    {
      rollNo: "CSE003",
      name: "Chirag Kumar",
      total: 30,
      present: 29,
      attendance: 97,
    },
  ];

  const isReady =
    selectedClass && selectedSection && selectedSubject && selectedMonth;

  // --- Download Logic ---
  const exportToExcel = (data, fileName) => {
    const exportData = data && data.length > 0 ? data : sampleAttendanceData;
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handlePrint = () => {
    const reportData = sampleAttendanceData;
    const printWindow = window.open("", "_blank");
    const printHtml = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body { font-family: 'Poppins', sans-serif; color: #333; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #08384F; padding-bottom: 10px; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #08384F; color: white; padding: 10px; text-align: left; font-size: 11px; }
            td { padding: 8px; border: 1px solid #eee; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header"><img src="${Eshwar}" height="50" /><div><h2 style="color:#08384F">Attendance Report</h2></div></div>
          <div class="info-grid">
            <div><b>Subject:</b> ${selectedSubject}</div>
            <div><b>Section:</b> ${selectedSection}</div>
            <div><b>Period:</b> ${selectedMonth}</div>
          </div>
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Total</th><th>Present</th><th>%</th></tr></thead>
            <tbody>${reportData.map((s) => `<tr><td>${s.rollNo}</td><td>${s.name}</td><td>${s.total}</td><td>${s.present}</td><td>${s.attendance}%</td></tr>`).join("")}</tbody>
          </table>
        </body>
      </html>`;
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <section className="w-full h-screen flex flex-col bg-white font-['Poppins']">
      <div className="flex w-full h-full">
        <div className="w-[100%] h-full flex flex-col">
          <HeaderComponent title="Student Attendance" />

          <div className="mx-6 mt-6 flex items-center gap-3 p-2 rounded-full">
            <select
              className="border border-gray-200 px-4 h-10 text-xs outline-none w-36 rounded-full bg-white focus:border-[#08384f]"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="" disabled>
                View Type
              </option>
              <option value="classwise">Classwise</option>
              <option value="studentwise">Studentwise</option>
            </select>

            <select
              className="border border-gray-200 px-4 h-10 text-xs outline-none w-44 rounded-full bg-white focus:border-[#08384f]"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="" disabled>
                Select Subject
              </option>
              <option value="Cyber security">Cyber Security</option>
              <option value="Python">Python</option>
            </select>

            <select
              className="border border-gray-200 px-4 h-10 text-xs outline-none w-36 rounded-full bg-white focus:border-[#08384f]"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="" disabled>
                Section
              </option>
              <option value="CSE - A">CSE - A</option>
              <option value="IT - C">IT - C</option>
            </select>

            <div className="w-36">
              <CustomMonthDropdown
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
              />
            </div>

            <div className="relative flex-1 h-10">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full border border-gray-200 h-full text-xs pl-10 pr-4 outline-none rounded-full focus:border-[#08384f] focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() =>
                exportToExcel(sampleAttendanceData, "Attendance_Report")
              }
              className="bg-emerald-600 text-white px-6 h-10 text-xs font-semibold flex items-center gap-2 rounded-2xl hover:bg-emerald-700 shadow-sm"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>

            <button
              onClick={handlePrint}
              disabled={!isReady}
              className="bg-[#08384f] text-white px-6 h-10 text-xs font-semibold flex items-center gap-2 rounded-2xl hover:bg-[#0c4a68] disabled:opacity-30 shadow-md"
            >
              <Printer size={14} /> Print
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {isReady ? (
              <div className="mx-3 rounded-sm">
                {" "}
                {selectedClass === "classwise" ? (
                  <MonthlyAttendanceTable
                    selectedMonth={selectedMonth}
                    selectedSubject={selectedSubject}
                  />
                ) : (
                  <StudentwiseAttendanceTable
                    selectedMonth={selectedMonth}
                    selectedSubject={selectedSubject}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center ">
                <img src={homeImg} alt="Home" className="w-64" />
                <h1 className="font-bold text-xl text-gray-700">
                  Select the filters to generate the report.
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttendanceComponent;
