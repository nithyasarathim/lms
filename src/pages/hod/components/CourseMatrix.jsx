import React from "react";
import MatrixSection from "./MatrixSection";

const CourseMatrix = ({
  matrixData,
  facultyVenues,
  onVenueChange,
  additionalHours,
  onAdditionalVenueChange,
  allAvailableFaculties,
  onAddAdditional,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <MatrixSection
        title="THEORY COURSES"
        data={matrixData.theory}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="THEORY CUM PRACTICAL COURSES"
        data={matrixData.theoryCumLab}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="THEORY WITH PRACTICAL AND PROJECT COURSES"
        data={matrixData.theoryLabProject}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="PRACTICAL COURSES"
        data={matrixData.practical}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="PROJECT WORK"
        data={matrixData.project}
        facultyVenues={facultyVenues}
        onVenueChange={onVenueChange}
        allAvailableFaculties={allAvailableFaculties}
      />
      <MatrixSection
        title="ADDITIONAL HOURS"
        data={matrixData.additional}
        isAdditional
        additionalHours={additionalHours}
        onAdditionalVenueChange={onAdditionalVenueChange}
        allAvailableFaculties={allAvailableFaculties}
        onAddAdditional={onAddAdditional}
      />
    </div>
  );
};

export default CourseMatrix;
