import React from "react";
import EshwarImg from "../../../assets/EshwarImg.png";

const FacultyPrintTable = React.forwardRef(({ data }, ref) => {
  const { facultyName, designation, department, timetable, academicYear } = data;

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
    padding: "6px 4px",
    verticalAlign: "middle",
    height: "60px",
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

  const formatTimeWithAMPM = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getRomanYear = (sem) => {
    const year = Math.ceil(sem / 2);
    const roman = ["", "I", "II", "III", "IV"];
    return roman[year] || year;
  };

  const sortedSlots = [...(timetable?.slots || [])].sort((a, b) => a.order - b.order);

  return (
    <div style={containerStyle} ref={ref}>
      <style>
        {`
          @media print {
            @page { margin: 10mm; }
            body { margin: 0; }
          }
        `}
      </style>

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <img src={EshwarImg} alt="Logo" style={{ height: "60px", marginBottom: "5px" }} />
        <h3 style={{ margin: "5px 0", fontSize: "14px", fontWeight: "bold" }}>
          Department of {department || "Computer Science and Engineering"}
        </h3>
        <p style={{ margin: "2px 0", fontSize: "12px", fontWeight: "bold" }}>
          Faculty Individual Timetable [Academic Year: {academicYear || ""}]
        </p>
      </div>

      <table style={headerTableStyle}>
        <tbody>
          <tr>
            <td style={{ ...boldTd, width: "40%" }}>
              Faculty Name: {facultyName}
              <br />
              Designation: {designation}
            </td>
            <td style={{ ...boldTd, width: "30%", textAlign: "center" }}>
              Department: {department}
            </td>
            <td style={{ ...boldTd, width: "30%", textAlign: "center" }}>
              Date of Print:
              <br />
              {new Date().toLocaleDateString("en-GB")}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={mainTableStyle}>
        <thead>
          <tr>
            <td style={boldTd} rowSpan={2}>Day Order</td>
            {sortedSlots.map((slot) => {
              if (slot.type === "class") {
                const classNumber = sortedSlots.filter((s, idx) => idx < sortedSlots.indexOf(slot) && s.type === "class").length + 1;
                return <td key={slot.order} style={boldTd}>{classNumber}</td>;
              } else {
                return (
                  <td key={slot.order} style={verticalHeaderTd} rowSpan={2}>
                    {formatTimeWithAMPM(slot.startTime)} - {formatTimeWithAMPM(slot.endTime)}
                  </td>
                );
              }
            })}
          </tr>
          <tr>
            {sortedSlots.map((slot) => (
              slot.type === "class" ? (
                <td key={slot.order} style={tdStyle}>
                  <b>{formatTimeWithAMPM(slot.startTime)}<br/>to<br/>{formatTimeWithAMPM(slot.endTime)}</b>
                </td>
              ) : null
            ))}
          </tr>
        </thead>
        <tbody>
          {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, dayIndex) => (
            <tr key={day}>
              <td style={boldTd}>{day}</td>
              {sortedSlots.map((slot) => {
                if (slot.type === "class") {
                  const items = timetable?.grid?.[day]?.[slot.order] || [];
                  return (
                    <td key={`${day}-${slot.order}`} style={tdStyle}>
                      {items.map((item, i) => (
                        <div key={i} style={{ fontSize: "9px" }}>
                          <div style={{ fontWeight: "bold" }}>{item.subjectShortName || item.subjectCode}</div>
                          <div>{getRomanYear(item.semesterNumber)} - {item.departmentCode} - {item.sectionName}</div>
                          <div style={{ fontSize: "8px", fontStyle: "italic" }}>{item.venue || "TBA"}</div>
                        </div>
                      ))}
                    </td>
                  );
                }
                if (dayIndex === 0 && (slot.type === "break" || slot.type === "lunch")) {
                  return (
                    <td key={slot.order} style={verticalHeaderTd} rowSpan={6}>
                      <span style={rotatedTextStyle}>{slot.type.toUpperCase()}</span>
                    </td>
                  );
                }
                return null;
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold" }}>
        <div style={{ textAlign: "center" }}>
          <br /><br />
          Faculty Signature
        </div>
        <div style={{ textAlign: "center" }}>
          <br /><br />
          Timetable Coordinator
        </div>
        <div style={{ textAlign: "center" }}>
          <br /><br />
          HoD / {department}
        </div>
      </div>
    </div>
  );
});

FacultyPrintTable.displayName = "FacultyPrintTable";

export default FacultyPrintTable;