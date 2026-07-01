# 🏫 EduCore ERP — Multi-Tenant School Management System

> **Single Codebase. Single Database. Multiple Schools.**
> A SaaS-style School ERP where one application instance serves multiple schools (tenants), each with their own fully customized branding, data isolation, subdomains, and configurable modules.

---

## 📌 1. Project Vision & Architecture

EduCore ERP ek aisa platform hai jo multiple schools (tenants) ko single code deployment se serve karta hai. Har school ke paas apna logo, color theme, and unique subdomain context (e.g. `schoola.localhost` or `schoolb.localhost`) hota hai. Backend endpoints context-aware hain aur automatic **Tenant Isolation** apply karte hain.

### 🏗️ Multi-Tenancy Design: Shared Database (MongoDB) with `tenantId`
- **Data Isolation**: Database ke sabhi tenant-specific tables/collections (`students`, `staff`, `users`, `classes`, `attendance`, `assignments`, `fees`) mein ek `tenantId` field save hoti hai.
- **Tenant Resolver Middleware**: Request ke source context (custom header `x-tenant-subdomain`, query parameter `?tenant=`, or domain host subdomain) ko read karke automatically request object pe active `tenantId` append karta hai.
- **Dynamic Branding (CSS Variables)**: Subdomain settings ke basic info ke mutabik client application logo, styling parameters (`--tenant-primary`, `--tenant-secondary`), and portal titles update kar leta hai.

---

## 🧰 2. Technology Stack

### Frontend
- **React.js (Vite)** — Single page application builder.
- **React Router Dom (v6)** — Role-based protected routes configuration.
- **Tailwind CSS** — Utility class-based styling supporting dynamic HSL/RGB colors.
- **Axios** — HTTP requests client with interceptors to inject JWT headers and `x-tenant-subdomain` dynamically.
- **Lucide React** — Premium svg vector icon pack.

### Backend
- **Node.js + Express.js** — Asynchronous backend environment and REST API routes.
- **Mongoose (MongoDB Atlas)** — Object Document Mapping (ODM) layer for database operations.
- **jsonwebtoken (JWT)** — Session credentials security (AccessToken in header + RefreshToken in HTTPOnly secure cookie).
- **bcryptjs** — User passwords hashing logic.

---

## 👥 3. User Roles & RBAC (Role-Based Access Control)

System supports dynamic role assignments linked to database permissions:
1. **Super Admin**: Global access to onboard new school tenants, monitor audit activity logs, configure plans, and platform-wide database counts.
2. **School Admin (Principal)**: School-level administrator with full access to classes, student admissions, staff directory, branding preferences, and billing.
3. **Teacher (Faculty)**: Custom class logs management, daily registers, homework creation, and submissions grading.
4. **Student**: Portal access to digital ID badge, detailed attendance cards, assignments submission form, and exam fees receipt checks.
5. **Parent** (Future): Guardians dashboard for child's marks, attendance notification, and online payments.

---

## 🧩 4. Implemented Modules Deep Dive

### 🔑 A. Authentication & Credentials Auto-Generation [Implemented ✅]
- **Secure Logins**: Session authorization utilizing JWT refresh token rotation logic.
- **Auto User Creation**: School administrator jab kisi Student ya Staff member (Teacher) ko onboard karta hai, system automatically backend mein ek `User` credential entry write karta hai using their email address.
- **Default Credentials**: Portal password defaults to `Password123` initially. The admin UI displays a popup success card showing credentials details so they can be copied immediately.
- **Cascade Deletion**: Student or Staff profile details delete karne par unke corresponding portal accounts automatic clean up ho jaate hain.

### 🏫 B. Super Admin platform controls [Implemented ✅]
- Onboard new school tenants with customized logo URL, subdomain routing key, and dynamic branding primary/secondary colors.
- Set plan enrollment limits (e.g. `maxStudents`).
- Monitor active audit logs (e.g. `TENANT_ONBOARDED`, `TENANT_DELETED`).

### 📝 C. School Admin Module [Implemented ✅]
- **Classes Configuration**: Create, edit, and delete school class groups and configure custom sections (e.g., `Class 10` - `A, B`).
- **Student Admissions (SIS)**: Form controls to admit students, generate random admission numbers, assign classes, sections, and configure parent contact info.
- **Staff directory**: Onboard principal, teachers, accountants, and registrars.

