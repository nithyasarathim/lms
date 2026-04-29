import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import HeaderComponent from '../../shared/components/HeaderComponent';
import {
  downloadClasswiseAttendanceReport,
  downloadStudentwiseAttendanceReport,
  getActiveAcademicYear,
  getClassrooms,
  getClasswiseAttendanceReport,
  getStudentwiseAttendanceReport
} from '../api/faculty.api';
import homeImg from '../../../assets/reportImage.svg';
import CustomMonthDropdown from './CustomMonthDropdown';
import MonthlyAttendanceTable from './MonthlyAttendanceTable';
import StudentwiseAttendanceTable from './StudentwiseAttendanceTable';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const STATUS_STYLES = {
  Present: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-600'
  },
  Absent: {
    dot: 'bg-rose-400',
    text: 'text-rose-600'
  },
  OnDuty: {
    dot: 'bg-blue-400',
    text: 'text-blue-600'
  }
};

const pad = (value) => String(value).padStart(2, '0');

const toRoman = (value) => {
  const romanMap = [
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ];

  let remaining = Number(value) || 0;
  let result = '';

  romanMap.forEach(({ value: romanValue, symbol }) => {
    while (remaining >= romanValue) {
      result += symbol;
      remaining -= romanValue;
    }
  });

  return result || String(value || '');
};

