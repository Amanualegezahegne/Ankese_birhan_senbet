# Requirements Document

## Introduction

This feature adds a Teacher Attendance Page to the user_frontend (teacher portal), allowing teachers to record, update, and review daily student attendance. Teachers can mark each student as Present, Absent, or Permission for any given date. The page pre-fills existing attendance data when viewing a previously recorded date, supports filtering students by grade, and provides clear success/error feedback after saving. The backend attendance routes are also tightened to require teacher-or-admin authorization.

## Glossary

- **Attendance_Page**: The new `Attendance.jsx` React page at route `/attendance` in user_frontend
- **Teacher**: A user whose `role` field equals `'teacher'` or `'admin'`, stored in `localStorage` under key `studentInfo`
- **Student**: A user whose `role` field equals `'student'`, returned by `GET /api/students?role=student`
- **Attendance_Record**: A single attendance entry with fields: `student_id`, `date` (YYYY-MM-DD), and `status`
- **Status**: One of three enumerated values — `'Present'`, `'Absent'`, or `'Permission'`
- **Attendance_API**: The backend Express routes under `/api/attendance`
- **Teacher_Middleware**: The `teacher` middleware function in `authMiddleware.js` that permits access only when `req.user.role` is `'teacher'` or `'admin'`
- **Protected_Route**: A React Router route component that redirects unauthenticated users to `/signin`
- **Teacher_Route**: A React Router route component that redirects authenticated non-teacher users away from teacher-only pages
- **Sidebar**: The `Sidebar.jsx` component that renders navigation links conditionally based on user role

---

## Requirements

### Requirement 1: Backend Route Authorization

**User Story:** As a system administrator, I want attendance routes to require teacher-level authorization, so that only teachers and admins can record or view attendance data.

#### Acceptance Criteria

1. IF a request to `POST /api/attendance` is made without a valid, non-expired JWT token, THEN THE Attendance_API SHALL respond with HTTP 401.
2. IF a request to `POST /api/attendance` is made with a valid JWT token whose payload `role` is not `'teacher'` or `'admin'`, THEN THE Attendance_API SHALL respond with HTTP 403.
3. IF a request to `GET /api/attendance/date/:date` is made without a valid, non-expired JWT token, THEN THE Attendance_API SHALL respond with HTTP 401.
4. IF a request to `GET /api/attendance/date/:date` is made with a valid JWT token whose payload `role` is not `'teacher'` or `'admin'`, THEN THE Attendance_API SHALL respond with HTTP 403.
5. IF a request to `GET /api/attendance/report` is made without a valid, non-expired JWT token, THEN THE Attendance_API SHALL respond with HTTP 401.
6. IF a request to `GET /api/attendance/report` is made with a valid JWT token whose payload `role` is not `'teacher'` or `'admin'`, THEN THE Attendance_API SHALL respond with HTTP 403.
7. WHEN a request is made to any of the three attendance endpoints with a valid, non-expired JWT token whose payload `role` is `'teacher'` or `'admin'`, THE Attendance_API SHALL grant access and process the request normally.

---

### Requirement 2: Teacher-Only Frontend Route

**User Story:** As a teacher, I want the attendance page to be accessible only to teachers, so that students cannot navigate to or view the attendance management interface.

#### Acceptance Criteria

1. THE App SHALL expose a route at `/attendance` that renders the Attendance_Page.
2. WHEN a user with no valid session token in localStorage navigates to `/attendance`, THE Protected_Route SHALL redirect the user to `/signin`.
3. WHEN an authenticated user whose role is not `'teacher'` (including null or absent role) navigates to `/attendance`, THE Teacher_Route SHALL redirect the user to `/` (home).
4. WHEN an authenticated user whose role is `'teacher'` navigates to `/attendance`, THE Teacher_Route SHALL render the Attendance_Page.

---

### Requirement 3: Sidebar Navigation Link

**User Story:** As a teacher, I want an Attendance link in my sidebar, so that I can navigate to the attendance page from any page in the app.