### 🎒 D. Student Portal Dashboard [Implemented ✅]
- **Digital ID Card**: Renders dynamic student profiles with photo, dob, section, parent details, and school branding headers.
- **Attendance Card**: Real-time summary of overall presence rate (e.g., `94.2%`) along with daily registers checklist (Present, Absent, Late).
- **Homework Tracker**: Lists class assignments. Students can open a submission modal to type their response and upload homework.
- **Fees & Billings Console**: Lists billing fee receipts. Pending invoices include a **Pay Now** action that prompts a secure credit card checkout interface, executes payment API, and returns transaction receipt details.

### 🍎 E. Teacher Portal Dashboard [Implemented ✅]
- **Teacher Metrics**: Live widgets tracking assigned classes count, total students count, attendance registers completed today, and pending grading assignments.
- **Daily Attendance Register**: Select Class, Section, and Date to load the students roster. Teachers can mark status (**Present**, **Absent**, **Late**) for each student and submit the daily log.
- **Homework Dispatcher**: Create homework assignments with title, description instructions, class section, subject category, and due date.
- **Submissions Evaluator**: Lists student homework uploads. Teachers can review text submissions, assign numerical grades (A+, A, B, etc.), write remarks, and submit feedback.

---

## 🚧 5. Planned & Remaining Modules (Roadmap)

### 📅 F. Timetable Scheduler [Planned 🚧]
- Class-wise and teacher-wise timetable builders.
- Conflict detection warning alerts if a teacher or classroom is double-booked.

### 💳 G. Commercial Fee Payment Gateway [Planned 🚧]
- Integration of live API endpoints for **Razorpay** (India) or **Stripe** (Global) to support actual student payment transaction clearing.

### 📑 H. Examination & Report Card Generator [Planned 🚧]
- Term-wise exam scheduling and subject scoring inputs.
- Auto GPA / CGPA grade calculations.
- Branded PDF report card download templates.

### 🚌 I. Transport & Hostel Modules [Planned 🚧]
- Vehicle routes tracking and driver details association.
- Hostel room allocations, fee charges, and custom dining menu notice.

### 📚 J. Library Management [Planned 🚧]
- Book indexing catalog cards database.
- Issue and return date trackers with automatic daily fine logic for late submissions.

### 💬 K. Communications Notice Board [Planned 🚧]
- Roles-targeted announcements panel.
- Real-time teacher-parent messaging utilizing Socket.io.

---

## 📁 6. Folder Directory Layout

```
school-managment-system/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI controls (e.g., ProtectedRoute)
│   │   ├── context/             # TenantThemeContext, AuthContext
│   │   ├── layouts/             # BaseLayout (Conditional role-based sidebar)
│   │   └── pages/               # Home (Student/Teacher panels), Login, SIS pages
│   └── package.json
└── server/                      # Express backend
    ├── src/
    │   ├── config/              # db.js (Mongoose Atlas client)
    │   ├── middlewares/         # tenantResolver, auth, rbac, errorHandler
    │   ├── models/              # student, staff, user, tenant, attendance, assignment, fee
    │   ├── routes/              # superadmin, students, staff, teachers, auth, classes
    │   ├── app.js               # Routing aggregation
    │   └── server.js            # Port entrypoint & development DB seeders
    └── package.json
```

---

## 🚀 7. Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- npm / yarn
- Connection URL for MongoDB Atlas (or local MongoDB Community server)

### Backend Configuration
1. Navigate to server folder:
   ```bash
   cd server
   ```
2. Create a `.env` file in the root workspace directory with the following variables:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/educore_db
   JWT_SECRET=dev_jwt_secret_key_1234567890
   JWT_REFRESH_SECRET=dev_jwt_refresh_secret_key_1234567890
   JWT_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   ```
3. Run the backend dev server (Seeds database automatically with demo details on first launch):
   ```bash
   npm install
   npm run dev
   ```

### Frontend Configuration
1. Navigate to client folder:
   ```bash
   cd client
   ```
2. Start the Vite React app:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔑 8. Demo Credentials & Test Accounts

Use these pre-seeded accounts under the `schoola` tenant subdomain to test implemented portal workflows (URL: `http://localhost:5173?tenant=schoola`):

| Portal Role | Login Email | Password | Features to Test |
|---|---|---|---|
| **School Admin** | `admin@schoola.com` | `Password123` | SIS Admissions, Onboarding, Classes CRUD |
| **Teacher (Faculty)** | `sunita@schoola.com` | `Password123` | Class Attendance logs, Publish Assignments, Grade submittals |
| **Student** | `aarav@schoola.com` | `Password123` | Dynamic ID badge, View logs, Submit Homework, Pay Exam Fees |
