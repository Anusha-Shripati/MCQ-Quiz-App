# Remaining Work - MCQ Quiz Multi-Tenant SaaS

## Overview

This document outlines all remaining work to complete the multi-tenant SaaS platform. The project is currently **68% complete** with backend at 83% and frontend at 40%.

---

## Backend Remaining Work

### Phase 4.6: Usage Tracking & Enforcement

**Priority:** HIGH  
**Status:** ⏳ Not Started  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 4.2 (Plans), Phase 4.3 (Tenants)

#### What Needs to Be Built:

**1. Usage Service** (`src/platform/services/usage.service.ts`)
```typescript
Methods:
- checkUsageLimit(tenantId, metricType)
- incrementUsage(tenantId, metricType, amount)
- decrementUsage(tenantId, metricType, amount)
- getUsageStats(tenantId)
- resetUsage(tenantId, metricType)
- getCurrentUsage(tenantId, metricType)
```

**2. Usage Controller** (`src/platform/controllers/usage.controller.ts`)
```typescript
Endpoints:
- GET /api/v1/platform/usage/:tenantId
- GET /api/v1/platform/usage/:tenantId/:metric
- PUT /api/v1/platform/usage/:tenantId/:metric/reset
- GET /api/v1/platform/usage/summary
```

**3. Usage Enforcement Middleware** (`src/platform/middlewares/usage-enforcement.middleware.ts`)
```typescript
export const enforceUsageLimit = (metricType: UsageMetric) => {
  return async (req, res, next) => {
    const check = await usageService.checkUsageLimit(tenantId, metricType);
    if (!check.allowed) {
      return res.status(403).json({ message: 'Limit reached' });
    }
    next();
  };
};
```

**4. Integration with Tenant Controllers**

Update these routes to enforce limits:
- `/candidates` - Check candidates limit before creation
- `/assessments` - Check assessments limit before creation
- `/questions` - Check questions limit before creation
- `/upload` - Check storage_mb limit before upload

Add usage tracking:
```typescript
// After creation:
await usageService.incrementUsage(tenantId, 'candidates');

// After deletion:
await usageService.decrementUsage(tenantId, 'candidates');
```

#### Metrics to Track:
1. `candidates` - Increment on create, decrement on delete
2. `assessments` - Increment on create, decrement on delete
3. `questions` - Increment on create, decrement on delete
4. `storage_mb` - Increment on upload, decrement on delete
5. `api_calls` - Increment on every request (optional)

#### Files to Create:
```
src/platform/services/usage.service.ts
src/platform/controllers/usage.controller.ts
src/platform/middlewares/usage-enforcement.middleware.ts
src/platform/routes/usage.routes.ts
```

#### Testing Checklist:
- [ ] Usage limits block creation when reached
- [ ] Usage counters increment correctly
- [ ] Usage counters decrement correctly
- [ ] Unlimited plans (-1) bypass limits
- [ ] Usage stats are accurate
- [ ] Error messages guide to upgrade
- [ ] Integration works with all resources

---

## Frontend Remaining Work

### Step 5.3: Tenant Management

**Priority:** HIGH  
**Status:** ⏳ Not Started  
**Estimated Time:** 8-10 hours

#### What Needs to Be Built:

**1. Tenant List Page** (`src/app/(platform)/tenants/page.tsx`)

Features:
- List all tenants with pagination
- Search by name, slug, email
- Filter by status (active, suspended, trial, expired, cancelled)
- Filter by plan (Free, Pro, Enterprise)
- Filter by expiry date range
- Sort by name, created date, expiry date
- Quick actions (suspend, activate, view usage)

Table Columns:
- Tenant Name
- Slug (subdomain)
- Admin Email
- Plan (badge with color)
- Status (badge with color)
- Trial Ends / Subscription Ends
- Created At
- Actions (View, Edit, Suspend, Delete)

**2. Create Tenant Page** (`src/app/(platform)/tenants/create/page.tsx`)

Two Modes:
- **Manual Creation** - Just create tenant record
- **Auto Provision** - Create database + tenant record

Form Fields:
- Tenant Name (required)
- Slug (required, unique, auto-generate from name)
- Admin Email (required)
- Admin Name (required)
- Plan (dropdown, required)
- Database Name (auto-generated or manual)
- Database URL (auto-generated or manual)
- Subscription Type (Trial / Paid)
- Trial Days (if trial, default 14)
- Subscription End Date (if paid)

