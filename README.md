# 🏫 EduCore ERP — Multi-Tenant School Management System

> **Single Codebase. Single Deployment. Multiple Schools.**
> A SaaS-style School ERP where one application instance serves 2–3+ schools, each with their own fully customized branding, data isolation, and configurable modules.

**Stack:** React.js (Frontend) · Node.js + Express (Backend) · MySQL (Database)

---

## 📌 1. Project Vision

Ek hi platform develop karenge jo multiple schools (tenants) ko serve kare. Har school ko lagega ki ye unka **apna dedicated system** hai — apna logo, apna color theme, apna subdomain (e.g. `dpsindia.educore.app`, `stmarys.educore.app`) — lekin backend mein ek hi codebase aur ek hi server chal raha hoga. Isse maintenance, bug-fixing, aur naye features ek jagah update karne se sabhi schools ko mil jaate hain.

### Why Multi-Tenant (not 3 separate projects)?
| Approach | Maintenance | Cost | Customization |
|---|---|---|---|
| 3 separate projects/DBs | Triple work for every fix/feature | High (3x hosting) | Full but painful |
| **Single app, multi-tenant** ✅ | One codebase, fix once, deploy once | Low (shared hosting) | Per-tenant settings table handles it |

---

## 🏗️ 2. Multi-Tenancy Architecture (Core Decision)

Is project ka sabse important decision ye hai — **kaise ek hi app 3 schools ko serve karegi.**

### Recommended Approach: **Shared Database, Shared Schema + `tenant_id`**

Har table mein ek `tenant_id` (school ka unique ID) column hoga. Har query automatically `WHERE tenant_id = ?` filter ke saath chalegi (middleware se enforce hoga, manually har baar nahi likhna padega).

```
Request → school1.educore.app/login
   ↓
Middleware: Subdomain se tenant resolve karo → tenant_id = 1
   ↓
Database query: SELECT * FROM students WHERE tenant_id = 1
   ↓
Response: Sirf School 1 ka data
```

**Tenant identification methods (use any one or combine):**
1. **Subdomain-based** (recommended): `schoolA.educore.app`, `schoolB.educore.app`
2. **Custom domain mapping**: school apna khud ka domain point kar sake (`erp.schoolA.com`) — advanced, Phase 2 ke baad
3. **Login-time school selection**: user login karte waqt dropdown se school select kare (simplest, beginner-friendly)

> ⚠️ **Alternative (for stricter isolation):** Agar future mein 10+ schools ya bohot sensitive data ho, toh "Database-per-Tenant" approach use kar sakte ho (har school ki alag MySQL database, connection pool dynamically switch hota hai). Abhi 2-3 schools ke liye shared-schema approach simplest aur sufficient hai — scale karna easy rahega.

### What gets customized per school (`tenant_settings` table):
- Logo, favicon, primary/secondary brand colors
- School name, address, contact info (header/footer/receipts pe print hoga)
- Academic year format, grading system (percentage / GPA)
- Enabled/disabled modules (e.g. School A ko transport module nahi chahiye)
- Fee structure, payment gateway keys
- Email/SMS sender ID

---

## 🧰 3. Technology Stack

### Frontend
| Tool | Purpose |
|---|---|
| React.js 18 (Vite) | Core UI framework, fast dev build |
| React Router v6 | Routing, tenant-aware nested routes |
| Redux Toolkit | Global state (auth, tenant theme, user role) |
| TanStack Query (React Query) | Server-state caching, API data fetching |
| Tailwind CSS | Styling — easy to theme dynamically per tenant |
| Axios | API calls with interceptors (auto attach JWT + tenant header) |
| React Hook Form + Zod | Forms + validation |
| Recharts | Dashboard graphs/analytics |
| React-Toastify | Notifications/alerts |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MySQL2 + Sequelize ORM | DB access, migrations, models |
| JWT (jsonwebtoken) | Authentication tokens (access + refresh) |
| bcrypt | Password hashing |
| Multer + Sharp | File/image uploads (student photos, documents) |
| Nodemailer | Email notifications |
| Twilio / MSG91 | SMS notifications (India-friendly: MSG91) |
| node-cron | Scheduled jobs (fee reminders, attendance auto-lock) |
| Socket.io | Real-time notifications, chat |
| Helmet, express-rate-limit, cors | Security middlewares |
| Joi / Zod | Request validation |
| PDFKit / Puppeteer | Report cards, fee receipts, ID cards, certificates (PDF) |

### Database
- **MySQL 8.x** — relational, mature, perfect fit for structured academic data
- Sequelize migrations for version-controlled schema changes

### DevOps / Infra
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local dev parity, easy deployment |
| GitHub Actions | CI/CD pipeline |
| Nginx | Reverse proxy, subdomain routing, SSL termination |
| PM2 | Node process manager (production) |
| Hosting | DigitalOcean / AWS EC2 / Render (backend), Vercel/Netlify or same server (frontend) |
| Cloudflare | DNS + wildcard subdomain SSL (`*.educore.app`) |
| Razorpay | Online fee payment gateway (India) |

---

## 👥 4. User Roles & Permissions (RBAC)

