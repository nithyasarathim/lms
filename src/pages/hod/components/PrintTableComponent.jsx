import React from "react";
import EshwarImg from "../../../assets/EshwarImg.png";

const PrintTable = React.forwardRef(({ data }, ref) => {
  const {
    academicYear,
    batch,
    semester,
    department,
    section,
    slots,
    timetableData,
    facultyAssignments,
    additionalHours,
    subjects,
    sectionDetails,
  } = data;

  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#000",
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#fff",
  };

  const headerTableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
    fontSize: "11px",
    border: "1px solid #000",
  };

  const mainTableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "10px",
    textAlign: "center",
    marginBottom: "10px",
    border: "1px solid #000",
  };

  const tdStyle = {
    border: "1px solid black",
    padding: "4px 4px",
    verticalAlign: "middle",
  };

  const centerTdStyle = {
    ...tdStyle,
    textAlign: "center",
  };

  const boldTd = {
    ...tdStyle,
    fontWeight: "bold",
  };

  const verticalHeaderTd = {
    ...tdStyle,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const rotatedTextStyle = {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    whiteSpace: "nowrap",
    margin: "0 auto",
    display: "inline-block",
  };

  const headerLabel = {
    fontWeight: "bold",
    display: "inline-block",
  };

  const formatTimeWithAMPM = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayOrder = (day) => {
    const dayMap = {
      MON: "Monday",
      TUE: "Tuesday",
      WED: "Wednesday",
      THU: "Thursday",
      FRI: "Friday",
      SAT: "Saturday",
    };
    return dayMap[day] || day;
  };

  const getShortDesignation = (designation) => {
    if (!designation) return "";
    const map = {
      Professor: "Prof",
      "Associate Professor": "AP",
      "Assistant Professor": "AP",
      HOD: "Prof",
      Dean: "Dean",
      Faculty: "Faculty",
      "Professor of Practice": "PoP",
      "Lab Technician": "LT",
      "Senior Lab Technician": "SLT",
      "Department Secretary": "DS",
    };
    return map[designation] || designation;
  };

  const formatFacultyDisplay = (f) => {
    const name = f.fullName
      ? `${f.salutation || ""} ${f.fullName}`.trim()
      : `${f.salutation || ""} ${f.firstName || ""} ${f.lastName || ""}`.trim();
    const shortDesig = getShortDesignation(f.designation);
    const deptCode = f.departmentId?.code || "";

    let suffix = "";
    if (shortDesig && deptCode) {
      suffix = `, ${shortDesig}/${deptCode}`;
    } else if (shortDesig) {
      suffix = `, ${shortDesig}`;
    } else if (deptCode) {
      suffix = `, /${deptCode}`;
    }

    return `${name}${suffix}`;
  };

  const getCellData = (day, slotOrder) => {
    const cell = timetableData?.[day]?.[slotOrder];
    if (!cell) return null;

    let code = cell.code || "";
    let short = cell.short || "";

    if (
      cell.facultyAssignmentId &&
      typeof cell.facultyAssignmentId === "object"
    ) {
      const subjectId = cell.facultyAssignmentId.subjectComponentId?.subjectId;
      const component = cell.facultyAssignmentId.subjectComponentId;
      code = subjectId?.code || code;
      short = component?.shortName || subjectId?.shortName || short;
    } else if (
      cell.additionalHourId &&
      typeof cell.additionalHourId === "object"
    ) {
      code = cell.additionalHourId.shortName || code;
      short = cell.additionalHourId.shortName || short;
    }

    return { code, short };
  };

  const getFacultyNames = (fa) => {
    if (!fa?.facultyIds || fa.facultyIds.length === 0) return "";
    return fa.facultyIds.map((f) => formatFacultyDisplay(f)).join("<br/>");
  };

  const getFacultyNamesForAdditional = (ah) => {
    if (!ah?.facultyIds || ah.facultyIds.length === 0) return "";
    return ah.facultyIds.map((f) => formatFacultyDisplay(f)).join("<br/>");
  };

  const getCourseCategory = (sub) => {
    if (sub.courseCategory === "Professional Core") return "PC";
    if (sub.courseCategory === "Professional Elective") return "PE";
    if (sub.courseCategory === "Project") return "PW";
    return sub.courseCategory || "--";
  };

  const groupedSubjects = () => {
    const groups = {
      "THEORY COURSES": [],
      "THEORY CUM PRACTICAL COURSES": [],
      "THEORY WITH PRACTICAL AND PROJECT COURSES": [],
      "PRACTICAL COURSES": [],
      "PROJECT WORK": [],
      "PROFESSIONAL ELECTIVE II COURSES": [],
      "ADDITIONAL HOURS": [],
    };

    const processedSubjects = new Set();

    facultyAssignments.forEach((fa) => {
      const sub = fa.subjectComponentId?.subjectId;
      const comp = fa.subjectComponentId;
      if (!sub || !comp) return;

      const subId = sub._id || sub.id;
      if (!processedSubjects.has(subId)) {
        processedSubjects.add(subId);

        const course = subjects.find((s) => (s._id || s.id) === subId);
        if (!course) return;

        const components = facultyAssignments.filter(
          (f) =>
            (f.subjectComponentId?.subjectId?._id ||
              f.subjectComponentId?.subjectId?.id) === subId,
        );

        const courseObj = {
          shortName: sub.shortName || sub.code,
          name: sub.name,
          code: sub.code,
          category: getCourseCategory(sub),
          credits: sub.credits,
          components: components.map((c) => ({
            compName: c.subjectComponentId?.name,
            shortName: c.subjectComponentId?.shortName,
            faculties: getFacultyNames(c),
            venue: c.venue || "",
            hours: c.subjectComponentId?.hours || 0,
          })),
        };

        const types = components.map(
          (c) => c.subjectComponentId?.componentType,
        );

        if (
          types.includes("THEORY") &&
          types.includes("PRACTICAL") &&
          types.includes("PROJECT")
        ) {
          groups["THEORY WITH PRACTICAL AND PROJECT COURSES"].push(courseObj);
        } else if (types.includes("THEORY") && types.includes("PRACTICAL")) {
          groups["THEORY CUM PRACTICAL COURSES"].push(courseObj);
        } else if (
          types.includes("THEORY") &&
          sub.courseCategory === "Professional Elective"
        ) {
          groups["PROFESSIONAL ELECTIVE II COURSES"].push(courseObj);
        } else if (types.includes("PRACTICAL") && !types.includes("THEORY")) {
          groups["PRACTICAL COURSES"].push(courseObj);
        } else if (types.includes("PROJECT")) {
          groups["PROJECT WORK"].push(courseObj);
        } else if (types.includes("THEORY")) {
          groups["THEORY COURSES"].push(courseObj);
        }
      }
    });

    additionalHours.forEach((ah) => {
      groups["ADDITIONAL HOURS"].push({
        shortName: ah.shortName,
        name: ah.name,
        code: ah.shortName,
        category: "--",
        credits: "-",
        components: [
          {
            compName: ah.name,
            shortName: ah.shortName,
            faculties: getFacultyNamesForAdditional(ah),
            venue: ah.venue || "",
            hours: ah.hours || 0,
          },
        ],
      });
    });

    return groups;
  };

  const courseGroups = groupedSubjects();
  const sortedSlots = [...slots].sort((a, b) => a.order - b.order);

  return (
    <div style={containerStyle} ref={ref}>
      <style>
        {`
          @media print {
            @page {
              margin: 10mm;
            }
            body {
              margin: 0;
            }
          }
        `}
      </style>
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "5px",
          }}
        >
          <img
            src={EshwarImg}
            alt="Sri Eshwar Logo"
            style={{ height: "60px" }}
          />
        </div>
        <h3 style={{ margin: "5px 0", fontSize: "14px", fontWeight: "bold" }}>
          Department of {department?.name || "Computer Science and Engineering"}
        </h3>
        <p style={{ margin: "2px 0", fontSize: "12px", fontWeight: "bold" }}>
          Batch : {batch?.name || ""} :{" "}
          {batch?.startYear && batch?.endYear
            ? `${batch.startYear} - ${batch.endYear}`
            : ""}{" "}
          / Semester {semester} [Academic Year: {academicYear?.name || ""}]
        </p>
        <p style={{ margin: "2px 0", fontSize: "12px", fontWeight: "bold" }}>
          Class Timetable - Academic Schedule
        </p>
      </div>

      <table style={headerTableStyle}>
        <tbody>
          <tr>
            <td style={{ ...boldTd, width: "20%", textAlign: "center" }}>
              Semester : {semester}
              <br />
              Section : {section?.name || ""}
              <br />
              Classroom : [{sectionDetails?.venue || "N/A"}]
            </td>
            <td style={{ ...tdStyle, width: "60%", textAlign: "left" }}>
              <span style={headerLabel}>Class Advisor:</span>{" "}
              {sectionDetails?.advisor
                ? (() => {
                    const advisor = facultyAssignments.find(
                      (f) => f._id === sectionDetails.advisor,
                    )?.facultyIds?.[0];
                    return advisor ? formatFacultyDisplay(advisor) : "N/A";
                  })()
                : "N/A"}
              <br />
              <span style={headerLabel}>Class Tutors:</span>{" "}
              {sectionDetails?.tutors
                ?.map((tId) => {
                  const tutor = facultyAssignments.find((f) => f._id === tId)
                    ?.facultyIds?.[0];
                  return tutor ? formatFacultyDisplay(tutor) : "";
                })
                .filter(Boolean)
                .join(", ") || "N/A"}
            </td>
            <td style={{ ...tdStyle, width: "20%", textAlign: "center" }}>
              <span style={headerLabel}>
                Class Strength:
                {sectionDetails?.studentCount || section?.studentCount || ""}
              </span>
              <br />
              Ver 1.0
              <br />
              {new Date().toLocaleDateString("en-GB")}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={mainTableStyle}>
        <thead>
          <tr>
            <td style={boldTd} rowSpan={2}>
              Day Order
            </td>
            {sortedSlots.map((slot) => {
              if (slot.type === "class") {
                const classNumber =
                  sortedSlots.filter(
                    (s, idx) => idx < slot.order && s.type === "class",
                  ).length + 1;
                return (
                  <td key={slot.order} style={boldTd}>
                    {classNumber}
                  </td>
                );
              } else if (slot.type === "break" || slot.type === "lunch") {
                return (
                  <td key={slot.order} style={verticalHeaderTd} rowSpan={2}>
                    {formatTimeWithAMPM(slot.startTime)}
                    <br />
                    to
                    <br />
                    {formatTimeWithAMPM(slot.endTime)}
                  </td>
                );
              }
              return null;
            })}
          </tr>
          <tr>
            {sortedSlots.map((slot) => {
              if (slot.type === "class") {
                return (
                  <td key={slot.order} style={tdStyle}>
                    <b>
                      {formatTimeWithAMPM(slot.startTime)}
                      <br />
                      to
                      <br />
                      {formatTimeWithAMPM(slot.endTime)}
                    </b>
                  </td>
                );
              }
              return null;
            })}
          </tr>
        </thead>
        <tbody>
          {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, dayIndex) => {
            return (
              <tr key={day}>
                <td style={boldTd}>{getDayOrder(day)}</td>

                {sortedSlots.map((slot) => {
                  if (slot.type === "class") {
                    const cellData = getCellData(day, slot.order);
                    return (
                      <td key={`${day}-${slot.order}`} style={tdStyle}>
                        {cellData?.short || ""}
                      </td>
                    );
                  }

                  if (slot.type === "break" || slot.type === "lunch") {
                    if (dayIndex === 0) {
                      return (
                        <td
                          key={slot.order}
                          style={verticalHeaderTd}
                          rowSpan={6}
                        >
                          <span style={rotatedTextStyle}>
                            {slot.type.toUpperCase()}
                          </span>
                        </td>
                      );
                    }
                    return null;
                  }

                  return null;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <table style={{ ...mainTableStyle, textAlign: "left" }}>
        <thead>
          <tr>
            <td
              style={{
                ...boldTd,
                backgroundColor: "#f0f0f0",
                textAlign: "center",
              }}
            >
              Short Name
            </td>
            <td style={{ ...boldTd, backgroundColor: "#f0f0f0" }}>
              Course Title
            </td>
            <td style={{ ...boldTd, backgroundColor: "#f0f0f0" }}>
              Faculty Incharge
            </td>
            <td
              style={{
                ...boldTd,
                backgroundColor: "#f0f0f0",
                textAlign: "center",
              }}
            >
              Venue
            </td>
            <td
              style={{
                ...boldTd,
                backgroundColor: "#f0f0f0",
                textAlign: "center",
              }}
            >
              Category
            </td>
            <td
              style={{
                ...boldTd,
                backgroundColor: "#f0f0f0",
                textAlign: "center",
              }}
            >
              Credits
            </td>
            <td
              style={{
                ...boldTd,
                backgroundColor: "#f0f0f0",
                textAlign: "center",
              }}
            >
              No. of Hrs
            </td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(courseGroups).map(
            ([groupName, courses]) =>
              courses.length > 0 && (
                <React.Fragment key={groupName}>
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        ...tdStyle,
                        fontWeight: "bold",
                        textAlign: "left",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      {groupName}
                    </td>
                  </tr>
                  {courses.map((course, idx) =>
                    course.components.map((comp, compIdx) => (
                      <tr key={`${idx}-${compIdx}`}>
                        {compIdx === 0 && (
                          <td
                            style={centerTdStyle}
                            rowSpan={course.components.length}
                          >
                            {course.shortName}
                          </td>
                        )}
                        <td style={tdStyle}>{comp.compName}</td>
                        <td
                          style={tdStyle}
                          dangerouslySetInnerHTML={{ __html: comp.faculties }}
                        />
                        <td style={centerTdStyle}>{comp.venue}</td>
                        {compIdx === 0 && (
                          <>
                            <td
                              style={centerTdStyle}
                              rowSpan={course.components.length}
                            >
                              {course.category}
                            </td>
                            <td
                              style={centerTdStyle}
                              rowSpan={course.components.length}
                            >
                              {course.credits}
                            </td>
                          </>
                        )}
                        <td style={centerTdStyle}>{comp.hours}</td>
                      </tr>
                    )),
                  )}
                </React.Fragment>
              ),
          )}
        </tbody>
      </table>
    </div>
  );
});

PrintTable.displayName = "PrintTable";

export default PrintTable;