**3. Tenant Detail Page** (`src/app/(platform)/tenants/[id]/page.tsx`)

Sections:
- Tenant Info (name, slug, status, admin, plan, dates, database)
- Usage Statistics (candidates, assessments, questions, storage, API calls with progress bars)
- Actions (edit, change plan, suspend/activate, extend subscription)

**4. Components to Create:**
```
src/components/platform/tenants/
├── tenant-table.tsx
├── tenant-form.tsx
├── tenant-header.tsx
├── tenant-filters.tsx
├── tenant-detail-modal.tsx
├── tenant-status-badge.tsx
├── tenant-usage-chart.tsx
├── provision-tenant-form.tsx
└── suspend-tenant-dialog.tsx
```

**5. Platform Tenant Store** (`src/store/platformTenantStore.ts`)
```typescript
interface PlatformTenantStore {
  tenants: Tenant[];
  totalTenants: number;
  currentPage: number;
  perPage: number;
  searchQuery: string;
  statusFilter: string[];
  planFilter: string[];
  expiryDateRange: [Date | null, Date | null];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  setTenants: (tenants: Tenant[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPagination: (page: number, perPage: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}
```

---

### Step 5.4: Plan Management

**Priority:** HIGH  
**Status:** ⏳ Not Started  
**Estimated Time:** 4-6 hours

#### What Needs to Be Built:

**1. Plan List Page** (`src/app/(platform)/plans/page.tsx`)

Features:
- List all plans (card view + table view toggle)
- Search by plan name
- Filter by active/inactive
- Create new plan
- Edit plan
- Delete plan (if no tenants using it)
- Toggle active/inactive

Card View:
- Plan name
- Price
- Limits (candidates, assessments, questions, storage, API calls)
- Features (custom branding, API access, priority support)
- Tenant count using this plan
- Active/Inactive badge
- Actions (Edit, Delete, Toggle)

Table View:
- Name, Price, Candidates Limit, Assessments Limit, Questions Limit, Tenant Count, Status, Actions

**2. Plan Form** (`src/components/platform/plans/plan-form.tsx`)

Form Sections:
- **Basic Info:** Name, Description, Price, Active Status
- **Limits:** Candidates, Assessments, Questions, Storage MB, API Calls (-1 for unlimited)
- **Features:** Custom Branding, API Access, Priority Support, Advanced Analytics (checkboxes)

**3. Plan Detail Page** (`src/app/(platform)/plans/[id]/page.tsx`)

Sections:
- Plan details
- Limits breakdown
- Features list
- Tenants using this plan (table)
- Usage statistics across all tenants

**4. Components to Create:**
```
src/components/platform/plans/
├── plan-table.tsx
├── plan-form.tsx
├── plan-header.tsx
├── plan-card.tsx
├── plan-limits-form.tsx
└── plan-features-form.tsx
```

**5. Platform Plan Store** (`src/store/platformPlanStore.ts`)

---

### Step 5.5: Analytics & Dashboard (Complete)

**Priority:** MEDIUM  
**Status:** ⏳ Partially Done  
**Estimated Time:** 4-6 hours

#### What Needs to Be Built:

**1. Complete Dashboard** (`src/app/(platform)/dashboard/page.tsx`)

Currently has basic structure, needs:
- Stats cards with real data (Total Tenants, Active, Trial, Expired, Revenue, MRR)
- Tenant growth chart (line chart, last 12 months)
- Revenue chart (bar chart, last 12 months) - placeholder
- Plan distribution (pie chart)
- Status distribution (donut chart)
- Recent tenants table (last 10)
- Expiring soon table (next 7 days)
- High usage tenants table (near limits)

**2. Analytics Page** (`src/app/(platform)/analytics/page.tsx`)

Features:
- Date range selector
- Tenant growth metrics
- Usage metrics across all tenants
- Plan popularity
- Churn rate (placeholder)
- Revenue metrics (placeholder)
- Export data (CSV) - placeholder

**3. Components to Create:**
```
src/components/platform/dashboard/
├── tenant-growth-chart.tsx
├── revenue-chart.tsx
├── plan-distribution-chart.tsx
├── recent-tenants-table.tsx
├── expiring-tenants-table.tsx
└── high-usage-tenants-table.tsx
```

