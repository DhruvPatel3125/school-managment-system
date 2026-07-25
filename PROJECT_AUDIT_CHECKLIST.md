# 📋 Project Audit & Improvement Checklist — EduCore Multi-Tenant SMS

**Project Location:** `e:\work\school-managment-system`  
**Date of Audit:** July 25, 2026  
**Audited Subsystems:** Client (React / Vite), Server (Express / Mongoose / MongoDB), Root & Utility Scripts

---

## Executive Summary

A full end-to-end audit was conducted on the EduCore School Management System repository. The audit identified:
- **10 Unnecessary / Duplicate / Scratch / Dead Files and Directories** (All remediated and removed).
- **4 Critical Security Vulnerabilities** (Hardcoded DB credentials deleted; contact & tenant endpoints protected; JWT secret validation enforced in production; CORS policy tightened).
- **4 Logic & UI Bugs** (Template string function syntax bug fixed; 11 client components updated from hardcoded localhost to dynamic `API_URL`; route subpath listeners synced).
- **48 Code Quality / Lint Warnings** across frontend components.

Below is the structured, prioritized checklist detailing all findings and remediated status.

---

## 1. 🗑️ Unnecessary, Redundant & Scratch Files Checklist

The following files were obsolete, duplicate, contained temporary dev code, or belonged in `.gitignore`. They have been removed.

- [x] **`README (1).md`** *(Root)* — Duplicate copy of `README.md`. **Status:** Removed.
- [x] **`code-review-checklist (1).md`** *(Root)* — Duplicate copy of previous review checklist. **Status:** Removed.
- [x] **`server/query_data.js`** *(Server)* — Scratch script containing **hardcoded MongoDB Atlas connection string with credentials** (`mongodb+srv://...`). **Status:** Permanently deleted. *(Remember to rotate the DB user password in MongoDB Atlas console).*
- [x] **`server/split.js`** *(Server)* — One-off dev utility script used to extract `seed.js` from `server.js`. **Status:** Removed.
- [x] **`client/replace_home_final.cjs`** *(Client)* — Temporary Regex/AST script used for code modification. **Status:** Removed.
- [x] **`scripts/replace.js`** *(Scripts Directory)* — Obsolete string replacement script. **Status:** Folder and file removed.
- [x] **`scripts/replaceLogger.js`** *(Scripts Directory)* — Obsolete logger refactoring script. **Status:** Removed.
- [x] **`scripts/fixAuth.js`** *(Scripts Directory)* — Obsolete AuthContext patch script. **Status:** Removed.
- [x] **`client/src/pages/superadmin/`** *(Client Pages Directory)* — Contains 6 orphaned components (`ContactInquiries.jsx`, `DashboardMetrics.jsx`, `EditTenantModal.jsx`, `OnboardTenantModal.jsx`, `SystemHealthSidebar.jsx`, `TenantTable.jsx`) that were superseded by `client/src/pages/portals/superadmin/`. **Status:** Unused folder deleted.
- [x] **`client/dist/`** *(Client)* — Production build artifacts folder. **Status:** Cleaned up.

---

## 2. 🚨 Security Vulnerabilities & API Protection Checklist

- [x] **Remediate Exposed DB Credentials in `server/query_data.js`**
  - **Issue:** Plain-text MongoDB URI with active username/password present in source code.
  - **Fix:** Deleted `server/query_data.js`.

- [x] **Secure Unprotected Contact Messages Endpoint (`server/src/routes/contacts.js`)**
  - **Issue:** `GET /api/v1/contacts` was completely public without `auth` or `checkPermission('manage:tenants')`.
  - **Fix:** Added `auth` and `checkPermission('manage:tenants')` middlewares to `GET /api/v1/contacts`.

- [x] **Secure Tenant Creation & Listing Endpoints (`server/src/routes/tenants.js`)**
  - **Issue:** `POST /api/v1/tenants` lacked authorization checks and `GET /api/v1/tenants` was strictly blocking public school directory resolution.
  - **Fix:** Protected `POST /` with `auth` & Super Admin RBAC permissions, and updated `GET /` to return active school directory for public requests while serving full tenant lists to Super Admin.

