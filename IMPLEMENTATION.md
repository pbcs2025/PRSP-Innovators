# Implementation Guide: Role-Specific Dashboards

This document describes the implementation of **role-specific dashboards** in the KYC SSE System, and how each role works in the application.

---

## Role Permissions Overview

| Action       | Admin | Officer | Auditor |
|-------------|-------|---------|---------|
| Add KYC     | ✅    | ✅      | ❌      |
| Search      | ✅    | ✅      | ✅      |
| Decrypt     | ✅    | ✅      | ❌      |
| View Logs   | ✅    | ❌      | ✅      |
| Manage Users| ✅    | ❌      | ❌      |
| Anomalies   | ✅    | ❌      | ❌      |

---

## How Roles Work

### Admin
- Full system access
- Adds and searches KYC records
- Can decrypt and view full KYC data
- Manages users (create, deactivate)
- Views audit logs and anomaly-detection results
- Backend: `rolesRequired('admin')` on admin routes; KYC routes return `encrypted_dek` for admin/officer

### Officer
- Operational focus: add and search KYC
- Can decrypt and view full KYC data (for customer servicing)
- Cannot view audit logs (separation of duties)
- Cannot manage users or see anomalies
- Backend: `rolesRequired('admin', 'officer')` on `/kyc/add`, `/kyc/:record_id`; search returns `encrypted_dek` for officer

### Auditor
- Compliance / audit focus
- Can search to verify records exist (trapdoor search)
- Cannot decrypt; sees “no permission” for decrypted data
- Views audit logs for compliance review
- Backend: `rolesRequired('admin', 'officer', 'auditor')` on `/kyc/search`; `/logs` allows admin and auditor; search does **not** return `encrypted_dek` for auditor

---

## Step 1: Role-Specific Dashboard Components

Created three dashboards under `frontend/src/components/dashboards/`:

| File              | Role    | Purpose                                                |
|-------------------|---------|--------------------------------------------------------|
| `AdminDashboard.jsx`  | Admin   | Full controls: Add KYC, Search, Audit Logs, Anomalies, Users |
| `OfficerDashboard.jsx`| Officer | Add KYC + Search only                                 |
| `AuditorDashboard.jsx`| Auditor | Audit Logs + Verify Search                            |

---

## Step 2: Shared Layout

`DashboardLayout.jsx` provides:

- Common nav bar with role badge
- User name and logout button
- Slot for role-specific nav items and main content

---

## Step 3: Routing by Role

In `Dashboard.jsx`:

```js
switch (role) {
  case 'admin':   return <AdminDashboard />;
  case 'officer': return <OfficerDashboard />;
  case 'auditor': return <AuditorDashboard />;
  default:        return <AdminDashboard />;
}
```

Role comes from `useAuthStore()` (set at login from JWT).

---

## Step 4: Backend RBAC Alignment

| Route                 | Allowed Roles | Notes                                      |
|-----------------------|---------------|--------------------------------------------|
| `POST /kyc/add`       | admin, officer| Add encrypted KYC                          |
| `POST /kyc/search`    | admin, officer, auditor | All can search; admin/officer get DEK |
| `GET /kyc/:record_id` | admin, officer| Get full record for decryption             |
| `GET /logs`           | admin, auditor| Query access logs                          |
| `GET /admin/users`    | admin         | List users                                 |
| `POST /admin/users/:id/deactivate` | admin | Deactivate user                    |
| `GET /admin/anomalies`| admin         | Anomaly-flagged logs only                  |

---

## Step 5: UI Behavior by Role

- **Admin**: Nav shows Add KYC, Search, Audit Logs, Anomalies, Users. Full CRUD and monitoring.
- **Officer**: Nav shows Add KYC, Search. Info banner about encryption.
- **Auditor**: Nav shows Audit Logs, Verify Search. Info banner explaining no decryption. Search results show “no permission to decrypt” when a record is found.

---

## Step 6: New Components Added

- `AnomaliesPanel.jsx` – Admin-only panel calling `GET /admin/anomalies`
- `DashboardLayout.jsx` – Shared layout wrapper
- `dashboards/AdminDashboard.jsx`, `OfficerDashboard.jsx`, `AuditorDashboard.jsx`

---

## File Structure After Implementation

```
frontend/src/
├── components/
│   ├── Dashboard.jsx          # Routes by role
│   ├── DashboardLayout.jsx    # Shared layout
│   ├── AnomaliesPanel.jsx     # Admin anomalies
│   ├── dashboards/
│   │   ├── AdminDashboard.jsx
│   │   ├── OfficerDashboard.jsx
│   │   └── AuditorDashboard.jsx
│   ├── AddKYC.jsx
│   ├── SearchKYC.jsx
│   ├── RecordView.jsx         # Respects canDecrypt (admin/officer)
│   ├── AuditLogs.jsx
│   └── UserManagement.jsx
```

---

## Testing Each Role

1. Create users for each role via Admin (or `create-admin.js` + register).
2. Log in as **admin** – all tabs visible.
3. Log in as **officer** – Add KYC + Search only; can decrypt.
4. Log in as **auditor** – Audit Logs + Search; search finds records but decryption shows “no permission”.

---

## Triggering Anomaly Records (for Demo)

Anomalies are created when any user (admin, officer, or auditor) exceeds **10 KYC searches within 60 seconds**.

### What happens

1. Searches 1–10: Normal behavior.
2. Search 11+: User is **blocked** with 429. The search is not executed. An anomaly is logged.
3. Admins see blocked attempts in **Anomalies** tab and **Audit Logs** (filter: "Search Blocked (Anomaly)" or "Anomalies Only").
4. After 60 seconds without searching, the user gets a fresh window.

### Rate limiting

- Uses **MongoDB** by default (works without Redis).
- If Redis is available, Redis is used for faster checks.
- Thresholds: 10 searches per 60-second window per user.

---

## Summary

Each role now has a dedicated dashboard that exposes only the actions allowed by RBAC. The UX and nav match each role's responsibilities and permissions.
