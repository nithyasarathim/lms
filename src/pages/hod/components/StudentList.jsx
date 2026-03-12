import React, { useState } from "react";

const StudentList = ({ selectedSection }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const dummyStudents = [
    { id: 1, regNo: "REG001", name: "John Doe" },
    { id: 2, regNo: "REG002", name: "Jane Smith" },
    { id: 3, regNo: "REG003", name: "Alice Johnson" },
    { id: 4, regNo: "REG004", name: "Bob Brown" },
  ];

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "60%", padding: "8px" }}
        />
        <select style={{ padding: "8px" }}>
          <option>Move to Section A</option>
          <option>Move to Section B</option>
          <option>Move to Section C</option>
          <option>Move to Unallocated</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>
              <input type="checkbox" />
            </th>
            <th style={{ padding: "10px" }}>Reg No</th>
            <th style={{ padding: "10px" }}>Name</th>
          </tr>
        </thead>
        <tbody>
          {dummyStudents.map((student) => (
            <tr key={student.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>
                <input type="checkbox" />
              </td>
              <td style={{ padding: "10px" }}>{student.regNo}</td>
              <td style={{ padding: "10px" }}>{student.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