**4. Platform Dashboard Store** (`src/store/platformDashboardStore.ts`)

---

## Minor Fixes

### 1. Tenant User Avatar Image Display
**File:** `src/components/common/user-avatar.tsx`  
**Issue:** Uses wrong variable name for image display  
**Fix:** Update to use correct user image path

### 2. Upload Path Verification
**Files:** All upload-related components  
**Issue:** Ensure all uploads follow new structure  
**Fix:** Verify paths are `uploads/platform-admin/{userId}` and `uploads/tenants/{tenantSlug}/{userId}`

---

## Documentation Updates

### Files to Update:
1. `IMPLEMENTATION_PROGRESS.md` - Update Phase 4 and Phase 5 progress
2. `PHASE_4_BREAKDOWN.md` - Remove Phase 4.7, update status
3. `PHASE_5_STEP_5_IMPLEMENTATION_PLAN.md` - Update completed steps

---

## Priority Order

### Critical (Must Complete):
1. **Backend Phase 4.6** - Usage Tracking & Enforcement
2. **Frontend Step 5.3** - Tenant Management
3. **Frontend Step 5.4** - Plan Management

### Important (Should Complete):
4. **Frontend Step 5.5** - Complete Analytics & Dashboard

### Nice to Have:
5. Minor UI fixes
6. Documentation updates

---

## Estimated Timeline

| Task | Time | Priority |
|------|------|----------|
| Backend Phase 4.6 | 3-4 hours | Critical |
| Frontend Step 5.3 | 8-10 hours | Critical |
| Frontend Step 5.4 | 4-6 hours | Critical |
| Frontend Step 5.5 | 4-6 hours | Important |
| Minor Fixes | 1-2 hours | Nice to Have |
| Documentation | 1 hour | Nice to Have |

**Total Estimated Time: 21-29 hours (3-4 days full-time)**

---

## Success Criteria

### Backend Complete When:
- ✅ Usage limits enforce before resource creation
- ✅ Usage counters increment/decrement correctly
- ✅ Unlimited plans (-1) bypass limits
- ✅ Usage statistics API returns accurate data
- ✅ All tenant controllers integrated with usage tracking

### Frontend Complete When:
- ✅ Tenant management fully functional (list, create, edit, suspend, usage)
- ✅ Plan management fully functional (list, create, edit, delete, toggle)
- ✅ Dashboard shows all stats and charts
- ✅ Analytics page displays metrics
- ✅ All components use platform theme (Indigo/Violet)
- ✅ Responsive design works on all screens

### Project Complete When:
- ✅ All backend APIs functional
- ✅ All frontend pages built
- ✅ Usage tracking enforced
- ✅ Multi-tenant isolation verified
- ✅ No critical bugs
- ✅ Documentation updated

---

## Current Progress

**Overall Project: 68% Complete**

**Backend: 83% Complete**
- ✅ Phase 4.1: Platform Auth (100%)
- ✅ Phase 4.2: Plan Management (100%)
- ✅ Phase 4.3: Tenant Management (100%)
- ✅ Phase 4.4: Admin Management (100%)
- ✅ Phase 4.5: Provisioning (100%)
- ⏳ Phase 4.6: Usage Tracking (0%)

**Frontend: 40% Complete**
- ✅ Step 5.1: Authentication & Layout (100%)
- ✅ Step 5.2: Platform RBAC (100%)
- ⏳ Step 5.3: Tenant Management (0%)
- ⏳ Step 5.4: Plan Management (0%)
- ⏳ Step 5.5: Analytics & Dashboard (20%)

---

## Next Steps

1. **Start with Backend Phase 4.6** - Usage tracking is critical for production
2. **Then Frontend Step 5.3** - Tenant management is the main platform feature
3. **Then Frontend Step 5.4** - Plan management completes core functionality
4. **Finally Frontend Step 5.5** - Polish dashboard and analytics

---

## Notes

- All backend APIs are ready except usage tracking
- Frontend has solid foundation (auth, layout, RBAC)
- Main work is building tenant and plan management UIs
- Dashboard needs charts and real data integration
- No major blockers, just implementation work remaining

---

**Last Updated:** February 17, 2024