#### Acceptance Criteria

1. WHILE the authenticated user's role is `'teacher'`, THE Sidebar SHALL render a navigation link element pointing to `/attendance` in the DOM.
2. WHILE the authenticated user's role is not `'teacher'` or the role is null or absent, THE Sidebar SHALL NOT include an attendance navigation link element in the DOM.
3. WHEN the teacher clicks the attendance navigation link, THE Sidebar SHALL navigate the user to `/attendance` via client-side routing without a full page reload.

---

### Requirement 4: Date Selection

**User Story:** As a teacher, I want to select a date for taking attendance, so that I can record or review attendance for any school day.

#### Acceptance Criteria

1. WHEN the Attendance_Page first renders, THE Attendance_Page SHALL default the selected date to the current calendar date formatted as YYYY-MM-DD.
2. WHEN the teacher changes the date input, THE Attendance_Page SHALL update the selected date and trigger a reload of attendance data for the new date.
3. THE Attendance_Page SHALL render a date input with `min` set to `2000-01-01` and `max` set to `2100-12-31`, so that only dates within that range are accepted by the browser's date control.
4. WHEN the teacher changes the date input, THE Attendance_Page SHALL clear any previously displayed feedback message before the new attendance data loads.

---

### Requirement 5: Student List Loading

**User Story:** As a teacher, I want the page to automatically load all students, so that I can take attendance without manually searching for each student.

#### Acceptance Criteria

1. WHEN the Attendance_Page mounts, THE Attendance_Page SHALL call `GET /api/students?role=student` with the teacher's JWT token within 10 seconds to retrieve the list of students.
2. WHEN the student list is received, THE Attendance_Page SHALL sort students in ascending alphabetical (A→Z) order by `name`.
3. WHEN the student list request fails or times out, THE Attendance_Page SHALL display an error message indicating that students could not be loaded.
4. WHILE the student list is loading, THE Attendance_Page SHALL display a loading indicator in place of the student table.
5. WHEN the student list response contains zero students, THE Attendance_Page SHALL display an empty-state message and SHALL NOT display an error.

---

### Requirement 6: Grade Filter

**User Story:** As a teacher, I want to filter students by grade, so that I can take attendance for a specific class without scrolling through unrelated students.

#### Acceptance Criteria

1. THE Attendance_Page SHALL render a grade filter dropdown containing options for "All Grades", Grade 1 through Grade 12, and "Adult / Other".
2. WHEN the teacher selects a specific grade, THE Attendance_Page SHALL display exactly those students whose `grade` field exactly matches the selected value and no others.
3. WHEN the teacher selects "All Grades", THE Attendance_Page SHALL display all students regardless of their `grade` field value.
4. IF the selected grade filter matches no students, THEN THE Attendance_Page SHALL display an empty-state message and SHALL NOT display an error.
5. WHEN the Attendance_Page first renders, THE Attendance_Page SHALL default the grade filter to "All Grades".

---

### Requirement 7: Attendance Status Toggle

**User Story:** As a teacher, I want to mark each student as Present, Absent, or Permission using toggle buttons, so that I can quickly record attendance status without using dropdowns or forms.

#### Acceptance Criteria

1. THE Attendance_Page SHALL render a row for each student containing three toggle buttons labelled `'Present'`, `'Absent'`, and `'Permission'`.
2. WHEN the teacher clicks a status button for a student, THE Attendance_Page SHALL set that student's status to the clicked value.
3. WHEN a status button is set for a student, THE Attendance_Page SHALL apply a visually distinct style (e.g., different background or border color) to that button compared to the inactive buttons for the same student.
4. WHEN the teacher clicks a status button for a student, THE Attendance_Page SHALL remove the active style from any previously active button for that same student.
5. WHEN the teacher clicks the already-active status button for a student, THE Attendance_Page SHALL deselect it, returning that student's status to unset.
6. THE Attendance_Page SHALL ensure that for any student in the list, at most one status button is in the active state at any time.
7. WHEN no status has been selected for a student, THE Attendance_Page SHALL treat that student's status as unset and SHALL NOT include that student in the submission payload.

