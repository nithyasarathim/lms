import React, { useMemo, useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import { Search, FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import homeImg from "../../../assets/reportImage.svg";
import Eshwar from "../../../assets/EshwarImg.png";
import CustomMonthDropdown from "./CustomMonthDropdown";
import MonthlyAttendanceTable from "./MonthlyAttendanceTable";
import StudentwiseAttendanceTable from "./StudentwiseAttendanceTable";

const classwiseDummyData = [
  {
    date: "15/06/2026",
    dateValue: "2026-06-15",
    month: "JUN",
    semester: "odd-semester",
    classHour: "1st Hour",
    total: 50,
    present: 44,
    absent: 6,
    onduty: 0,
    percentage: 88,
  },
  {
    date: "19/08/2026",
    dateValue: "2026-08-19",
    month: "AUG",
    semester: "odd-semester",
    classHour: "2nd Hour",
    total: 50,
    present: 47,
    absent: 3,
    onduty: 0,
    percentage: 94,
  },
  {
    date: "08/01/2026",
    dateValue: "2026-01-08",
    month: "JAN",
    semester: "even-semester",
    classHour: "3rd Hour",
    total: 48,
    present: 40,
    absent: 8,
    onduty: 0,
    percentage: 83,
  },
  {
    date: "16/03/2026",
    dateValue: "2026-03-16",
    month: "MAR",
    semester: "even-semester",
    classHour: "4th Hour",
    total: 48,
    present: 43,
    absent: 5,
    onduty: 0,
    percentage: 90,
  },
];

const studentwiseDummyData = [
  {
    rollNo: "CSE001",
    name: "Aarushi Sharma",
    dateValue: "2026-06-15",
    month: "JUN",
    semester: "odd-semester",
    total: 30,
    present: 28,
    absent: 2,
    onduty: 0,
    attendance: 93,
  },
  {
    rollNo: "CSE002",
    name: "Bhavna Patel",
    dateValue: "2026-08-19",
    month: "AUG",
    semester: "odd-semester",
    total: 30,
    present: 25,
    absent: 5,
    onduty: 0,
    attendance: 83,
  },
  {
    rollNo: "CSE003",
    name: "Chirag Kumar",
    dateValue: "2026-01-08",
    month: "JAN",
    semester: "even-semester",
    total: 30,
    present: 29,
    absent: 1,
    onduty: 0,
    attendance: 97,
  },
  {
    rollNo: "CSE004",
    name: "Diana Singh",
    dateValue: "2026-03-16",
    month: "MAR",
    semester: "even-semester",
    total: 30,
    present: 24,
    absent: 6,
    onduty: 0,
    attendance: 80,
  },
  {
    rollNo: "CSE005",
    name: "Esha Verma",
    dateValue: "2026-04-11",
    month: "APR",
    semester: "even-semester",
    total: 30,
    present: 27,
    absent: 3,
    onduty: 0,
    attendance: 90,
  },
];

const filterAttendanceData = (data, filterMode, selectedMonth, dateFrom, dateTo) => {
  return data.filter((item) => {
    if (filterMode === "semester") {
      return item.semester === selectedMonth;
    }

    if (filterMode === "month") {
      return item.month === selectedMonth;
    }

    if (filterMode === "date") {
      if (!dateFrom || !dateTo) return true;
      return item.dateValue >= dateFrom && item.dateValue <= dateTo;
    }

    return true;
  });
};

const AttendanceComponent = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const isDateFilterReady = filterMode !== "date" || (dateFrom && dateTo);
  const isReady =
    selectedClass &&
    selectedSection &&
    selectedSubject &&
    selectedMonth &&
    isDateFilterReady;

  const filteredClasswiseData = useMemo(
    () =>
      filterAttendanceData(
        classwiseDummyData,
        filterMode,
        selectedMonth,
        dateFrom,
        dateTo
      ),
    [filterMode, selectedMonth, dateFrom, dateTo]
  );

  const filteredStudentwiseData = useMemo(() => {
    const filteredByPeriod = filterAttendanceData(
      studentwiseDummyData,
      filterMode,
      selectedMonth,
      dateFrom,
      dateTo
    );
    const query = searchQuery.trim().toLowerCase();

    if (!query || selectedClass === "classwise") {
      return filteredByPeriod;
    }

    return filteredByPeriod.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query)
    );
  }, [filterMode, selectedMonth, dateFrom, dateTo, searchQuery, selectedClass]);

  const currentReportData =
    selectedClass === "classwise" ? filteredClasswiseData : filteredStudentwiseData;

  const exportToExcel = (data, fileName) => {
    const exportData = data && data.length > 0 ? data : currentReportData;
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handlePrint = () => {
    const reportData = currentReportData;
    const printWindow = window.open("", "_blank");
    const printHtml = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body { font-family: 'Poppins', sans-serif; color: #333; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #08384F; padding-bottom: 10px; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
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
            <div><b>Filter:</b> ${selectedMonth}</div>
            <div><b>From:</b> ${dateFrom || "-"}</div>
            <div><b>To:</b> ${dateTo || "-"}</div>
          </div>
          <table>
            <thead><tr><th>S.No</th><th>Date/Roll No</th><th>Name/Hour</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
            <tbody>${reportData
              .map(
                (s, index) =>
                  `<tr><td>${index + 1}</td><td>${s.date || s.rollNo}</td><td>${
                    s.classHour || s.name
                  }</td><td>${s.total}</td><td>${s.present}</td><td>${s.absent}</td><td>${
                    s.percentage || s.attendance
                  }%</td></tr>`
              )
              .join("")}</tbody>
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

          <div className="mx-6 mt-6 flex flex-wrap items-center gap-3 p-3 rounded-[28px] bg-slate-50">
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

            <div className={selectedClass === "classwise" ? "flex-1" : "w-36"}>
              <CustomMonthDropdown
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                setFilterMode={setFilterMode}
              />
            </div>

            {selectedClass !== "classwise" && (
              <div className="relative flex-1 min-w-[240px] h-10">
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
            )}

            <button
              onClick={() => exportToExcel(currentReportData, "Attendance_Report")}
              className="bg-emerald-600 text-white px-5 min-w-[96px] h-10 text-xs font-semibold flex items-center justify-center gap-2 rounded-full hover:bg-emerald-700 shadow-sm"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>

            <button
              onClick={handlePrint}
              disabled={!isReady}
              className="bg-[#08384f] text-white px-5 min-w-[96px] h-10 text-xs font-semibold flex items-center justify-center gap-2 rounded-full hover:bg-[#0c4a68] disabled:opacity-30 shadow-md"
            >
              <Printer size={14} /> Print
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {isReady ? (
              <div className="mx-3 rounded-sm">
                {selectedClass === "classwise" ? (
                  <MonthlyAttendanceTable
                    data={filteredClasswiseData}
                    selectedMonth={selectedMonth}
                    selectedSubject={selectedSubject}
                  />
                ) : (
                  <StudentwiseAttendanceTable
                    data={filteredStudentwiseData}
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
