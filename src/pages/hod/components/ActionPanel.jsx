import React from "react";

const ActionPanel = () => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "8px",
        height: "100%",
      }}
    >
      <h3>Summary</h3>
      <p>
        Select students and use the dropdown to reallocate them to different
        sections.
      </p>
      <button
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Confirm Changes
      </button>
    </div>
  );
};

export default ActionPanel;