---

### Requirement 8: Pre-fill Existing Attendance

**User Story:** As a teacher, I want existing attendance records to be pre-filled when I select a date that already has attendance, so that I can review or correct previously recorded data.

#### Acceptance Criteria

1. WHEN the teacher selects a date, THE Attendance_Page SHALL request existing attendance records for that date using the teacher's authentication credentials.
2. WHEN the response contains Attendance_Records for that date, THE Attendance_Page SHALL pre-select the corresponding status toggle for each matching student.
3. WHEN the response contains no Attendance_Records for the selected date, THE Attendance_Page SHALL display all status toggles in the neutral state with no status selected.
4. WHEN the attendance request fails, THE Attendance_Page SHALL display an error message and preserve the current toggle states rather than clearing them.
5. WHEN the teacher saves attendance for a date and then re-selects that same date, THE Attendance_Page SHALL display status toggles that match the statuses that were saved.

---

### Requirement 9: Submit Attendance

**User Story:** As a teacher, I want to submit attendance for the selected date, so that the records are saved and can be referenced later.

#### Acceptance Criteria

1. THE Attendance_Page SHALL render a submit button labelled "Save Attendance".
2. WHEN the teacher clicks "Save Attendance" and at least one student has a status set, THE Attendance_Page SHALL call `POST /api/attendance` with the body `{ date, records: [{ student: id, status }] }` for all students whose status is set, using the teacher's JWT token.
3. WHEN the submission request succeeds, THE Attendance_Page SHALL display a success message within the page.
4. WHEN the submission request fails, THE Attendance_Page SHALL display a descriptive error message within the page.
5. WHILE the submission request is in progress, THE Attendance_Page SHALL disable the submit button to prevent duplicate submissions.
6. IF the teacher clicks "Save Attendance" and no student has a status set, THEN THE Attendance_Page SHALL display a validation warning and SHALL NOT call `POST /api/attendance`.

---

### Requirement 10: Success and Error Feedback

**User Story:** As a teacher, I want clear visual feedback after saving attendance, so that I know whether the operation succeeded or failed.

#### Acceptance Criteria

1. WHEN a save operation succeeds, THE Attendance_Page SHALL display a success alert styled consistently with the existing `alert-success` CSS class.
2. WHEN a save operation fails, THE Attendance_Page SHALL display an error alert styled consistently with the existing `alert-error` CSS class.
3. WHEN the teacher selects a new date or initiates a new save operation after seeing a feedback message, THE Attendance_Page SHALL replace the previous feedback message with the new one.
4. THE Attendance_Page SHALL display at most one feedback message at a time.
5. WHEN a feedback message has been displayed for 5 seconds without further user interaction, THE Attendance_Page MAY automatically dismiss it; if dismissed, the Attendance_Page SHALL NOT display a blank or placeholder element in its place.

---

### Requirement 11: Page Style and Layout

**User Story:** As a teacher, I want the attendance page to look and feel consistent with the existing Grade Report page, so that the teacher portal has a unified appearance.

#### Acceptance Criteria

1. THE Attendance_Page SHALL import and apply styles from `Attendance.css` in the same styles directory as other page stylesheets.
2. THE Attendance_Page outer container SHALL use the `user-management-page` class, the filter panel SHALL use the `card` class, the table container SHALL use the `table-wrapper` class, and the table element itself SHALL use the `management-table` class.
3. WHEN the `data-theme` attribute on `<html>` is set to `'dark'`, THE Attendance_Page SHALL update background, text, and border colors by reading `var(--card-bg)`, `var(--text-color)`, `var(--nav-bg)`, and `var(--nav-border)` CSS custom properties.
4. THE Attendance_Page SHALL not produce a page-level horizontal scrollbar and SHALL not clip or overlap any text content at viewport widths between 320px and 1920px.
