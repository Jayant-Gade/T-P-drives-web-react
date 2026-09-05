# MERN T&P Cell Placement Management System - Architecture Blueprint

## 1. Executive Summary
This document provides a comprehensive architectural blueprint for a Training & Placement (T&P) Cell Management System. Built on the MERN stack (MongoDB, Express, React, Node.js), this system aims to streamline the uploading of student datasets, filtering based on eligibility criteria, and generating placement drives. A key architectural pillar is maintaining data consistency across different student batches (datasets) and ensuring historical integrity of placement drive eligibility.

## 2. Functional Requirements
- **Dataset Management:** Ability to upload, validate, preview, and save student datasets via CSV.
- **Student Filtering:** Dynamically filter student lists based on multiple attributes (e.g., CGPA, branch, backlogs).
- **Placement Drive Creation:** Define new placement drives and apply eligibility filters based on specific student datasets.
- **Eligibility Tracking:** Calculate, preview, and save a list of students eligible for a specific drive.
- **Historical Integrity:** Persist placement drive eligibility records so they remain unchanged even if the core student dataset updates.
- **Student-Centric History:** View all placement drives a specific student was eligible for.

## 3. Non-Functional Requirements
- **Scalability:** Capable of handling thousands of student records efficiently (e.g., pagination, optimized queries).
- **Security:** Secure authentication and role-based access control (Admin, Staff, Viewer). Input validation to prevent NoSQL injection and XSS.
- **Maintainability:** Modular and clean folder structure in both frontend and backend.
- **Usability:** Intuitive UI/UX for T&P admins to define filters without technical knowledge.
- **Performance:** Bulk operations for CSV uploads, preventing N+1 query problems.

## 4. Core Domain Concepts
- **Student Dataset:** A logical container representing a batch or upload instance of student records (e.g., "Batch 2026").
- **Student:** An individual academic record containing attributes like CGPA, branch, and backlogs. Belongs strictly to one Dataset.
- **Placement Drive:** An event organized by a company with specific eligibility criteria. Belongs to one Dataset.
- **Filter Criteria:** The rules used to evaluate which students qualify for a placement drive.
- **Eligibility Record:** A historical association linking a Student and a Placement Drive.

## 5. Overall System Architecture
```text
User (T&P Admin/Staff)
    ↓ (HTTPS / REST)
React Frontend (SPA)
    ↓ (API Requests & JSON)
Express Backend (Node.js)
    ↓ (Mongoose ODM)
Service Layer & Validation
    ↓ (MongoDB Wire Protocol)
MongoDB Database
```
**Why:** A standard MERN REST architecture ensures separation of concerns, scalability, and ease of development for a CSE student.

## 6. Frontend Architecture
- **Framework:** React.js using functional components and hooks.
- **Styling System:** Pure Tailwind CSS v4 utility classes (`@tailwindcss/vite`) with custom keyframe micro-animations for interactive state changes, modal popups, and live count calculation transitions.
- **Layout Architecture:** Modular component structure with a standalone top `Navbar` component (`frontend/src/components/layout/Navbar.tsx`) providing responsive client-side routing across all 4 core pages with a live Backend Connection status badge (`api.ts`).
- **REST API Client Integration:** `frontend/src/services/api.ts` connects all 4 pages to the Node.js Express backend endpoints (`/api/datasets`, `/api/students`, `/api/drives`, `/api/eligibility`) with automatic fallback to local state if backend is connecting.
- **UI Customization & Settings Engine:** Persistent `localStorage` UI settings module (`SettingsModal.tsx`) accessible via a top navbar button. Supports dynamic font size (Small, Medium, Large, XL), text scaling (90%-130%), text wrapping toggles, UI scale density (Compact, Normal, Spacious), and font family switching (Inter, Roboto, Outfit, Fira Code, System Sans) applied live to root CSS custom variables.
- **Routing:** React Router (`react-router-dom`) for client-side navigation.
- **State Management:** Context API (`AppContext.tsx`) for global state (auth, active dataset context, REST API data synchronization, persistent UI customization settings).
- **Reusable UI Components:** Component-driven architecture using Tailwind utility classes (Data Tables, Filter Modals, CSV Uploaders, Settings Modal, Badges, Cards).
- **Animations:** CSS keyframes and Tailwind transitions (`transition-all`, `animate-fade-in`, `animate-scale-up`, `hover:scale-105`) for dynamic UI updates.
- **Form Handling:** Formik or React Hook Form with Yup/Zod for validation.






