export const generateCoursePlanPDF = (data, classroom) => {
  const { coursePlan, currentUserDetails } = data;
  console.log(coursePlan);
  const academicYear =
    classroom?.academicYearId?.name ||
    coursePlan?.academicYearId?.name ||
    '2025 - 2026';
  const program = 'B.E. CSE';
  const courseCode = coursePlan?.subjectId?.code || '';
  const courseTitle = coursePlan?.subjectId?.name || '';
  const courseType =
    coursePlan?.subjectId?.deliveryType ||
    coursePlan?.courseDetails?.courseType ||
    '';
  const logoUrl =
    'https://res.cloudinary.com/dkro770eh/image/upload/v1775755588/EshwarImg_qmcnsi.png';

  // Faculty mapping
  const primaryFaculty =
    coursePlan?.faculties?.find((f) => f.isPrimary) ||
    coursePlan?.faculties?.[0];
  const facultyName =
    primaryFaculty?.facultyId?.fullName || currentUserDetails?.fullName || '';
  const facultyDesignation =
    primaryFaculty?.facultyId?.designation ||
    currentUserDetails?.designation ||
    '';
  const facultyDepartment = 'CSE';

  // Course Outcomes
  const courseOutcomes = coursePlan?.courseDetails?.outcomes || [];
  const courseOutcomesRows = courseOutcomes
    .map(
      (co, idx) => `
    <tr>
      <td style="text-align: center;">${courseCode ? `${courseCode}.${idx + 1}` : idx + 1}</td>
      <td style="text-align: left;">${co.statement}</td>
      <td style="text-align: center;">${co.rtbl}</td>
    </tr>
  `
    )
    .join('');

  // CO-PO Mapping Table with averages
  const coPoMappingList = coursePlan?.coPoMapping || [];
  const poHeaders = Array.from(
    { length: 11 },
    (_, i) => `PO-${String(i + 1).padStart(2, '0')}`
  );
  const psoHeaders = ['PSO-01', 'PSO-02', 'PSO-03'];
  const allHeaders = [...poHeaders, ...psoHeaders];

  const getCreditByHeader = (mappings, header) => {
    if (!mappings) return null;
    const compact = header.replace(/-/g, '');
    const short = compact.replace(/^([A-Z]+)0+(\d+)$/, '$1$2');
    const candidates = [header, compact, short];

    for (const key of candidates) {
      if (
        mappings[key]?.credit !== undefined &&
        mappings[key]?.credit !== null
      ) {
        return mappings[key].credit;
      }
    }

    return null;
  };

  // Build table rows and collect column sums for averages
  let coPoRows = '';
  const colSums = new Array(allHeaders.length).fill(0);
  let validColCounts = new Array(allHeaders.length).fill(0);

  coPoMappingList.forEach((mapping) => {
    const coId = mapping.coId;
    const coCode =
      courseOutcomes.find((co) => co._id === coId)?.code || coId.slice(-4);
    const credits = allHeaders.map((header, idx) => {
      const rawCredit = getCreditByHeader(mapping.mappings, header);
      const numericCredit =
        rawCredit === null || rawCredit === '' ? NaN : Number(rawCredit);

      if (!Number.isNaN(numericCredit)) {
        colSums[idx] += numericCredit;
        validColCounts[idx]++;
      }

      return Number.isNaN(numericCredit) ? '-' : numericCredit;
    });
    coPoRows += `
      <tr>
        <td style="text-align: center;">${coCode}</td>
        ${credits.map((c) => `<td style="text-align: center;">${c}</td>`).join('')}
      </tr>
    `;
  });

  // Calculate averages (rounded to nearest whole number)
  const averages = colSums.map((sum, idx) => {
    const count = validColCounts[idx];
    if (count === 0) return '-';
    const avg = sum / count;
    return Math.round(avg);
  });

  // Add average row
  coPoRows += `
    <tr>
      <td style="text-align: center; font-weight: bold;">Average</td>
      ${averages.map((avg) => `<td style="text-align: center;">${avg}</td>`).join('')}
    </tr>
  `;

  // CO-PO Justification
  const justificationRows = coPoMappingList
    .map((mapping) => {
      const coCode =
        courseOutcomes.find((co) => co._id === mapping.coId)?.code ||
        mapping.coId.slice(-4);
      const justifications = Object.entries(mapping.mappings || {})
        .filter(([_, val]) => val?.justification)
        .map(
          ([key, val]) => `<strong>${key}:</strong> ${val.justification}<br/>`
        )
        .join('');
      return `
      <tr>
        <td style="text-align: center; vertical-align: top;">${coCode}</td>
        <td style="text-align: justify; padding: 8px;">${justifications || '—'}</td>
      </tr>
    `;
    })
    .join('');

  // Helper: convert number to Roman numeral (1=I, 2=II, ...)
  const toRoman = (num) => {
    const romanMap = [
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ];
    let result = '';
    for (const { value, symbol } of romanMap) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  };

  // Syllabus rows: unit numbers in Roman, topics as long-dash separated string
  const theoryUnits = coursePlan?.theory || [];
  let syllabusRows = '';
  theoryUnits.forEach((unit, idx) => {
    const unitNumRoman = toRoman(idx + 1);
    const topicsString = unit.topics
      .map((topic) => `– ${topic.title}`)
      .join(' ');
    syllabusRows += `
      <tr>
        <td colspan="10" class="unit-row" style="background-color: #f5f5f5; font-weight: bold;">Unit ${unitNumRoman}: ${unit.unitTitle}</td>
      </tr>
      <tr>
        <td colspan="10" class="unit-content">${topicsString || 'No topics listed'}</td>
      </tr>
    `;
  });

  // Textbooks & References as separate rows inside experiments table
  const textbooks = coursePlan?.references?.textBooks || [];
  const refBooks = coursePlan?.references?.referenceBooks || [];
  const journals = coursePlan?.references?.journals || [];
  const webResources = coursePlan?.references?.webResources || [];
  const onlineCourses = coursePlan?.references?.onlineCourses || [];

  const dynamicReferenceRows = `
    <tr>
      <td style="padding: 4px 8px;"><strong>Text Books:</strong><br/></td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;">${textbooks.map((t) => `<strong>${t.code}</strong>: ${t.title}`).join('<br/>') || 'None'}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>References:</strong><br/></td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>Reference Books:</strong><br/>${refBooks.map((r) => `<strong>${r.code}</strong>: ${r.title}`).join('<br/>') || 'None'}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>Journals:</strong><br/>${journals.map((j, idx) => `${idx + 1}. ${j}`).join('<br/>') || 'None'}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>Web Resources:</strong><br/>${webResources.map((w, idx) => `${idx + 1}. ${w}`).join('<br/>') || 'None'}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>MOOC/NPTEL/SWAYAM Courses:</strong><br/>${onlineCourses.map((c, idx) => `${idx + 1}. ${c.platform}: ${c.name}`).join('<br/>') || 'None'}</td>
    </tr>
  `;

  // Sample projects as numbered list
  const sampleProjectsList = coursePlan?.references?.projects || [];
  const sampleProjectsHtml =
    sampleProjectsList.length > 0
      ? `<ol style="margin: 5px 0 5px 20px;">${sampleProjectsList
          .map((p) => `<li>${p}</li>`)
          .join('')}</ol>`
      : '<p>None</p>';

  // Experiments as numbered list (within experiments table)
  const labExperiments = coursePlan?.lab || [];
  let experimentsHtml =
    '<ol style="margin: 5px 0 5px 20px; text-align: justify;">';
  labExperiments.forEach((lab) => {
    lab.experiments.forEach((exp) => {
      experimentsHtml += `<li>${exp.title}</li>`;
    });
  });
  experimentsHtml += '</ol>';

  // Gap & Beyond Syllabus
  const gapIdentification =
    coursePlan?.references?.gapIdentification?.entry || '—';
  const contentBeyondSyllabus = coursePlan?.references?.beyondSyllabus || '—';

  // Lesson Plan (Theory) with unit headers
  let lessonPlanRows = '';
  let sno = 1;
  theoryUnits.forEach((unit, idx) => {
    const unitNumRoman = toRoman(idx + 1);
    // Add unit header row (colspan=7)
    lessonPlanRows += `
      <tr>
        <td colspan="7" style="background-color: #e0e0e0; font-weight: bold; text-align: left;">UNIT ${unitNumRoman}: ${unit.unitTitle}</td>
      </tr>
    `;
    // Add topic rows
    unit.topics.forEach((topic) => {
      const coCode =
        courseOutcomes.find((co) => co._id === unit.coId)?.code || '';
      const references = Array.isArray(topic.references)
        ? topic.references.join(', ')
        : '';
      const plannedDate = topic.plannedDate
        ? new Date(topic.plannedDate).toLocaleDateString()
        : '';
      lessonPlanRows += `
        <tr>
          <td style="text-align: center;">${sno++}</td>
          <td style="text-align: center;">${coCode}</td>
          <td style="text-align: justify; padding: 8px;">${topic.title}</td>
          <td style="text-align: left;">${topic.learningStrategy || ''}</td>
          <td style="text-align: left;">${references}</td>
          <td style="text-align: center;">${plannedDate}</td>
          <td style="text-align: center;"></td>
        </tr>
      `;
    });
  });

  // Lesson Plan (Practical)
  let practicalRows = '';
  let pracSno = 1;
  labExperiments.forEach((lab) => {
    const coCode = courseOutcomes.find((co) => co._id === lab.coId)?.code || '';
    lab.experiments.forEach((exp) => {
      practicalRows += `
        <tr>
          <td style="text-align: center;">${pracSno++}</td>
          <td style="text-align: center;">${coCode}</td>
          <td style="text-align: justify; padding: 8px;">${exp.title}</td>
          <td style="text-align: left;"></td>
          <td style="text-align: center;">${
            exp.plannedDate
              ? new Date(exp.plannedDate).toLocaleDateString()
              : ''
          }</td>
          <td style="text-align: center;"></td>
        </tr>
      `;
    });
  });

  // Term Work & Self Learning
  const termWorkActivity = coursePlan?.references?.termWork?.activity || '';
  const termWorkRows = `
    <tr>
      <td style="text-align: center;">1</td>
      <td class="text-left">${termWorkActivity || 'Project based on UML modeling concepts with SDLC approach'}</td>
      <td style="text-align: center;">K4/K5</td>
      <td style="text-align: center;">CO1 – CO5</td>
      <td class="text-left">PO1, PO2, PO3, PO4, PO5, PO6, PO8, PO9, PO10, PO12<br/>PSO1, PSO2, PSO3</td>
    </tr>
  `;

  // Assessments & Activities dates
  const assessments = coursePlan?.assessments || [];
  const assessmentRows = assessments
    .map(
      (ass, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td class="text-left">${ass.name}</td>
      <td style="text-align: center;">${
        ass.proposedDate ? new Date(ass.proposedDate).toLocaleDateString() : ''
      }</td>
      <td style="text-align: center;">${
        ass.actualDate ? new Date(ass.actualDate).toLocaleDateString() : ''
      }</td>
      <td style="text-align: left;">${ass.changeReason || ''}</td>
    </tr>
  `
    )
    .join('');

  const activities = coursePlan?.activities || [];
  const activityRows = activities
    .map(
      (act, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td class="text-left">${act.name}</td>
      <td style="text-align: center;">${
        act.proposedDate
          ? new Date(act.proposedDate).toLocaleDateString()
          : 'NA'
      }</td>
      <td style="text-align: center;">${
        act.actualDate ? new Date(act.actualDate).toLocaleDateString() : ''
      }</td>
      <td style="text-align: left;">${act.changeReason || ''}</td>
    </tr>
  `
    )
    .join('');

  // Credits
  const credits = {
    L: coursePlan?.subjectId?.credits?.L || 3,
    T: coursePlan?.subjectId?.credits?.T || 0,
    P: coursePlan?.subjectId?.credits?.P || 0,
    J: coursePlan?.subjectId?.credits?.J || 0,
    TW: coursePlan?.subjectId?.credits?.TW || 0,
    SL: coursePlan?.subjectId?.credits?.SL || 0,
    TH: coursePlan?.subjectId?.credits?.TH || 3,
    C: coursePlan?.subjectId?.credits?.total || 4
  };

  // Full HTML with Times New Roman font
  const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Course Plan - ${courseTitle}</title>
  <style>
    /* =========================
       ROOT VARIABLES
    ========================= */
    :root {
      --border-color: #000;
      --table-header: #f2f2f2;
      --heading-size: 16px;
      --heading-font-weight: 600;
      --font-table-header: 14px;
      --font-table-body: 12px;
    }

    /* =========================
       GLOBAL
    ========================= */
    html, body {
      margin: 0;
      padding: 10px;
      font-family: 'Times New Roman', Times, serif;
    }

    /* =========================
       PAGE SETUP
    ========================= */
    @page {
      size: A4;
      margin: 20mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .po-table {
        transform: scale(0.85);
        transform-origin: top left;
        width: 118%;
      }
      .tw-sl-table, .assessment-dates-table, .signature-section {
        page-break-inside: avoid;
      }
      .experiments-no-break {
        page-break-inside: auto;
      }
    }

    /* =========================
       LAYOUT
    ========================= */
    .main-container {
      padding: 0 20px;
    }
    .page-break {
      page-break-after: always;
    }
    .heading {
      font-weight: var(--heading-font-weight);
      font-size: var(--heading-size);
    }

    /* =========================
       HEADER
    ========================= */
    .logo {
      width: 380px;
    }
    .header-1 {
      font-size: 12px;
      display: flex;
      justify-content: flex-end;
      font-weight: 500;
    }
    .logo-container {
      margin-top: 10px;
      padding-bottom: 10px;
      text-align: center;
    }
    .main-title {
      margin-top: 10px;
      background-color: #f2f2f2;
      color: #000;
      font-size: 22px;
      text-align: center;
      border-radius: 2px;
      padding: 6px;
      font-weight: var(--heading-font-weight);
    }

    /* =========================
       FIRST INFO TABLE
    ========================= */
    .first-table-title {
      font-weight: 500;
    }
    .first-table-description {
      color: rgb(67, 67, 67);
      padding: 0 10px;
    }

    /* =========================
       TABLE BASE
    ========================= */
    .table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border-color);
      color: #000;
      margin-bottom: 15px;
    }
    .table th {
      padding: 8px 12px;
      text-align: center;
      border: 1px solid var(--border-color);
      font-weight: 500;
      font-size: var(--font-table-header);
      background-color: var(--table-header);
      color: #000;
    }
    .table td {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      font-size: var(--font-table-body);
    }
    thead {
      background-color: var(--table-header);
      color: #000;
    }

    /* =========================
       SPECIAL TABLES
    ========================= */
    #faculty-name-table {
      margin-top: 10px;
    }
    .td {
      text-align: center;
      padding: 8px;
    }
    .po-table .sm {
      font-size: 10px;
    }

    /* =========================
       TEXT HELPERS
    ========================= */
    .li-mt {
      margin-top: 10px;
    }
    li {
      margin-top: 6px;
      list-style-type: none;
    }
    .left-text {
      list-style-type: none;
      margin-left: 20px;
    }
    .vision-container {
      text-align: justify;
    }
    .vision-container > ol {
      margin: 0;
      padding-left: 0;
    }
    .vision-container > ol > li > ul {
      margin: 6px 0 0;
      padding-left: 20px;
    }
    .vision-container > ol > li:nth-child(2) > ul,
    .vision-container > ol > li:nth-child(4) > ul {
      list-style-type: disc;
      padding-left: 22px;
    }
    .vision-container > ol > li:nth-child(2) > ul > li,
    .vision-container > ol > li:nth-child(4) > ul > li {
      list-style-type: disc;
      display: list-item;
    }
    .course-details-section {
      text-align: justify;
    }
    .text-left {
      text-align: left !important;
    }
    .text-left td {
      text-align: left;
      vertical-align: top;
      line-height: 1.4;
    }

    /* =========================
       EXPERIMENTS
    ========================= */
    .experiments-table td {
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 10px;
      font-size: var(--font-table-body);
    }
    .experiments-no-break {
      page-break-inside: auto;
    }
    .experiments-table ol {
      padding-left: 22px;
      margin: 5px 0 5px 20px;
      list-style-type: decimal;
      list-style-position: outside;
    }
    .experiments-table ol li {
      list-style-type: decimal;
      display: list-item;
      margin-top: 4px;
    }
    .main-point {
      margin: 4px 0 2px 10px;
      font-weight: 500;
    }
    .sub-point {
      padding-left: 40px;
      margin: 2px 0;
      display: block;
    }

    /* =========================
       COURSE OUTCOME TABLE
    ========================= */
    .course-outcome-table td:nth-child(2), .course-outcome-table th:nth-child(2) {
      text-align: left;
    }

    /* =========================
       SYLLABUS TABLE
    ========================= */
    .syllabus-main-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .syllabus-main-table td {
      border: 1px solid #000;
      text-align: center;
      vertical-align: middle;
      padding: 4px !important;
      font-size: var(--font-table-body);
    }
    .syllabus-code { width: 15%; }
    .syllabus-title { width: 45%; padding-left: 10px !important; }
    .credit-label { font-weight: bold; background-color: #fff; }
    .credit-box { width: 5%; font-size: 12px; }
    .unit-row, .unit-content {
      padding: 6px !important;
      text-align: left !important;
    }
    .unit-content {
      text-align: justify !important;
    }

    /* =========================
       ASSESSMENT TABLE
    ========================= */
    .assessment-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    .assessment-table th, .assessment-table td {
      border: 1px solid #000;
      text-align: center;
      padding: 4px 2px;
      font-size: var(--font-table-body);
    }
    .bg-gray { background-color: #f2f2f2; font-weight: bold; color: #000; }

    /* =========================
       LESSON PLAN TABLE
    ========================= */
    .lesson-plan-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      table-layout: fixed;
    }
    .lesson-plan-table th:nth-child(1), .lesson-plan-table td:nth-child(1) { width: 5%; }
    .lesson-plan-table th:nth-child(2), .lesson-plan-table td:nth-child(2) { width: 5%; }
    .lesson-plan-table th:nth-child(3), .lesson-plan-table td:nth-child(3) { width: 40%; }
    .lesson-plan-table th:nth-child(4), .lesson-plan-table td:nth-child(4) { width: 15%; }
    .lesson-plan-table th:nth-child(5), .lesson-plan-table td:nth-child(5) { width: 10%; }
    .lesson-plan-table th:nth-child(6), .lesson-plan-table td:nth-child(6) { width: 12.5%; }
    .lesson-plan-table th:nth-child(7), .lesson-plan-table td:nth-child(7) { width: 12.5%; }

    /* =========================
       TERM WORK & ASSESSMENT DATES
    ========================= */
    .tw-sl-table, .assessment-dates-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    .tw-sl-table th, .tw-sl-table td, .assessment-dates-table th, .assessment-dates-table td {
      border: 1px solid #000;
      padding: 8px 5px;
      text-align: center;
      vertical-align: middle;
      font-size: var(--font-table-body);
    }

    /* =========================
       SIGNATURE
    ========================= */
    .signature-section {
      margin-top: 40px;
      font-size: 14px;
    }
    .sig-row {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .sig-col {
      width: 45%;
    }
    .sig-space {
      height: 60px;
    }
    .sig-divider {
      border: 0;
      border-top: 1.5px solid #000;
      margin: 40px 0 20px;
    }
    .footer-page {
      text-align: right;
      margin-top: 50px;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 5px;
    }
  </style>
</head>
<body>
<div class="main-container">
  <!-- Header Section -->
  <div class="header-container">
    <div class="header-1">
      <p class="copyright">© Sri Eshwar College of Engineering, Form No AC 08: Rev. No. 06: Rev.dt.21-01-2025</p>
    </div>
    <div class="logo-container">
      <img src="${logoUrl}" class="logo" alt="Logo" style="max-width: 300px;" />
    </div>
  </div>
  <div class="title-container">
    <p class="main-title">COURSE PLAN</p>
  </div>

  <!-- Basic Info Table -->
  <table class="table">
    <tr><td class="first-table-title">Academic Year :</td><td class="first-table-description">${academicYear}</td></tr>
    <tr><td class="first-table-title">Program :</td><td class="first-table-description">${program}</td></tr>
    <tr><td class="first-table-title">Year & Semester :</td><td class="first-table-description">III & VI</td></tr>
    <tr><td class="first-table-title">Course Code & Title :</td><td class="first-table-description">${courseCode} & ${courseTitle}</td></tr>
    <tr><td class="first-table-title">Faculty Name :</td><td class="first-table-description">${facultyName}</td></tr>
  </table>

  <!-- Faculty Table -->
  <table id="faculty-name-table" class="table">
    <thead><tr><th>S.NO</th><th>Name</th><th>Designation & Dept</th></tr></thead>
    <tbody>
      <tr><td class="td">1</td><td class="td">${facultyName}</td><td class="td">${facultyDesignation} & ${facultyDepartment}</td></tr>
    </tbody>
  </table>

  <!-- Vision & Mission -->
  <div class="vision-container">
    <ol>
      <li class="li-mt"><strong>1. Vision of the Institution:</strong><p>To be recognized as a premier institution, grooming students into globally acknowledged engineering professionals.</p></li>
      <li class="li-mt"><strong>2. Mission of the Institution:</strong><ul><li>To provide outcome and value-based engineering education.</li><li>To nurture research and entrepreneurial culture.</li><li>To enable students to be industry-ready and fulfil their career aspirations.</li><li>To groom students through behavioural and leadership training programs.</li><li>To make students socially responsible.</li></ul></li>
      <li class="li-mt"><strong>3. Vision of the Department:</strong><p>To groom students into globally competent software professionals and meet the ever changing requirements of the industry</p></li>
      <li class="li-mt"><strong>4. Mission of the Department:</strong><ul><li>Creating a quality academic environment with relevant IT infrastructure and empowering faculty and students with emerging technologies.</li><li>Motivating staff and students to actively involved in lifelong learning and fostering research.</li><li>Inculcating leadership and entrepreneurship skills in students.</li><li>Generating opportunities for students to evolve as competent software professionals with societal consciousness.</li></ul></li>
      <li class="li-mt"><strong>5. Program Educational Objectives:</strong><ul><li><strong>PEO1:</strong> To prepare graduates for a career in software engineering</li><li><strong>PEO2:</strong> To prepare students for higher studies, research, entrepreneurial and leadership roles by imparting the quality of lifelong learning</li><li><strong>PEO3:</strong> To enable students to apply innovative solutions for real-life problems in computer science domain.</li></ul></li>
      <li class="li-mt"><strong>6. Program Outcomes:</strong>
        <ul>
          <li><strong>PO1: Engineering knowledge:</strong> Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex software engineering problems.</li>
          <li><strong>PO2: Problem analysis:</strong> Identify, formulate, research literature, and analyze complex software engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and software engineering sciences</li>
          <li><strong>PO3: Design/development of solutions:</strong> Design solutions for complex software engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.</li>
          <li><strong>PO4: Conduct investigations of complex problems:</strong> Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.</li>
          <li><strong>PO5: Modern tool usage:</strong>Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex software engineering activities with an understanding of the limitations</li>
          <li><strong>PO6: The engineer and society:</strong>Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional software engineering practice. </li>
          <li><strong>PO7: Environment and sustainability:</strong>Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.</li>
          <li><strong>PO8: Ethics:</strong>Apply ethical principles and commit to professional ethics and responsibilities and norms of the software engineering practice.</li>
          <li><strong>PO9: Individual and teamwork:</strong> Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.</li>
          <li><strong>PO10: Communication:</strong>Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.</li>
          <li><strong>PO11: Project management and finance:</strong>Demonstrate knowledge and understanding of the engineering and management principles and apply these to one’s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.</li>
          <li><strong>PO12: Life-long learning:</strong>Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.</li>
        </ul>
      </li>
      <li class="li-mt"><strong>7. Program Specific Outcomes:</strong><ul><li><strong>PSO1:</strong> Demonstrate knowledge in open source technologies.</li><li><strong>PSO2:</strong> Develop innovative solutions by adapting emerging technologies for industry oriented applications</li><li><strong>PSO3:</strong> Implement SDLC principles for project/product development.</li></ul></li>
    </ol>
  </div>

  <!-- Course Details -->
  <div class="course-details-section"><strong>8. Course Details:</strong>
    <ul><li><strong>8.1 Course Type:</strong> ${['T', 'TP', 'TPJ', 'P', 'PJ', 'I'].map((type) => (courseType?.toUpperCase() === type ? `<strong>${type}</strong>` : `<strike>${type}</strike>`)).join(' / ')}</li>
    <li><strong>8.2 Course Pre-requisites:</strong> ${coursePlan?.courseDetails?.preRequisites || '—'}</li>
    <li><strong>8.3 Course Co-requisites to:</strong> ${coursePlan?.courseDetails?.coRequisites || '—'}</li>
    <li><strong>8.4 Course Description:</strong> ${coursePlan?.courseDetails?.description || '—'}</li>
    <li><strong>8.5 Course Objectives:</strong> ${(coursePlan?.courseDetails?.objectives || []).map((obj, idx) => `<br/>${idx + 1}. ${obj}`).join('')}</li>
    <li><strong>8.6 Course Outcomes:</strong></li></ul>
  </div>

  <!-- Course Outcomes Table -->
  <table class="table course-outcome-table">
    <thead><tr><th>Course Outcome No</th><th>Course Outcome Statement</th><th>RBTL</th></tr></thead>
    <tbody>${courseOutcomesRows}</tbody>
  </table>

  <!-- CO-PO Mapping Table -->
  <ul class="left-text"><li><strong>8.7 CO-PO and CO-PSO mapping:</strong></li></ul>
  <div class="CO-PO_mapping_Table">
    <table class="table po-table">
      <thead>
        <tr><th rowspan="2">Course Outcome No.</th><th colspan="11">Programme Outcomes</th><th colspan="3">PSO</th></tr>
        <tr>${poHeaders.map((h) => `<th class="sm">${h}</th>`).join('')}${psoHeaders.map((h) => `<th class="sm">${h}</th>`).join('')}</tr>
      </thead>
      <tbody>${coPoRows}</tbody>
    </table>
  </div>

  <!-- Justification -->
  <p><strong>8.8 CO-PO Mapping Justification</strong></p>
  <table class="table"><thead><tr><th>CO</th><th>Justification</th></tr></thead><tbody>${justificationRows}</tbody></table>

  <!-- Syllabus & References -->
  <p><strong>8.9 Syllabus and References:</strong></p>
  <table class="table syllabus-main-table">
    <tbody>
      <tr><td rowspan="3" class="syllabus-code"><strong>${courseCode}</strong></td><td rowspan="3" class="syllabus-title"><strong>${courseTitle}</strong></td>
      <td colspan="2" class="credit-label">CI</td><td colspan="2" class="credit-label">LI</td><td colspan="2" class="credit-label">NH</td>
      <td rowspan="2" class="credit-box"><strong>TH</strong></td><td rowspan="2" class="credit-box"><strong>C</strong></td>
      </tr>
      <tr><td class="credit-box"><strong>L</strong></td><td class="credit-box"><strong>T</strong></td><td class="credit-box"><strong>P</strong></td><td class="credit-box"><strong>J</strong></td>
      <td class="credit-box"><strong>TW</strong></td><td class="credit-box"><strong>SL</strong></td>
      </tr>
      <tr><td class="credit-box"><strong>${credits.L}</strong></td><td class="credit-box"><strong>${credits.T}</strong></td><td class="credit-box"><strong>${credits.P}</strong></td>
      <td class="credit-box"><strong>${credits.J}</strong></td><td class="credit-box"><strong>${credits.TW}</strong></td><td class="credit-box"><strong>${credits.SL}</strong></td>
      <td class="credit-box"><strong>${credits.TH}</strong></td><td class="credit-box"><strong>${credits.C}</strong></td>
      </tr>
      <tr><td colspan="10" class="unit-row"><strong>Syllabus</strong><span style="float:right"><strong>(30+30+60=120 Periods)</strong></span></td></tr>
      ${syllabusRows}
    </tbody>
  </table>

  <!-- Experiments section with page-break-inside avoid -->
  <div class="experiments-no-break">
    <p><strong>List of Experiments : (30 Periods)</strong></p>
    <table class="table text-left experiments-table">
      <tbody>
        <tr><td>${experimentsHtml}</td></tr>
        <tr><td><strong>List of Sample Projects:</strong> ${sampleProjectsHtml}</td></tr>
        ${dynamicReferenceRows}
      </tbody>
    </table>
  </div>

  <!-- Gap & Beyond -->
  <p><strong>8.10 Gap Identification (if any) :</strong> ${gapIdentification}</p>
  <p><strong>8.11 Content Beyond Syllabus (if any) :</strong> ${contentBeyondSyllabus}</p>

  <!-- Assessment Plan -->
  <div class="assessment-container">
    <p><strong>9. Course Assessment Plan (Theory cum practical and Project course):</strong></p>
    <table class="assessment-table">
      <thead>
        <tr><th rowspan="3">Course Type</th><th colspan="9">Internal Assessment Marks</th><th colspan="3">SEE Marks</th><th rowspan="3">Total Marks</th></tr>
        <tr><th colspan="3">CI</th><th colspan="2">LI</th><th colspan="4">NH</th><th>CI</th><th>LI</th><th>NH</th></tr>
        <tr><th>CIA-I</th><th>CIA-II</th><th>CIA-III</th><th>P</th><th>J</th><th>TW PROJ</th><th>TW A1</th><th>TW A2</th><th>TW A3</th><th>T</th><th>P</th><th>J</th></tr>
      </thead>
      <tbody>
        <tr><td class="text-left">Course Code: ${courseCode}</td><td>60</td><td>60</td><td>80</td><td>100</td><td></td><td>100</td><td>-</td><td>-</td><td>-</td><td>100</td><td></td><td>100</td><td>600</td></tr>
        <tr><td class="text-left">Reduced to</td><td>8</td><td>8</td><td>9</td><td>25</td><td colspan="2">15</td><td>-</td><td>-</td><td>-</td><td>25</td><td>-</td><td>10</td><td>100</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Lesson Plan Theory -->
  <div class="lesson-plan-container">
    <p><strong>10. Lesson Plan (Theory)</strong></p>
    <table class="table lesson-plan-table">
      <thead><tr><th>S. No.</th><th>CO</th><th>Topic</th><th>Learning Pedagogy Used</th><th>References</th><th>Planned Date of Lecture</th><th>Actual Date Delivered</th></tr></thead>
      <tbody>${lessonPlanRows || '<tr><td colspan="7">No theory topics available</td></tr>'}</tbody>
    </table>
  </div>

  <!-- Lesson Plan Practical -->
  <div class="lesson-plan-container">
    <p><strong>10. Lesson Plan (Practical)</strong></p>
    <table class="table lesson-plan-table">
      <thead><tr><th>S. No.</th><th>CO</th><th>Name of the Experiment</th><th>Teaching Aids Used</th><th>Planned Date(s)</th><th>Actual Date(s)</th></tr></thead>
      <tbody>${practicalRows || '<tr><td colspan="6">No practical experiments available</td></tr>'}</tbody>
    </table>
  </div>

  <!-- Term Work -->
  <div class="tw-sl-container">
    <p><strong>11. Term Work and Self Learning - Plan and Outcome:</strong></p>
    <table class="tw-sl-table">
      <thead><tr><th rowspan="2">Sl. No</th><th rowspan="2">Name of activity / Problem Statement</th><th rowspan="2">RBTL</th><th colspan="2">Mapping</th></tr>
      <tr><th>COs</th><th>POs</th></tr></thead>
      <tbody>${termWorkRows}</tbody>
    </table>
  </div>

  <!-- Proposed Dates Assessments -->
  <div class="assessment-dates-container">
    <p><strong>12. Proposed Dates of Assessments (as per the Department Academic Calendar):</strong></p>
    <table class="assessment-dates-table">
      <thead><tr><th>S. No</th><th>Name of the Assessment*</th><th>Proposed Date</th><th>Actual Date</th><th>Reason for change</th></tr></thead>
      <tbody>${assessmentRows}</tbody>
    </table>
  </div>

  <!-- Proposed Dates Activities -->
  <div class="assessment-dates-container">
    <p><strong>12. Proposed Dates of Activities related to the course, if any (as per the Department Academic Calendar):</strong></p>
    <table class="assessment-dates-table">
      <thead><tr><th>S. No</th><th>Name of the Assessment*</th><th>Proposed Date</th><th>Actual Date</th><th>Reason for change</th></tr></thead>
      <tbody>${activityRows}</tbody>
    </table>
  </div>

  <!-- Signature Section -->
  <div class="signature-section">
    <p><strong>Name and Signature of course Faculty Member with Date</strong></p>
    <div class="sig-row"><div class="sig-col"><p><strong>1) Name:</strong> ${facultyName}</p></div><div class="sig-col"><p><strong>Signature with Date</strong></p></div></div>
    <div class="sig-row">
      <div class="sig-col"><p><strong>Reviewed by</strong></p><p class="sig-space"></p><p><strong>Signature of Module Coordinator</strong></p><p><strong>Date:</strong></p></div>
      <div class="sig-col"><p><strong>Approved by</strong></p><p class="sig-space"></p><p><strong>Signature of Head of Dept.</strong></p><p><strong>Date:</strong></p></div>
    </div>
    <hr class="sig-divider" />
    <div class="office-academics"><p><strong>For use of Office of Academics:</strong></p><div class="sig-row"><div class="sig-col"></div><div class="sig-col"><p><strong>Dean (Academics)</strong></p><p><strong>Date:</strong></p></div></div></div>
  </div>
</div>
</body>
</html>`;

  // Open print window for PDF generation
  const printWindow = window.open('', '_blank');
  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