| Role | Access Level |
|---|---|
| **Super Admin** | Manages all tenants (schools), onboards new schools, global analytics, billing |
| **School Admin** | Full access within their own school only |
| **Teacher** | Attendance, marks entry, homework, timetable (own classes only) |
| **Student** | View own attendance, marks, homework, fee status, notices |
| **Parent** | View child's data, pay fees, message teachers |
| **Accountant** | Fee collection, payroll, financial reports |
| **Librarian** | Library module only |

Permissions table design: `roles`, `permissions`, `role_permissions` (many-to-many) — flexible, so future custom roles bhi easily ban sakein.

---

## 🧩 5. Complete Module List

### A. Platform-Level (Super Admin)
1. Tenant (School) Onboarding & Management
2. Subscription/Billing tracking (optional, future)
3. Global usage analytics
4. System-wide announcements

### B. Core School Modules
5. **Authentication & RBAC** — login, JWT refresh, forgot password, role-based routing
6. **Student Information System** — admission, profile, documents, ID card generation
7. **Staff Management** — HR records, qualifications, documents
8. **Class & Section Management**
9. **Subject & Curriculum Management**
10. **Attendance** — student + staff, daily/period-wise, auto SMS to parents on absence
11. **Timetable Management** — class-wise, teacher-wise conflict detection
12. **Examination & Grading** — exam scheduling, marks entry, auto grade calculation, report card PDF
13. **Homework / Assignment Module** — upload, submission, teacher review
14. **Fee Management** — fee structure setup, installments, online payment (Razorpay), receipts
15. **Payroll Management** — staff salary, deductions, payslip generation
16. **Library Management** — catalog, issue/return, fine calculation
17. **Transport Management** — routes, vehicles, student-route mapping, GPS (future)
18. **Hostel Management** — room allocation, attendance
19. **Notice Board / Announcements** — targeted by class/role
20. **Messaging/Chat** — teacher-parent communication
21. **Calendar & Events**
22. **Inventory Management** — school assets/stock
23. **Reports & Analytics Dashboard** — attendance %, fee collection %, performance trends
24. **Certificate Generator** — bonafide, transfer certificate, character certificate (PDF templates)
25. **Visitor Management** — gate entry log (optional, advanced)

### C. Tenant Customization Layer
26. Branding settings (logo, theme color, school info)
27. Module enable/disable toggles per school
28. Custom fee heads & academic year config

---

## 🗄️ 6. Database Design (Key Tables)

```
tenants                 → id, school_name, subdomain, logo_url, theme_color, status
tenant_settings          → tenant_id, key, value (flexible config store)
users                    → id, tenant_id, name, email, password_hash, role_id, status
roles, permissions, role_permissions

students                 → id, tenant_id, admission_no, name, dob, class_id, section_id, guardian info
staff                    → id, tenant_id, name, designation, department, joining_date

classes, sections, subjects, class_subjects

attendance_students      → id, tenant_id, student_id, date, status
attendance_staff         → id, tenant_id, staff_id, date, status

timetable                → id, tenant_id, class_id, day, period, subject_id, teacher_id

exams, exam_subjects, marks → exam results storage

fee_structure             → tenant_id, class_id, fee_head, amount, due_date
fee_payments               → tenant_id, student_id, amount_paid, payment_mode, txn_id, receipt_no
payroll                    → tenant_id, staff_id, month, basic, deductions, net_pay

library_books, book_issues
transport_routes, vehicles, student_transport
hostel_rooms, hostel_allocations

notices, messages
inventory_items
audit_logs                 → tenant_id, user_id, action, table_name, timestamp
```

> 🔑 **Golden Rule:** Every tenant-scoped table has a `tenant_id` foreign key. A global Sequelize hook/middleware auto-injects `WHERE tenant_id = req.tenantId` so developers can't accidentally leak data across schools.

---

## 📁 7. Suggested Folder Structure

### Backend (`/server`)
```
server/
├── src/
│   ├── config/          # db.js, env config
│   ├── middlewares/      # auth.js, tenantResolver.js, errorHandler.js, rbac.js
│   ├── models/           # Sequelize models
│   ├── controllers/      # business logic per module
│   ├── routes/           # /api/v1/students, /api/v1/fees, etc.
│   ├── services/         # email, sms, pdf generation, payment gateway
│   ├── validations/      # Zod/Joi schemas
│   ├── jobs/              # cron jobs (fee reminders)
│   └── utils/
├── migrations/
├── seeders/
└── server.js
```

### Frontend (`/client`)
```
client/
├── src/
│   ├── api/              # axios instance + endpoint functions
│   ├── app/store.js      # Redux store
│   ├── features/          # feature-based: students/, fees/, attendance/, exams/
│   ├── components/         # shared UI (Button, Table, Modal)
│   ├── layouts/             # AdminLayout, TeacherLayout, StudentLayout
│   ├── pages/
│   ├── routes/              # role-based protected routes
│   ├── hooks/
│   ├── context/             # TenantThemeContext (dynamic branding)
│   └── utils/
```

---

## 🗺️ 8. Phase-Wise Development Roadmap

