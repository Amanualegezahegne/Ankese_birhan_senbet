# Implementation Plan: Teacher Attendance

## Overview

Implement the teacher attendance feature across 5 files. The backend attendance routes get the `teacher` middleware added. The frontend gains a `TeacherRoute` guard in `App.jsx`, an Attendance link in `Sidebar.jsx`, a new `Attendance.jsx` page, and its companion `Attendance.css` stylesheet. Implementation mirrors the existing `GradeReport` page patterns throughout.

## Tasks

- [x] 1. Tighten backend attendance route authorization
  - [x] 1.1 Add `teacher` middleware to all three attendance routes in `attendanceRoutes.js`
    - In `backend/routes/attendanceRoutes.js`, update the `require` for `authMiddleware` to destructure both `protect` and `teacher`
    - Replace `protect` alone with `protect, teacher` on `POST /`, `GET /report`, and `GET /date/:date`
    - The `teacher` function already exists and is exported from `authMiddleware.js` — no changes needed there
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 1.2 Write property test for backend role authorization
    - **Property 5: Backend Role Authorization**
    - Generate random JWT payloads with random role strings; call the `teacher` middleware directly
    - Assert `next()` is called when `role` is `'teacher'` or `'admin'`; assert HTTP 403 is returned for any other role value
    - Tag: `// Feature: teacher-attendance, Property 5: backend role authorization`
    - **Validates: Requirements 1.1 – 1.7**

- [x] 2. Add `TeacherRoute` guard and `/attendance` route in `App.jsx`
  - [x] 2.1 Define `TeacherRoute` component and register the `/attendance` route
    - In `user_frontend/src/App.jsx`, add `import Attendance from './Pages/Attendance';`
    - Define `TeacherRoute` directly below the existing `ProtectedRoute` component — it reads `studentToken` from `localStorage`, parses `studentInfo`, and redirects non-teachers to `/` and unauthenticated users to `/signin`
    - Inside `<Routes>`, add `<Route path="/attendance" element={<TeacherRoute><Attendance /></TeacherRoute>} />`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write unit tests for `TeacherRoute`
    - Test that `TeacherRoute` redirects to `/signin` when `studentToken` is absent
    - Test that it redirects to `/` when token is present but `role` is `'student'` or null
    - Test that it renders children when `role` is `'teacher'`
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 3. Add Attendance navigation link in `Sidebar.jsx`
  - [x] 3.1 Add `FaCalendarCheck` import and attendance `<NavLink>` inside the `isTeacher` block
    - In `user_frontend/src/Components/Sidebar.jsx`, add `FaCalendarCheck` to the existing `react-icons/fa` import line
    - Inside the `{isTeacher && (...)}` JSX block (currently wrapping the Grades link), add a second `<li>` with a `<NavLink to="/attendance">` that uses `FaCalendarCheck` icon and label `{t('navbar.attendance') || 'Attendance'}`
    - Follow the exact same `NavLink` + `onClick={toggleSidebar}` + `className` pattern as the existing Grades link
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write unit tests for Sidebar attendance link
    - Test that the attendance link is rendered in the DOM when `role` is `'teacher'`
    - Test that the attendance link is absent from the DOM when `role` is `'student'` or null
    - _Requirements: 3.1, 3.2_

- [x] 4. Create `Attendance.css` stylesheet
  - [x] 4.1 Create `user_frontend/src/Styles/Attendance.css` with attendance-specific styles
    - Copy the shared utility classes from `GradeReport.css` that are not globally defined: `.user-management-page`, `.table-wrapper`, `.management-table` (with `th`/`td`/`tr` variants), `.card`, `.alert`, `.alert-success`, `.alert-error`, `.alert-warning`
    - Add new attendance-specific classes:
      - `.attendance-btn` — base style for Present/Absent/Permission toggle buttons (padding, border, border-radius, cursor, transition)
      - `.attendance-btn.active-present` — green background/border for active Present state
      - `.attendance-btn.active-absent` — red background/border for active Absent state
      - `.attendance-btn.active-permission` — amber/yellow background/border for active Permission state
      - `.save-attendance-btn` — primary save button style matching `.save-all-btn` from GradeReport
      - `.save-attendance-btn:disabled` — muted/greyed-out style for the disabled submitting state
    - Include dark-theme CSS custom property overrides using `[data-theme='dark']` selectors for `var(--card-bg)`, `var(--text-color)`, `var(--nav-bg)`, `var(--nav-border)`
    - Ensure no horizontal overflow; set `overflow-x: auto` on `.table-wrapper`; avoid fixed widths that would clip at narrow viewports
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 5. Implement `Attendance.jsx` — scaffold, state, and data fetching
  - [x] 5.1 Create the component file with all state, derived values, and fetch functions
    - Create `user_frontend/src/Pages/Attendance.jsx`
    - Imports: `useState`, `useEffect` from React; `api` from `../api/axios`; `../Styles/Attendance.css`; `../Styles/Alert.css`
    - Declare state: `date` (default to `new Date().toISOString().split('T')[0]`), `students` (`[]`), `attendanceMap` (`{}`), `gradeFilter` (`''`), `loading` (`false`), `submitting` (`false`), `status` (`{ type: '', message: '' }`)
    - Implement `fetchStudents()`: call `GET /api/students?role=student` with `Authorization: Bearer <token>` header, sort the response alphabetically by `name` using `localeCompare`, store to `students`; on failure set `status` to `{ type: 'error', message: 'Failed to load students.' }`
    - Implement `fetchAttendanceForDate(date)`: call `GET /api/attendance/date/${date}` with auth header; on success build an `attendanceMap` from the returned records (`{ [record.student_id || record.student]: record.status }`); on failure set `status.type = 'error'` and preserve existing `attendanceMap`
    - Wire both fetches in `useEffect` on mount: call `fetchStudents()` then `fetchAttendanceForDate(date)` using the initial date
    - Derive `filteredStudents` inside the render: filter `students` by `gradeFilter` (empty string = all)
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 5.2 Write property test for grade filter correctness
    - **Property 4: Grade Filter Correctness**
    - Generate a random student list with varying `grade` values and a random filter selection
    - Apply the client-side filter function
    - Assert every student in the result has `grade === filterValue`, and every student from the source with that grade appears in the result; assert "All Grades" (empty string) returns the full list
    - Tag: `// Feature: teacher-attendance, Property 4: grade filter correctness`
    - **Validates: Requirements 6.2, 6.3**

