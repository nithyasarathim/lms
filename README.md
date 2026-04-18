# Frontend README

## 1. Project Overview

This frontend is the role-based web client for an academic Learning Management System (LMS). It helps administrators, heads of department, faculty members, and students operate on the same academic data from different workflows.

### What the application does

- authenticates users and routes them to role-specific dashboards
- manages academic master data such as departments, regulations, subjects, batches, and curriculum
- supports student and faculty onboarding
- enables faculty allocation, timetable planning, and classroom creation
- lets faculty publish announcements, assignments, quizzes, and materials
- lets students view classes, submit work, and track attendance
- supports attendance marking and HOD approval workflows

### Target users

- `ADMIN`: institution setup and master-data management
- `HOD`: department operations, staffing, timetable, and attendance approvals
- `FACULTY`: teaching operations, classrooms, course plans, classwork, attendance
- `STUDENT`: learning consumption, submission, and attendance tracking

### Key features

- single login experience for all roles
- protected, role-aware routing
- admin dashboards for subject, faculty, student, batch, and academic calendar management
- HOD dashboards for section management, staff allocation, timetable management, and attendance requests
- faculty dashboards for classrooms, calendar, and timetable
- student dashboards for performance summary, classrooms, and attendance

## 2. Core Terminologies

### Department

Definition: an academic unit such as CSE or ECE.

Purpose: departments organize faculty, students, subjects, and curriculum.

Interaction:

- faculty belong to a department
- students belong to a department
- curriculum is created per department + regulation
- batch programs bind department to batch and regulation

### Batch

Definition: a student cohort, usually a year range like `2023-2027`.

Purpose: batches identify admission cohorts and help drive semester progression.

Interaction:

- students belong to batches
- batch creation auto-generates `BatchProgram` records
- batch context is used for sectioning and semester shifts

### Regulation

Definition: the academic scheme or rule set, for example `R2023`.

Purpose: regulations define the semester structure and the subject framework.

Interaction:

- subjects are created under department + regulation
- curriculum is created under department + regulation
- batch programs carry the regulation applied to that cohort

### Curriculum

Definition: semester-wise subject mapping for a department under a regulation.

Purpose: it tells the system what students should study in each semester.

Interaction:

- admin configures it in subject management
- HOD uses it indirectly for faculty allocation
- backend validates allocation against curriculum subjects

### Subject / Course

Definition: a teachable academic course such as Data Structures.

Purpose: this is the unit of academic delivery.

Interaction:

- belongs to a department and regulation
- appears inside curriculum
- becomes part of classroom, course plan, timetable, and attendance flows

### Subject Component

Definition: the instructional part of a subject such as `THEORY`, `PRACTICAL`, `PROJECT`, or `INTERNSHIP`.

Purpose: some courses need separate allocation and scheduling for theory and lab/project work.

Interaction:

- auto-created when subjects are created or bulk uploaded
- faculty are assigned at component level
- timetable entries resolve through component-linked assignments

### BatchProgram

Definition: a combination of `Batch + Department + Regulation`.

Purpose: it expresses how one cohort is configured inside one department.

Interaction:

- sections belong to a batch program
- HOD academic structure is built from batch programs
- regulation and department are resolved from this record

### Section

Definition: a subdivision of a cohort, for example `A`, `B`, or `UNALLOCATED`.

Purpose: sections are the operational student groups used in teaching.

Interaction:

- students belong to sections
- timetable is maintained per section
- classrooms are created per section + subject + academic year + semester

### Academic Year

Definition: the running institutional year such as `2025-26`.

Purpose: it scopes active operations like timetable, classrooms, attendance, and student academic records.

Interaction:

- one academic year is usually active
- faculty allocation, timetable, classrooms, and attendance are tied to it

### Academic Calendar

Definition: day-level calendar entries that mark a date as working day or holiday.

Purpose: it controls whether normal teaching and attendance should happen on a date.

Interaction:

- admin manages it
- faculty calendar reads it
- attendance APIs respect it

### Faculty Assignment

Definition: assigning one or more faculty members to a section and subject component for a given academic year and semester.

Purpose: it answers "who teaches what?"

Interaction:

- created from HOD staff allocation
- drives classroom synchronization
- drives timetable planning
- controls course-plan access and attendance eligibility

### Timetable / Session / Slot

Definition: a timetable is the full section schedule; a slot is one period inside it.

Purpose: it structures the working day and tells the system which teaching component happens when.

Interaction:

- HOD creates it
- faculty and students consume it in calendar/timetable views
- attendance marking depends on timetable entries

### Classroom

Definition: the digital learning space for one section and subject in one academic year and semester.

Purpose: it is where academic interaction happens.

Interaction:

- contains members, topics, posts, comments, assignments, quizzes, and submissions
- shared between faculty and student UIs

### Enrollment

Definition: there is no standalone enrollment collection in the UI. Enrollment is represented through student placement into department, batch, section, semester, and academic-year records.

Purpose: it gives the system the student's current academic context.

Interaction:

- current state lives on `Student`
- historical state lives on `StudentAcademicRecord`

## 3. Application Flow

### Login Page

- enter institutional email and password
- click sign in
- frontend calls `POST /api/auth/login`
- token and role data are stored in `localStorage` as `lms-user`
- user is redirected to the matching dashboard

### Route Protection

- `GuestRoute` blocks logged-in users from returning to the login page
- `RoleRoute` checks the stored role before rendering protected pages
- invalid or missing session data redirects the user back to login

### Admin Dashboard

Tabs:

- `Dashboard`
- `Subject Management`
- `Batch Management`
- `Faculty Management`
- `Student Management`
- `Academic Calendar`

#### Example Flow: Admin creates a batch

- login
- open `Batch Management`
- click `Add Batch`
- fill year range and regulation
- submit
- backend creates batch, batch programs, and default unallocated sections

#### Example Flow: Admin creates a student

- login
- open `Student Management`
- choose academic year
- click add student
- fill user and academic details
- submit
- backend creates user, student, and academic record

#### Example Flow: Admin assigns courses to curriculum

- login
- open `Subject Management`
- create regulation if needed
- create subjects or bulk upload them
- create curriculum for department + regulation
- assign subjects to semesters

#### Example Flow: Admin manages classrooms indirectly

- admin does not manually create classrooms
- admin creates academic setup
- HOD allocates faculty
- backend syncs classrooms automatically

### HOD Dashboard

Tabs:

- `Dashboard`
- `Section Management`
- `Staff Allocation`
- `Student Management`
- `Timetable Management`
- `Attendance Requests`

#### Example Flow: HOD allocates faculty

- login
- open `Staff Allocation`
- select semester structure
- select section
- load semester subjects from curriculum
- assign faculty to each subject component
- save allocation
- backend syncs classroom membership and topic structure

#### Example Flow: HOD builds timetable

- login
- open `Timetable Management`
- select semester and section
- adjust timeline if needed
- assign subject components into timetable cells
- add additional hours if required
- save

#### Example Flow: HOD resolves attendance request

- login
- open `Attendance Requests`
- inspect pending faculty request
- approve or reject
- if approved, backend updates attendance record

### Faculty Dashboard

Tabs:

- `Dashboard`
- `Classrooms`
- `Calendar`
- `Time Table`

#### Example Flow: Faculty publishes an assignment

- login
- open `Classrooms`
- select a classroom
- create classwork item
- choose `assignment`
- add instructions, due date, and files
- submit
- students can now see and submit against it

#### Example Flow: Faculty marks attendance

- login
- open relevant classroom/day context
- fetch timetable entries available for attendance
- choose a period
- mark each student
- submit
- if later correction is needed, raise attendance change request

#### Example Flow: Faculty invites students

- open classroom
- load eligible students or staff
- send invitations
- backend emails invitation links
- user accepts through invitation page

### Student Dashboard

Tabs:

- `Dashboard`
- `Classrooms`
- `Attendance`

#### Example Flow: Student submits an assignment

- login
- open `Classrooms`
- select classroom
- open assignment detail page
- add text, link, or files
- click `Turn In`
- UI becomes read-only after successful submission

#### Example Flow: Student checks attendance

- login
- open `Attendance`
- see month calendar
- click a date
- open side drawer with period-wise details and holiday/working-day status

## 4. Folder Structure

```text
frontend/
  public/
  src/
    assets/
    pages/
      admin/
      auth/
      faculty/
      hod/
      shared/
      student/
    routes/
    App.jsx
    main.jsx
    index.css
```

### Folder-by-folder explanation

- `public`
  - static public assets

- `src/assets`
  - shared visual assets such as logos, banners, backgrounds, and SVGs

- `src/pages/admin`
  - admin API wrappers, page shell, management widgets, and modal forms
  - example files:
    - `api/admin.api.js`
    - `pages/AdminDashboard.jsx`
    - `components/BatchManagement.jsx`
    - `components/StudentManagement.jsx`

- `src/pages/auth`
  - authentication and invitation acceptance
  - example files:
    - `pages/LoginPage.jsx`
    - `pages/InvitationPage.jsx`
    - `api/auth.api.js`

- `src/pages/faculty`
  - faculty classroom, calendar, timetable, attendance, and course-plan integrations
  - example files:
    - `api/faculty.api.js`
    - `pages/FacultyPage.jsx`
    - `components/CalendarComponent.jsx`