> Estimated for a small team (2–3 devs) or a focused solo dev. Adjust timelines to your pace.

### **Phase 0 — Planning & Requirement Finalization** (1 week)
- Finalize module list with actual school stakeholders
- Wireframes (Figma) for Admin, Teacher, Student, Parent dashboards
- Finalize multi-tenancy strategy & DB schema (ERD)
- Setup GitHub repo, project board (Jira/Trello)

### **Phase 1 — Project Foundation** (1–2 weeks)
- Backend: Express server, MySQL connection, Sequelize setup, base folder structure
- Frontend: Vite + React setup, Tailwind config, routing skeleton
- Tenant resolver middleware (subdomain → tenant_id)
- Docker Compose for local dev (Node + MySQL)
- CI pipeline (lint + basic tests on push)

### **Phase 2 — Authentication & Tenant Core** (2 weeks)
- Super Admin: tenant onboarding (create school, subdomain, default admin)
- JWT login/logout, refresh token flow, forgot password
- RBAC middleware (role + permission based route guards)
- Tenant branding system (logo/theme fetched dynamically on app load)

### **Phase 3 — Student & Staff Management** (2–3 weeks)
- Student admission form, profile, document upload
- Staff records, department/designation management
- Class & Section CRUD
- ID card PDF generation

### **Phase 4 — Academic Operations** (2–3 weeks)
- Attendance module (student + staff), bulk marking UI
- Timetable builder with conflict detection
- Subject & curriculum mapping

### **Phase 5 — Examination & Results** (2 weeks)
- Exam scheduling, marks entry (teacher), grade auto-calculation
- Report card PDF generation (school-branded template)
- Result analytics (class average, topper list)

### **Phase 6 — Finance Module** (2–3 weeks)
- Fee structure setup (class-wise, installment-wise)
- Razorpay integration for online payment
- Receipt generation, due-date reminders (cron + SMS/email)
- Payroll: salary structure, payslip PDF

### **Phase 7 — Communication & Engagement** (1–2 weeks)
- Notice board (targeted by class/role)
- Teacher-parent messaging (Socket.io real-time)
- Homework/assignment upload + submission tracking

### **Phase 8 — Extended Modules** (2–3 weeks)
- Library (catalog, issue/return, fines)
- Transport (routes, vehicle-student mapping)
- Hostel (room allocation)
- Inventory management

### **Phase 9 — Dashboards & Analytics** (1–2 weeks)
- Role-specific dashboards with charts (attendance %, fee collection %, performance trends)
- Exportable reports (PDF/Excel)

### **Phase 10 — Tenant Customization Polish** (1–2 weeks)
- Full theme customizer for school admins (colors, logo, header text)
- Module enable/disable toggle UI for Super Admin
- Multi-language support (optional, if needed)

### **Phase 11 — Testing & Security Hardening** (1–2 weeks)
- Unit + integration tests (Jest, Supertest)
- Cross-tenant data leak testing (critical!)
- Rate limiting, input sanitization, audit logs review
- Load testing for concurrent school usage

### **Phase 12 — Deployment** (1 week)
- Production server setup (Nginx + PM2 + wildcard SSL via Cloudflare)
- Subdomain auto-provisioning for new schools
- Automated DB backups
- Environment-based config (.env per stage)

### **Phase 13 — Documentation & Handover**
- API documentation (Postman/Swagger)
- Admin user manual per role
- Deployment runbook

**📊 Total estimated timeline: ~22–28 weeks** (solo dev: longer; 2–3 dev team: faster, modules can run in parallel from Phase 3 onward)

---

## 🔐 9. Security Checklist
- [ ] Every DB query scoped by `tenant_id` (no cross-school leaks)
- [ ] Passwords hashed with bcrypt (never plain text)
- [ ] JWT short-lived access token + httpOnly refresh token
- [ ] Input validation on every API endpoint (Zod/Joi)
- [ ] Rate limiting on auth routes (brute-force protection)
- [ ] File upload type/size validation (no malicious files)
- [ ] HTTPS everywhere (Cloudflare/Nginx SSL)
- [ ] Audit logs for sensitive actions (fee edits, marks edits, deletions)
- [ ] Regular automated MySQL backups

---

## 🚀 10. Future Enhancements (Post-MVP)
- Mobile app (React Native) reusing same backend APIs
- AI-based attendance (face recognition)
- Online exam/quiz module
- Database-per-tenant migration path if scaling beyond ~15-20 schools
- WhatsApp Business API integration for notifications
- Custom domain mapping per school (instead of subdomain only)

---

## ✅ Suggested First Steps (Right Now)
1. Finalize ER diagram for core tables (tenants, users, students, classes)
2. Setup monorepo: `/client` + `/server` in one GitHub repo (or separate repos — your call)
3. Build Phase 1 (foundation) end-to-end before touching any feature module
4. Get tenant resolver + RBAC rock solid first — everything else depends on it

---

*Is README ko apne project root mein rakho — jaise jaise development aage badhe, har phase complete hone par usse ✅ mark karte jaana, taaki progress track easily ho sake.*