const buildAcademicMonths = (academicYear) => {
  if (!academicYear?.startYear || !academicYear?.endYear) return [];

  const startMonth = Number(academicYear.startMonth || 6);
  const endMonth = Number(academicYear.endMonth || 5);
  const startDate = new Date(Date.UTC(academicYear.startYear, startMonth - 1, 1));
  const endDate = new Date(Date.UTC(academicYear.endYear, endMonth - 1, 1));

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return [];
  }

  const months = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate && months.length < 18) {
    const year = cursor.getUTCFullYear();
    const monthNumber = cursor.getUTCMonth() + 1;
    months.push({
      value: `${year}-${pad(monthNumber)}`,
      label: MONTH_LABELS[monthNumber - 1],
      shortLabel: MONTH_LABELS[monthNumber - 1].slice(0, 3)
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
};

const getSemesterType = (semesterNumber) =>
  Number(semesterNumber) % 2 === 0 ? 'even' : 'odd';

const getClassLabel = (classroom) => {
  const yearLabel = toRoman(Math.ceil(Number(classroom?.semesterNumber || 1) / 2));
  const departmentCode = classroom?.department?.code || '';
  const sectionName = classroom?.sectionId?.name || '';
  return [yearLabel, departmentCode, sectionName].filter(Boolean).join(' ');
};

const getStatusLabel = (status) => (status === 'OnDuty' ? 'On Duty' : status);

const parseFileNameFromHeaders = (headers) => {
  const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition'];
  if (!disposition) return null;

  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || null;
};

const triggerBlobDownload = (response, fallbackName) => {
  const blob = new Blob([response.data]);
  const fileName = parseFileNameFromHeaders(response.headers) || fallbackName;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const exportRowsToExcel = (rows, fileName, sheetName = 'Attendance') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'No data available' }]);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const DetailDrawer = ({
  detail,
  searchValue,
  onSearchChange,
  onClose
}) => {
  const filteredItems = useMemo(() => {
    const query = String(searchValue || '').trim().toLowerCase();
    if (!query) return detail?.items || [];

    return (detail?.items || []).filter((item) =>
      [item.title, item.subtitle, item.status, item.remarks]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [detail, searchValue]);

  if (!detail) return null;

  const summary = detail.summary || {};

  return (
    <aside className="w-[300px] shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#282526]">{detail.title}</h3>
          {detail.subtitle ? (
            <p className="mt-1 text-[11px] text-gray-500">{detail.subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">
        {summary.presentCount !== undefined && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Present - {summary.presentCount}
          </span>
        )}
        {summary.absentCount !== undefined && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Absent - {summary.absentCount}
          </span>
        )}
        {summary.onDutyCount !== undefined && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            On Duty - {summary.onDutyCount}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs outline-none transition-colors focus:border-[#08384F]"
        />
      </div>

      <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-1">
        {filteredItems.length ? (
          filteredItems.map((item) => {
            const style = STATUS_STYLES[item.status] || STATUS_STYLES.Absent;
            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#282526]">
                    {item.title}
                  </p>
                  {item.subtitle ? (
                    <p className="mt-1 text-[11px] text-gray-500">{item.subtitle}</p>
                  ) : null}
                  {item.remarks ? (
                    <p className="mt-1 text-[11px] text-gray-400">{item.remarks}</p>
                  ) : null}
                </div>
                <span className={`flex items-center gap-1 text-[11px] font-medium ${style.text}`}>
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {getStatusLabel(item.status)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400">
            No matching records found.
          </div>
        )}
      </div>
    </aside>
  );
};

const AttendanceComponent = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [viewType, setViewType] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [periodState, setPeriodState] = useState({
    reportType: '',
    month: '',
    fromDate: '',
    toDate: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [detailDrawer, setDetailDrawer] = useState(null);
  const [detailSearch, setDetailSearch] = useState('');

  useEffect(() => {
    const loadFilters = async () => {
      setFiltersLoading(true);

      try {
        const [classroomResponse, academicYearResponse] = await Promise.all([
          getClassrooms({ status: 'active' }),
          getActiveAcademicYear()
        ]);

        setClassrooms(classroomResponse?.data?.classrooms || []);
        setActiveAcademicYear(
          academicYearResponse?.data?.academicYears?.[0] || null
        );
      } catch (error) {
        toast.error(error?.message || 'Failed to load attendance filters');
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, []);

  const subjectOptions = useMemo(() => {
    const subjectMap = new Map();

    classrooms.forEach((classroom) => {
      const subject = classroom?.subjectId;
      if (!subject?._id) return;

      if (!subjectMap.has(subject._id)) {
        subjectMap.set(subject._id, {
          value: subject._id,
          label: subject.name,
          code: subject.code,
          classrooms: []
        });
      }

      subjectMap.get(subject._id).classrooms.push(classroom);
    });

    return [...subjectMap.values()].sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }, [classrooms]);

  const classOptions = useMemo(() => {
    return classrooms
      .filter((classroom) => classroom?.subjectId?._id === selectedSubjectId)
      .map((classroom) => ({
        value: classroom._id,
        label: getClassLabel(classroom),
        semesterType: getSemesterType(classroom.semesterNumber),
        classroom
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [classrooms, selectedSubjectId]);

  const selectedClassroom = useMemo(
    () =>
      classOptions.find((classroom) => classroom.value === selectedClassroomId)
        ?.classroom || null,
    [classOptions, selectedClassroomId]
  );

  const selectedSemesterType = selectedClassroom
    ? getSemesterType(selectedClassroom.semesterNumber)
    : '';

  const monthOptions = useMemo(() => {
    const months = buildAcademicMonths(activeAcademicYear);
    if (!selectedSemesterType || !months.length) return [];

    const midpoint = Math.ceil(months.length / 2);
    const relevantMonths =
      selectedSemesterType === 'odd' ? months.slice(0, midpoint) : months.slice(midpoint);

    return relevantMonths.map((month) => ({
      value: month.value,
      label: month.label,
      shortLabel: month.shortLabel
    }));
  }, [activeAcademicYear, selectedSemesterType]);

  const selectedPeriodLabel = useMemo(() => {
    if (periodState.reportType === 'semester') {
      return selectedSemesterType === 'odd' ? 'Odd Semester' : 'Even Semester';
    }

    if (periodState.reportType === 'month') {
      const selectedMonth = monthOptions.find(
        (month) => month.value === periodState.month
      );
      return selectedMonth?.label || 'Month';
    }

    if (periodState.reportType === 'date-range') {
      if (periodState.fromDate && periodState.toDate) {
        return `${periodState.fromDate} - ${periodState.toDate}`;
      }
      return 'Date Range';
    }

    return '';
  }, [monthOptions, periodState, selectedSemesterType]);

  const isPeriodReady =
    periodState.reportType === 'semester' ||
    (periodState.reportType === 'month' && periodState.month) ||
    (periodState.reportType === 'date-range' &&
      periodState.fromDate &&
      periodState.toDate);

  const canFetchReport = Boolean(viewType && selectedClassroomId && isPeriodReady);
  const studentwiseSearchRequired = viewType === 'studentwise';
  const studentwiseHasSearch = Boolean(submittedSearch.trim());

  useEffect(() => {
    setSelectedClassroomId('');
    setPeriodState({
      reportType: '',
      month: '',
      fromDate: '',
      toDate: ''
    });
    setSubmittedSearch('');
    setSearchInput('');
    setReportData(null);
    setDetailDrawer(null);
    setDetailSearch('');
  }, [selectedSubjectId, viewType]);

  useEffect(() => {
    setPeriodState({
      reportType: '',
      month: '',
      fromDate: '',
      toDate: ''
    });
    setSubmittedSearch('');
    setSearchInput('');
    setReportData(null);
    setDetailDrawer(null);
    setDetailSearch('');
  }, [selectedClassroomId]);

  useEffect(() => {
    setDetailDrawer(null);
    setDetailSearch('');
  }, [
    periodState.reportType,
    periodState.month,
    periodState.fromDate,
    periodState.toDate,
    submittedSearch
  ]);

  useEffect(() => {
    if (viewType === 'studentwise' && !searchInput.trim() && submittedSearch) {
      setSubmittedSearch('');
    }
  }, [searchInput, submittedSearch, viewType]);

  useEffect(() => {
    if (!canFetchReport) {
      setReportData(null);
      return;
    }

    let isCancelled = false;

    const loadReport = async () => {
      setReportLoading(true);

      try {
        const params = {
          classroomId: selectedClassroomId,
          reportType: periodState.reportType
        };

        if (periodState.reportType === 'month') {
          params.month = periodState.month;
        }

        if (periodState.reportType === 'date-range') {
          params.fromDate = periodState.fromDate;
          params.toDate = periodState.toDate;
        }

        if (studentwiseSearchRequired && studentwiseHasSearch) {
          params.search = submittedSearch.trim();
        }

        const response =
          viewType === 'classwise'
            ? await getClasswiseAttendanceReport(params)
            : await getStudentwiseAttendanceReport(params);

        if (!isCancelled) {
          setReportData(response?.data || null);
        }
      } catch (error) {
        if (!isCancelled) {
          setReportData(null);
          toast.error(error?.message || 'Failed to load attendance report');
        }
      } finally {
        if (!isCancelled) {
          setReportLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isCancelled = true;
    };
  }, [
    canFetchReport,
    periodState.fromDate,
    periodState.month,
    periodState.reportType,
    periodState.toDate,
    selectedClassroomId,
    studentwiseHasSearch,
    studentwiseSearchRequired,
    submittedSearch,
    viewType
  ]);

  const handleSearchSubmit = () => {
    if (!searchInput.trim()) {
      setSubmittedSearch('');
      return;
    }

    setSubmittedSearch(searchInput.trim());
  };

  const buildReportParams = () => {
    const params = {
      classroomId: selectedClassroomId,
      reportType: periodState.reportType
    };

    if (periodState.reportType === 'month') {
      params.month = periodState.month;
    }

    if (periodState.reportType === 'date-range') {
      params.fromDate = periodState.fromDate;
      params.toDate = periodState.toDate;
    }

    if (viewType === 'studentwise' && submittedSearch.trim()) {
      params.search = submittedSearch.trim();
    }

    return params;
  };

  const handleDownloadReport = async () => {
    if (!canFetchReport) {
      toast.error('Select the report filters first');
      return;
    }

    if (viewType === 'studentwise' && !submittedSearch.trim()) {
      toast.error('Search a student before downloading the report');
      return;
    }

    try {
      const response =
        viewType === 'classwise'
          ? await downloadClasswiseAttendanceReport(buildReportParams())
          : await downloadStudentwiseAttendanceReport(buildReportParams());

      triggerBlobDownload(response, 'attendance_report.xlsx');
    } catch (error) {
      toast.error(error?.message || 'Failed to download attendance report');
    }
  };

  const handleRowDownload = (row) => {
    if (!row) return;

    if (viewType === 'classwise' && periodState.reportType === 'semester') {
      exportRowsToExcel(
        [
          {
            Month: row.month,
            'Total Classes': row.totalClasses,
            'Present Count': row.presentCount,
            'Absent Count': row.absentCount,
            'On Duty Count': row.onDutyCount,
            'Attendance Percentage': `${row.attendancePercentage}%`
          }
        ],
        `${row.month || 'classwise'}_summary`
      );
      return;
    }

    const detailRows = (row.details?.items || []).map((item) => ({
      Title: item.title,
      Subtitle: item.subtitle || '',
      Status: getStatusLabel(item.status),
      Remarks: item.remarks || ''
    }));

    exportRowsToExcel(
      detailRows,
      `${row.dateValue || row.monthValue || row.studentId || 'attendance'}_details`
    );
  };

  const showInitialState = !viewType || !selectedSubjectId || !selectedClassroomId || !isPeriodReady;
  const showStudentwiseEmptyState =
    viewType === 'studentwise' && canFetchReport && !submittedSearch.trim();

  const reportRows = reportData?.rows || [];
  const reportSummary = reportData?.summary || null;

  return (
    <section className="flex h-screen w-full flex-col bg-white font-['Poppins']">
      <div className="flex h-full w-full">
        <div className="flex h-full w-full flex-col">
          <HeaderComponent title="Student Attendance" />

          <div className="mx-6 mt-4 flex flex-wrap items-center gap-3">
            <select
              value={viewType}
              onChange={(event) => setViewType(event.target.value)}
              className="h-10 w-28 rounded-lg border border-gray-200 px-3 text-xs outline-none transition-colors focus:border-[#08384F]"
            >
              <option value="">Select</option>
              <option value="classwise">Classwise</option>
              <option value="studentwise">Student wise</option>
            </select>

            <select
              value={selectedSubjectId}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              disabled={!viewType || filtersLoading}
              className="h-10 w-44 rounded-lg border border-gray-200 px-3 text-xs outline-none transition-colors focus:border-[#08384F] disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>

            <select
              value={selectedClassroomId}
              onChange={(event) => setSelectedClassroomId(event.target.value)}
              disabled={!selectedSubjectId}
              className="h-10 w-36 rounded-lg border border-gray-200 px-3 text-xs outline-none transition-colors focus:border-[#08384F] disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select Class</option>
              {classOptions.map((classroom) => (
                <option key={classroom.value} value={classroom.value}>
                  {classroom.label}
                </option>
              ))}
            </select>

            <div className="w-36">
              <CustomMonthDropdown
                disabled={!selectedClassroom}
                selectedLabel={selectedPeriodLabel}
                semesterOptionLabel={
                  selectedSemesterType
                    ? selectedSemesterType === 'odd'
                      ? 'Odd Semester'
                      : 'Even Semester'
                    : ''
                }
                monthOptions={monthOptions}
                dateFrom={periodState.fromDate}
                dateTo={periodState.toDate}
                onSelectSemester={() =>
                  setPeriodState({
                    reportType: 'semester',
                    month: '',
                    fromDate: '',
                    toDate: ''
                  })
                }
                onSelectMonth={(monthOption) =>
                  setPeriodState({
                    reportType: 'month',
                    month: monthOption.value,
                    fromDate: '',
                    toDate: ''
                  })
                }
                onDateFromChange={(value) =>
                  setPeriodState((previous) => ({
                    ...previous,
                    reportType: 'date-range',
                    fromDate: value
                  }))
                }
                onDateToChange={(value) =>
                  setPeriodState((previous) => ({
                    ...previous,
                    reportType: 'date-range',
                    toDate: value
                  }))
                }
                onApplyDateRange={() =>
                  setPeriodState((previous) => ({
                    ...previous,
                    reportType: 'date-range'
                  }))
                }
              />
            </div>

            {viewType === 'studentwise' && (
              <div className="flex min-w-[260px] flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSearchSubmit();
                      }
                    }}
                    placeholder="Search name and roll no"
                    className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs outline-none transition-colors focus:border-[#08384F]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={!canFetchReport}
                  className="rounded-lg border border-[#1565c0] px-4 py-2 text-xs font-semibold text-[#1565c0] transition-colors hover:bg-[#1565c0] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
                >
                  Search
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={
                !canFetchReport || (viewType === 'studentwise' && !submittedSearch.trim())
              }
              className="ml-auto flex h-10 min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#1565c0] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0d47a1] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Download size={14} />
              Download Report
            </button>
          </div>

          <div className="mx-6 mt-4 flex-1 overflow-auto pb-6">
            {reportSummary ? (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#282526]">
                  <p>{reportSummary.title}</p>
                  <span className="font-semibold text-[#08384F]">
                    {reportSummary.attendancePercentage || 0}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#D6E5F8]">
                  <div
                    className="h-full rounded-full bg-[#1565c0]"
                    style={{ width: `${reportSummary.attendancePercentage || 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            {filtersLoading || reportLoading ? (
              <div className="flex h-[70%] flex-col items-center justify-center gap-4 text-center">
                <img src={homeImg} alt="Loading" className="w-56 opacity-70" />
                <p className="text-sm font-medium text-gray-500">
                  Loading attendance report...
                </p>
              </div>
            ) : showInitialState ? (
              <div className="flex h-[70%] flex-col items-center justify-center gap-4 text-center">
                <img src={homeImg} alt="Attendance" className="w-64" />
                <h2 className="text-xl font-semibold text-[#282526]">
                  Select the Class and Section to view the attendance
                </h2>
                <p className="max-w-xl text-sm text-gray-500">
                  Choose the report type, subject, class, and period to load the
                  faculty attendance report for the current academic year.
                </p>
              </div>
            ) : showStudentwiseEmptyState ? (
              <div className="flex h-[70%] flex-col items-center justify-center gap-4 text-center">
                <img src={homeImg} alt="Search Student" className="w-64" />
                <h2 className="text-xl font-semibold text-[#282526]">
                  Search the Student to view the attendance
                </h2>
                <p className="max-w-xl text-sm text-gray-500">
                  Studentwise reports stay empty until you search by student name,
                  roll number, or register number.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  {viewType === 'classwise' ? (
                    <MonthlyAttendanceTable
                      variant={periodState.reportType === 'semester' ? 'semester' : 'period'}
                      data={reportRows}
                      onViewDetails={(row) => {
                        setDetailDrawer(row.details || null);
                        setDetailSearch('');
                      }}
                      onDownloadRow={handleRowDownload}
                    />
                  ) : (
                    <StudentwiseAttendanceTable
                      variant={periodState.reportType === 'semester' ? 'semester' : 'period'}
                      data={reportRows}
                      onViewDetails={(row) => {
                        setDetailDrawer(row.details || null);
                        setDetailSearch('');
                      }}
                      onDownloadRow={handleRowDownload}
                    />
                  )}
                </div>

                {detailDrawer ? (
                  <DetailDrawer
                    detail={detailDrawer}
                    searchValue={detailSearch}
                    onSearchChange={setDetailSearch}
                    onClose={() => {
                      setDetailDrawer(null);
                      setDetailSearch('');
                    }}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttendanceComponent;