- `src/pages/hod`
  - department-operations dashboard for HOD
  - example files:
    - `api/hod.api.js`
    - `components/StaffAllocation.jsx`
    - `components/TimeTableManagement.jsx`

- `src/pages/shared`
  - reusable classroom and shell components shared across faculty and student experiences
  - example files:
    - `classroom/ClassroomPage.jsx`
    - `components/ClassroomWorkDetailPage.jsx`
    - `components/HeaderComponent.jsx`

- `src/pages/student`
  - student-specific dashboard and attendance pages
  - example files:
    - `api/student.api.js`
    - `components/StudentDashboard.jsx`
    - `components/StudentAttendance.jsx`

- `src/routes`
  - guest and role guards

- `src/main.jsx`
  - app bootstrap, router mount, React Query provider

- `src/App.jsx`
  - route map and role-specific page wiring

## 5. Component Architecture

### Smart vs dumb components

The app uses a practical feature-first split:

- smart components
  - fetch data
  - manage local state
  - trigger mutations
  - coordinate drawers/modals
  - examples:
    - `StudentManagement.jsx`
    - `StaffAllocation.jsx`
    - `TimeTableManagement.jsx`
    - `ClassroomWorkDetailPage.jsx`

- presentational/reusable components
  - mostly render UI based on props
  - examples:
    - `HeaderComponent.jsx`
    - sidebar components
    - chart/table cards
    - classroom card list

### State management approach

- `useState` for local UI state
- `useSearchParams` for URL-driven UI state
- React Query for some server-state heavy screens
- direct `useEffect` fetching in several feature screens
- `localStorage` for persisted auth session

### Props flow

- route shell decides role page
- dashboard chooses active tab
- feature container loads data
- feature container passes props and handlers to child tables, charts, and modals
- successful mutations trigger refresh or cache invalidation

### Reusability strategy

- common classroom experience is shared between faculty and student views
- sidebars follow the same dashboard-shell pattern
- API functions are grouped by role/feature to reduce component complexity

## 6. API Integration Flow

The frontend talks to the backend using `axios`.

### How it works

1. feature-specific axios client is created
2. base URL is read from `VITE_API_URL`
3. request interceptor reads `lms-user` from `localStorage`
4. `Authorization` header is attached when token exists
5. feature function calls backend endpoint
6. response data is returned to component
7. component updates UI or displays toast message

### Examples

- `src/pages/auth/api/auth.api.js`
- `src/pages/admin/api/admin.api.js`
- `src/pages/hod/api/hod.api.js`
- `src/pages/faculty/api/faculty.api.js`
- `src/pages/student/api/student.api.js`

### Loading states

- shimmer placeholders in dashboards and management pages
- page-level loading messages in detail screens
- disabled submit buttons during async mutations

### Error handling

- errors are normalized through `error.response?.data || error.message`
- UI surfaces failures through `react-hot-toast` or local error panels

## 7. State Management

### Local state

Used for:

- form fields
- selected classroom/section/batch
- active tab
- current month and selected date
- drawer/modal visibility

### Server state

Used for:

- classrooms
- timetable data
- academic structure
- dashboard summaries
- attendance views

Tools:

- React Query for some high-value, frequently reused data
- `useEffect` + component state elsewhere

### Persistent state

Used for:

- authenticated session
- role
- facultyId / departmentId from login payload

Storage:

- `localStorage`

### Data flow in text

```text
User action
  -> component handler
  -> API client / query / mutation
  -> backend endpoint
  -> JSON response
  -> local state or query cache update
  -> rerender
```

## 8. Production Best Practices

### Already present

- role-based route protection
- token injection through axios interceptors
- feature-based folder organization
- separate API modules
- query caching in app bootstrap
- meaningful loading feedback in many screens

### Recommended improvements

- introduce a shared axios instance instead of repeating client setup in multiple feature folders
- add lazy loading for large role dashboards
- add global unauthorized handling on `401`
- move long-lived auth from `localStorage` to a more secure cookie-based model if the backend evolves
- add centralized form validation for modal-heavy flows
- add error boundaries around major dashboard shells
- audit HTML rendering paths because classroom instructions are rendered as HTML
- tighten file upload UX and validation rules

## 9. Setup and Run

### Requirements

- Node.js 18+
- backend server running

### Environment

```env
VITE_API_URL=http://localhost:5000/
```

### Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 10. Frontend Mental Model

This frontend is best understood as a workflow chain:

- admin defines the academic structure
- HOD turns that structure into operational teaching plans
- backend creates classrooms from those plans
- faculty teaches inside classrooms
- students learn and submit work inside the same classrooms

That role-to-role handoff is the core reason the UI is organized the way it is.