## 7. Backend Architecture
- **Framework:** Node.js with Express.js.
- **Structure:** Layered architecture (Routes → Controllers → Services → Data Access/Models).
  - *Controllers:* Handle HTTP req/res, extract parameters.
  - *Services:* Contain core business logic (CSV parsing, filter evaluation, eligibility logic).
  - *Models:* Mongoose schemas.
- **Middleware:** Authentication, error handling, rate-limiting, and request validation (e.g., Joi/Zod).

## 8. Database Architecture
**Collections:**
- `Users`: Authentication and roles.
- `Datasets`: Metadata for uploaded CSVs.
- `Students`: Individual student records, referencing a `DatasetId`.
- `PlacementDrives`: Drive metadata, applied filters, referencing a `DatasetId`.
- `EligibilityRecords`: Links a `StudentId` to a `PlacementDriveId`.

**Why:** A normalized approach using a separate `EligibilityRecords` collection prevents massive document sizes and unbounded arrays, supporting efficient bi-directional querying.

## 9. Database Relationship Diagram
```text
[ Users ]
    |
    | manages
    v
[ Datasets ] --------- 1:N --------> [ PlacementDrives ]
    |                                        |
   1:N                                      1:N
    |                                        |
    v                                        v
[ Students ] <------- 1:N -------- [ EligibilityRecords ]
```
- **1 Dataset** has **Many Students**
- **1 Dataset** has **Many Placement Drives**
- **1 Placement Drive** has **Many Eligibility Records**
- **1 Student** has **Many Eligibility Records**

## 10. Dataset Architecture
- **Concept:** Every CSV upload creates a unique `Dataset` document (e.g., `_id`, `name`, `academicYear`, `status: 'Active' | 'Archived'`, `createdAt`).
- **Data Flow:** All subsequent students and drives are permanently tied to this `DatasetId`.
- **Reason:** Prevents accidental cross-contamination. Updating student records must occur within the scope of a specific Dataset.

## 11. CSV Import Architecture
- **Flow:** User uploads CSV → Backend stores temporarily → Parsing (e.g., `csv-parser`) → Header mapping & validation → Duplicate check → Return preview → User confirms → Bulk Insert (`insertMany`) into `Students` & creates `Dataset`.
- **Error Handling:** Collect all row errors and return a report (e.g., "Row 15: Invalid CGPA") instead of failing the entire file silently.
- **Trade-off:** Processing in memory is fine for 10,000 rows, but streams should be used for memory efficiency.

## 12. Student Management Architecture
- **Structure:** Flexible schema using Mongoose `Strict: false` for dynamic columns, OR a fixed core schema (ID, Name, CGPA, Branch) with an `extraAttributes` map.
- **Updating:** Students are updated individually or via re-uploading a dataset with matching primary keys (Roll Number) to perform an upsert.

## 13. Filter Engine Architecture
- **Concept:** JSON-based filter AST (Abstract Syntax Tree).
- **Frontend Representation:** Array of rule objects: `[{ field: 'cgpa', operator: 'gte', value: 7.5 }, { field: 'branch', operator: 'in', value: ['CSE'] }]`
- **Backend Processing:** A service module translates these JSON rules into MongoDB query objects (e.g., `{ cgpa: { $gte: 7.5 }, branch: { $in: ['CSE'] } }`).
- **Why:** Keeps the UI decoupled from MongoDB syntax and ensures security by validating operators and fields before execution.

## 14. Placement Drive Architecture
- **Metadata:** Company name, date, description, `datasetId`.
- **Filter Snapshot:** The exact JSON filter criteria used is saved inside the `PlacementDrive` document.
- **Status Lifecycle:** `Draft` → `Saved` → `Archived`.

## 15. Eligibility Architecture
- **Calculation Flow:** T&P Admin defines filter → Backend translates to MongoDB query → Queries `Students` in the selected `datasetId` → Returns count.
- **Saving Flow:** Upon saving the drive, the backend performs the query again, fetches `_id`s, and bulk inserts into `EligibilityRecords` (`driveId`, `studentId`, `datasetId`).
- **Why Separate Collection:** Option B (separate collection) is best. It avoids the MongoDB 16MB document limit and allows fast indexed queries.

## 16. Historical Snapshot Strategy
- **Strategy:** Once eligibility is calculated and a drive is saved, the `EligibilityRecords` act as the source of truth for history.
- **Edge Case Resolution:** If Student B's CGPA is later corrected, they do NOT automatically become eligible for past drives. The system requires explicit "Recalculate Eligibility" action by the Admin for a specific drive if they wish to update historical data.