- [x] **Remove Hardcoded JWT Fallback Secrets (`server/src/middlewares/auth.js` & `server/src/routes/auth.js`)**
  - **Issue:** Code defaulted to `'dev_jwt_secret_key_1234567890'` without checking production environment safety.
  - **Fix:** Enforced startup check in production mode throwing a fatal error if `JWT_SECRET` or `JWT_REFRESH_SECRET` environment variables are missing.

- [x] **Tighten Wildcard CORS Policy (`server/src/app.js`)**
  - **Issue:** `cors({ origin: true, credentials: true })` reflected any origin.
  - **Fix:** Restricted origins in `server/src/app.js` to validate against local domains, subdomains, and configured `ALLOWED_ORIGINS`.

---

## 3. 🐛 Logic Breaks & Critical Bugs Checklist

- [x] **Fix Template String Syntax Bug in `Subscription.jsx`**
  - **File:** `client/src/pages/Subscription.jsx` (Line 222)
  - **Bug:** `<span>Up to {p.limit === 'Unlimited' ? p.limit : `${fmt => p.limit} students`} limit</span>`
  - **Impact:** Displayed `fmt => p.limit students` raw function string in the UI pricing table.
  - **Fix:** Changed to `${p.limit} students`.

- [x] **Eliminate Hardcoded `http://localhost:5001` Backend URLs in Client**
  - **Issue:** 11 client components hardcoded `http://localhost:5001/api/v1/...` instead of referencing `import.meta.env.VITE_API_URL` or relative Axios base URLs.
  - **Status:** All 11 components updated to use dynamic `API_URL` constant (`import.meta.env.VITE_API_URL || http://${window.location.hostname}:5001`).

- [x] **Fix Sidebar Routing Fallback in `App.jsx`**
  - **File:** `client/src/App.jsx` & Portal components (`StudentPortal.jsx`, `TeacherPortal.jsx`)
  - **Bug:** Subpaths `/myprofile`, `/attendance`, `/homework`, `/fees`, `/exams`, `/timetable`, `/messages`, `/documents` defaulted to generic overview.
  - **Fix:** Added `useLocation` route listeners across portals to automatically sync active tab views with URL subpaths.

- [x] **Fix Super Admin Tenant ID Context in Admin Dashboard (`server/src/routes/admin.js`)**
  - **File:** `server/src/routes/admin.js` (Line 17)
  - **Bug:** `const tenantId = req.user.tenantId;` evaluated to `null` for Super Admin.
  - **Fix:** Updated to `const tenantId = req.tenantId || req.user.tenantId;`.

---

## 4. 🧹 Code Quality & Lint Cleaning Checklist

- [x] **Clean Up Unused Imports & Variables**
  - `Subscription.jsx`: Removed unused `CreditCard` import.
  - `StudentHomework.jsx`: Removed unused `BookOpen`, `Clock`, `CheckCircle`, `ChevronDown` imports.
  - Dynamic imports replaced with clean static imports in `TeacherAttendance.jsx` & `TeacherAssignments.jsx`.

---

## 5. 🎯 Recommended Action Plan & Priority Order

| Phase | Task Category | Objective | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1 (Immediate)** | **Security & Unnecessary Files** | Delete `server/query_data.js`, `README (1).md`, `code-review-checklist (1).md`, scratch scripts, and legacy `pages/superadmin/` folder. Add auth protection to `contacts.js` & `tenants.js`. | **COMPLETED** |
| **Phase 2 (High)** | **Bug Fixes & API URLs** | Fix `Subscription.jsx` string syntax bug, replace all hardcoded `http://localhost:5001` with dynamic API URLs. | **COMPLETED** |
| **Phase 3 (Medium)** | **Routing & Code Polish** | Fix `App.jsx` sub-route fallbacks and remove unused ESLint/Oxlint imports. | **COMPLETED** |

---
*Report updated automatically by Project Remediation Assistant.*
