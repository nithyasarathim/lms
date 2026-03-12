import React from "react";

const YearSelector = ({
  years,
  sections,
  selectedYear,
  setSelectedYear,
  setSelectedSection,
}) => {
  return (
    <div
      style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
    >
      <h3>Years</h3>
      {years.map((year) => (
        <div
          key={year}
          onClick={() => setSelectedYear(year)}
          style={{
            padding: "10px",
            cursor: "pointer",
            backgroundColor: selectedYear === year ? "#e0e0e0" : "transparent",
          }}
        >
          {year}
        </div>
      ))}
      <hr />
      <h3>Sections</h3>
      {sections.map((sec) => (
        <div
          key={sec}
          onClick={() => setSelectedSection(sec)}
          style={{
            padding: "10px",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
          }}
        >
          {sec}
        </div>
      ))}
    </div>
  );
};

export default YearSelector;