## 17. API Architecture
- **Datasets:**
  - `POST /api/datasets/upload` (Upload & Preview)
  - `POST /api/datasets/confirm` (Save)
  - `GET /api/datasets`
- **Students:**
  - `GET /api/datasets/:id/students` (List/Filter)
  - `GET /api/students/:id/drives` (Student's drive history)
- **Placement Drives:**
  - `POST /api/drives` (Create & save eligibility)
  - `GET /api/datasets/:id/drives`
- **Eligibility:**
  - `POST /api/eligibility/preview` (Calculate count)
  - `GET /api/drives/:id/students` (Eligible students for drive)

## 18. Authentication & Authorization
- **Mechanism:** JWT (JSON Web Tokens) stored in HTTP-only cookies or Authorization header.
- **Roles:**
  - `Admin`: Full access (upload, create drives).
  - `Staff`: Read-only datasets, manage drives.
  - `Viewer`: Read-only access.
- **Implementation:** Express middleware checking `req.user.role`.

## 19. Validation Strategy
- **Frontend:** Immediate feedback using form validation (preventing invalid CGPA formats or empty fields).
- **Backend:** Request payload validation using a schema validator (Zod/Joi). Prevents malformed queries.
- **Database:** Mongoose schema constraints (e.g., `min: 0`, `max: 10` for CGPA).

## 20. Error Handling
- **Flow:** Database throws error → Service catches and passes to Controller → Next(err) to Global Error Middleware → Formatted JSON response `{ error: "Duplicate Key", details: "..." }` → Frontend UI displays Toast notification.

## 21. Audit Logging
- **Strategy:** Lightweight. Every `Dataset` and `PlacementDrive` includes `createdBy` (User ID) and `createdAt`/`updatedAt` timestamps. Critical actions (e.g., recalculating eligibility) can write a simple log document to an `AuditLogs` collection.

## 22. Performance & Scalability
- **Indexing:** Compound indexes on `DatasetId` + `Student Roll No`, and `DriveId` + `StudentId` in EligibilityRecords.
- **Pagination:** Essential for `GET /students` and `GET /eligible-students` using `limit` and `skip`.
- **Aggregations:** Use MongoDB aggregations for dashboard statistics (e.g., grouping by branch).

## 23. Security Architecture
- **Prevention:**
  - *NoSQL Injection:* Strict schema validation on filter payloads; never pass raw user input to `db.collection.find()`.
  - *XSS:* React handles escaping by default.
  - *File Uploads:* Restrict MIME types to `text/csv` and enforce size limits using `multer`.

## 24. UI/UX Logical Architecture
- **Layout:** Sidebar navigation (Datasets, Drives, Users), Topbar (Profile, Logout).
- **Page 1 (Datasets):** Data table with global search, column filters, and a "New Upload" modal (stepper: File Select → Preview → Confirm).
- **Page 2 (Drives):** List of historical drives. Clicking one opens a detail view with eligible student table.
- **Page 3 (Create Drive):** Form for drive metadata and a dynamic "Filter Builder" UI (Add Rule → Select Field → Select Operator → Enter Value). Real-time count preview button.

## 25. End-to-End Data Flows
1. **Upload Flow:** CSV → `/upload` API → Parsed JSON → React Preview → `/confirm` API → MongoDB `Datasets` & `Students`.
2. **Drive Flow:** Admin uses Filter Builder UI → `/preview` API → Backend builds Mongo Query → Returns count → Admin clicks Save → `/drives` API → Backend saves `PlacementDrive` and inserts `EligibilityRecords`.
3. **History Flow:** Admin opens Student X → `/students/X/drives` API → Queries `EligibilityRecords` → Joins with `PlacementDrives` → Displays list.

## 26. Project Directory Structure
```text
backend/
  ├── config/        (db.js - Mongoose connection)
  ├── controllers/   (datasetController.js, studentController.js, driveController.js, eligibilityController.js)
  ├── middlewares/   (errorHandler.js, uploadMiddleware.js)
  ├── models/        (User.js, StudentDataset.js, Student.js, PlacementDrive.js, EligibilityRecord.js)
  ├── routes/        (datasetRoutes.js, studentRoutes.js, driveRoutes.js, eligibilityRoutes.js)
  ├── services/      (csvParserService.js, eligibilityService.js)
  ├── utils/         (astTranslator.js)
  ├── .env.example
  ├── package.json
  └── server.js      (Express app entry point)


frontend/
  ├── src/
      ├── assets/
      ├── components/
          ├── layout/   (Navbar.tsx, AppLayout.tsx)
          ├── settings/ (SettingsModal.tsx)
          └── ui/       (Reusable Data Tables, Badges, Modals)
      ├── context/      (AppContext - Datasets, Drives, UI Settings State)
      ├── features/     (Domain specific: filter engine, csv parser)
      ├── hooks/        (Custom API hooks)
      ├── pages/        (DatasetsPage, StudentsPage, DrivesPage, CreateDrivePage)
      ├── services/     (Mock Data Service, Filter Engine Service)
      └── App.tsx


```
**Why:** Feature-based separation inside `pages/features` prevents monolithic component folders. Service layer in backend abstracts DB logic.

## 27. Architectural Decisions & Trade-offs
- **Embedding vs Referencing:**
  - *Decision:* Referencing (Normalization).
  - *Reason:* A student might be eligible for 50 drives. Embedding this in the Student document causes bloated documents and slow read operations. Separate `EligibilityRecords` scales better.
- **Filter AST vs Raw Queries:**
  - *Decision:* Intermediate JSON AST.
  - *Trade-off:* Requires writing a translator function in backend, but ensures security and keeps frontend DB-agnostic.
- **Updating Students:**
  - *Decision:* Snapshotted history. Drive eligibility does not auto-update.
  - *Reason:* Data integrity. Historical reports must reflect reality at the time of the drive.

## 28. MVP Scope
- Dataset upload (CSV) and listing.
- Fixed schema for students (ID, Name, CGPA, Branch, Gender, Backlogs).
- Filter Builder (AND conditions only).
- Drive creation and eligibility calculation.
- Drive history and student history viewing.
- Simple Admin authentication.

## 29. Future Scope
- **Version 2:** OR conditions in filters, student login portal, placement status tracking (Offered/Rejected), resume uploads, dynamic custom columns for CSV, automated email notifications.

## 30. Development Roadmap
1. **Phase 1: DB & Architecture:** Setup Node, Express, Mongoose. Define schemas.
2. **Phase 2: Authentication:** Implement JWT and Admin login.
3. **Phase 3: Dataset Module:** Implement `multer`, CSV parsing, validation, and saving.
4. **Phase 4: Frontend Basics:** Setup React, routing, and student list view.
5. **Phase 5: Filter Engine:** Build backend query translator and frontend Filter UI.
6. **Phase 6: Drives & Eligibility:** API for creating drives and inserting EligibilityRecords.
7. **Phase 7: Views:** Drive history and Student history pages.
8. **Phase 8: Polish:** Error handling, UI loaders, and edge-case testing.

## 31. Testing Strategy
- **Backend Unit Tests (Jest):** Thoroughly test the Filter AST → MongoDB query translator. Test CSV validation logic.
- **Backend Integration Tests:** Test the `POST /api/datasets/confirm` flow with mock CSV data.
- **Frontend Tests:** Ensure the Filter Builder component correctly outputs the expected JSON AST structure.

## 32. Deployment Architecture
- **Frontend:** Vercel or Netlify (Free, fast CI/CD).
- **Backend:** Render or Railway (Easy Node.js hosting, native environment variable management).
- **Database:** MongoDB Atlas (Free tier is sufficient for student projects).
- **Files:** Temporarily store CSV in memory/disk during processing, then discard. No need for AWS S3 unless supporting resume uploads later.

## 33. Risks & Edge Cases
- **Large CSVs:** Node.js memory limits. *Mitigation:* Use streaming CSV parsers.
- **Malformed Data:** e.g., missing Student IDs. *Mitigation:* Strict validation rejecting rows without primary keys, providing exact row numbers to the user.
- **Duplicate Drives:** Admin clicks 'Save' twice. *Mitigation:* Unique constraint on `(datasetId, driveName)` or debounce frontend buttons.

## 34. Final Recommended Architecture
The recommended architecture is a **Modular MERN Monolith**. It strictly enforces the boundary of **Datasets**, ensuring every student and drive operates within an isolated batch context. By utilizing an **AST Filter Engine** and a **Separate Eligibility Collection**, the system achieves a secure, highly scalable, and historically accurate placement tracking environment, perfectly suited for a college ecosystem and achievable by a CSE student.