- [x] 6. Implement `Attendance.jsx` — handlers and submission logic
  - [x] 6.1 Implement `handleStatusToggle`, `handleDateChange`, and `handleSubmit`
    - `handleStatusToggle(studentId, clickedStatus)`: if `attendanceMap[studentId] === clickedStatus` set it to `undefined`/delete the key (deselect); otherwise set `attendanceMap[studentId] = clickedStatus` — always produces a new object reference via spread
    - `handleDateChange(newDate)`: clear `status` state, set `date`, call `fetchAttendanceForDate(newDate)`
    - `handleSubmit()`: if no key in `attendanceMap` has a truthy value, set `status = { type: 'warning', message: 'Please mark at least one student before saving.' }` and return without calling the API; otherwise set `submitting = true`, call `POST /api/attendance` with `{ date, records: [{ student: id, status }] }` for all students with a set status; on success set `status = { type: 'success', ... }`, on failure set `status = { type: 'error', ... }`; always set `submitting = false` in a `finally` block
    - Wire the 5-second auto-dismiss of `status` via `setTimeout` inside a `useEffect` watching `status.message`; clear the timer on cleanup
    - _Requirements: 4.2, 4.4, 7.2, 7.4, 7.5, 7.6, 7.7, 9.2, 9.3, 9.4, 9.5, 9.6, 10.3, 10.4, 10.5_

  - [ ]* 6.2 Write property test for toggle exclusivity
    - **Property 1: Toggle Exclusivity**
    - Generate a random sequence of `(studentId, status)` click events; replay each through `handleStatusToggle`
    - Assert that after each event, `attendanceMap` contains at most one status per student; assert the last click wins; assert clicking the same active status deselects it
    - Tag: `// Feature: teacher-attendance, Property 1: toggle exclusivity`
    - **Validates: Requirements 7.2, 7.4, 7.5, 7.6**

  - [ ]* 6.3 Write property test for submission payload completeness
    - **Property 2: Submission Payload Completeness**
    - Generate a random `attendanceMap` where some students have statuses set and some do not
    - Run the payload-building logic (extract records from map)
    - Assert `records.length` equals the count of keys with truthy status values; assert each record's `status` matches `attendanceMap[record.student]`; assert students without a status are excluded
    - Tag: `// Feature: teacher-attendance, Property 2: submission payload completeness`
    - **Validates: Requirements 9.2, 9.6**

- [x] 7. Implement `Attendance.jsx` — JSX render
  - [x] 7.1 Build the page JSX using the required CSS classes and layout
    - Outer container: `<div className="user-management-page">` with heading "Attendance"
    - Alert block: render `{status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}`
    - Filter panel: `<div className="card">` containing:
      - Date `<input type="date">` with `min="2000-01-01"` `max="2100-12-31"`, value bound to `date`, `onChange` calling `handleDateChange`
      - Grade `<select>` with options "All Grades", Grade 1–12, "Adult / Other"; value bound to `gradeFilter`, `onChange` updating `gradeFilter`
    - Loading indicator: `{loading && <p>Loading...</p>}` rendered in place of the table
    - Student table: `<div className="table-wrapper"><table className="management-table">` with columns: #, Name, Christian Name, Present, Absent, Permission
    - Each row renders three `<button className={`attendance-btn ${attendanceMap[id] === status ? `active-${status.toLowerCase()}` : ''}`}>` buttons for Present / Absent / Permission; clicking calls `handleStatusToggle(student.id, status)`
    - Empty state: when `filteredStudents.length === 0` and not loading, render an empty-state `<td colSpan="6">` message
    - Save button: `<button className="save-attendance-btn" onClick={handleSubmit} disabled={submitting}>Save Attendance</button>`
    - _Requirements: 4.3, 5.4, 5.5, 6.1, 6.4, 6.5, 7.1, 7.3, 9.1, 9.5, 10.1, 10.2, 11.1, 11.2_

  - [ ]* 7.2 Write property test for pre-fill round trip
    - **Property 3: Pre-fill Round Trip**
    - Generate random attendance records `[{ student, status }]`; mock `POST /api/attendance` to store them and `GET /api/attendance/date/:date` to return them
    - Run `fetchAttendanceForDate`; assert the resulting `attendanceMap` has exactly the same student keys and status values as the original records
    - Tag: `// Feature: teacher-attendance, Property 3: pre-fill round trip`
    - **Validates: Requirements 8.1, 8.2, 8.5**

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All API calls use the `api` axios instance from `../api/axios` with `Authorization: Bearer <token>` headers, matching the GradeReport pattern exactly
- `attendanceMap` is keyed by student UUID; the POST payload maps it to `{ student: id, status }` entries
- The `teacher` middleware already exists in `authMiddleware.js` and is already exported — task 1.1 only updates the routes file
- PBT library: **fast-check** (works with Vitest, already a natural fit for this JS/React stack); minimum 100 iterations per property test

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["7.2"] }
  ]
}
```
