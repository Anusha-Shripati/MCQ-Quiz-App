# Phase 5 Step 5: Platform Admin UI Implementation Plan

## Overview

This document provides a detailed implementation plan for building the Platform Admin UI. The platform UI will mirror the tenant RBAC structure but with a distinct admin-focused design and separate components.

---

## Key Principles

1. **Copy Tenant Logic** - Exact same authentication, RBAC, and functionality as tenant
2. **Different Design** - Modern platform admin UI with Indigo/Violet theme and trending colors
3. **Separate Components** - Create platform-specific components, don't reuse tenant components
4. **Same Base Components** - Use same Button, Input, Card, Table components but with different styling/classes
5. **No API Integration** - UI only, backend APIs are being developed by another team
6. **Easy Backend Integration** - When APIs are ready, just swap endpoints

---

## Implementation Strategy

**Copy → Customize → Test**

1. **Copy** - Copy exact component logic/structure from tenant
2. **Customize** - Change colors, spacing, routes, store names, labels
3. **Test** - Verify functionality with mock data

This ensures consistency and speeds up development!

---

## Design Implementation Guidelines

### What to Keep Same

1. **Component Structure** - Use same Button, Input, Card, Table components from `@/components/ui`
2. **Logic & Flow** - Exact same functionality and user flow as tenant
3. **Layout Structure** - Same grid, flex, and positioning patterns
4. **Form Validation** - Same validation rules and error handling
5. **Data Fetching** - Same SWR patterns and loading states
6. **State Management** - Same Zustand store patterns

### What to Change

1. **Colors** - Indigo/Violet theme instead of tenant colors
2. **Spacing** - More whitespace (larger padding/gaps)
3. **Shadows** - More prominent shadows for depth
4. **Gradients** - Add subtle gradients on backgrounds and buttons
5. **Typography** - Larger headings, bolder text
6. **Borders** - More rounded corners
7. **Labels** - Change text ("User" → "Platform Admin")
8. **Routes** - Platform-specific (`/user` → `/platform/admins`)
9. **Stores** - Platform-specific (`authStore` → `platformAuthStore`)

---

## Design System for Platform UI

### Color Palette (Modern & Professional)

**Primary Colors:**
- Primary: `#6366f1` (Indigo 500) - Main brand color
- Primary Dark: `#4f46e5` (Indigo 600) - Hover states
- Primary Light: `#818cf8` (Indigo 400) - Accents

**Secondary Colors:**
- Secondary: `#8b5cf6` (Violet 500) - Secondary actions
- Accent: `#06b6d4` (Cyan 500) - Highlights

**Neutral Colors:**
- Background: `#f8fafc` (Slate 50) - Light mode background
- Surface: `#ffffff` - Cards and surfaces
- Border: `#e2e8f0` (Slate 200) - Borders
- Text Primary: `#0f172a` (Slate 900) - Main text
- Text Secondary: `#64748b` (Slate 500) - Secondary text

**Dark Mode:**
- Background: `#0f172a` (Slate 900)
- Surface: `#1e293b` (Slate 800)
- Border: `#334155` (Slate 700)
- Text Primary: `#f1f5f9` (Slate 100)
- Text Secondary: `#94a3b8` (Slate 400)

**Status Colors:**
- Success: `#10b981` (Emerald 500)
- Warning: `#f59e0b` (Amber 500)
- Error: `#ef4444` (Red 500)
- Info: `#3b82f6` (Blue 500)

### Typography

**Font Family:** Inter (same as tenant)

**Font Sizes:**
- H1: `text-4xl` (36px) - Page titles
- H2: `text-3xl` (30px) - Section titles
- H3: `text-2xl` (24px) - Card titles
- Body: `text-base` (16px) - Regular text
- Small: `text-sm` (14px) - Helper text

### Spacing & Layout

**More Whitespace:**
- Card padding: `p-8` (32px) instead of `p-6` (24px)
- Section gaps: `gap-8` (32px) instead of `gap-6` (24px)
- Form field spacing: `space-y-6` (24px) instead of `space-y-4` (16px)

**Rounded Corners:**
- Cards: `rounded-xl` (12px) instead of `rounded-lg` (8px)
- Buttons: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)

### Component Styling Differences

**Cards:**
- Larger shadows: `shadow-xl` instead of `shadow-lg`
- More padding: `p-8` instead of `p-6`
- Subtle gradient backgrounds
- Border: `border border-slate-200 dark:border-slate-700`

**Buttons:**
- Same component, different colors:
  - Primary: `bg-indigo-600 hover:bg-indigo-700`
  - Secondary: `bg-violet-600 hover:bg-violet-700`
  - Outline: `border-indigo-600 text-indigo-600 hover:bg-indigo-50`
- Slightly larger: `h-11` instead of `h-10`
- More padding: `px-6` instead of `px-4`

**Inputs:**
- Same component, different styling:
  - Border: `border-slate-300 dark:border-slate-600`
  - Focus: `focus:border-indigo-500 focus:ring-indigo-500`
  - Background: `bg-white dark:bg-slate-800`
- Larger height: `h-11` instead of `h-10`

**Tables:**
- Header background: `bg-slate-50 dark:bg-slate-800`
- Row hover: `hover:bg-indigo-50 dark:hover:bg-slate-800`
- Striped rows: Subtle `bg-slate-50/50 dark:bg-slate-800/50`
- Border: `border-slate-200 dark:border-slate-700`

**Badges:**
- Status badges with gradient backgrounds
- Active: `bg-gradient-to-r from-emerald-500 to-emerald-600`
- Trial: `bg-gradient-to-r from-blue-500 to-blue-600`
- Suspended: `bg-gradient-to-r from-amber-500 to-amber-600`
- Expired: `bg-gradient-to-r from-red-500 to-red-600`

**Sidebar:**
- Gradient background: `bg-gradient-to-b from-indigo-600 to-violet-700`
- Active item: `bg-white/10 backdrop-blur-sm`
- Hover: `hover:bg-white/5`
- Icons: Larger and more prominent

**Header:**
- Subtle shadow: `shadow-sm`
- Border bottom: `border-b border-slate-200 dark:border-slate-700`
- Background: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`

### Visual Enhancements

**Gradients:**
- Login page background: `bg-gradient-to-br from-indigo-50 via-white to-violet-50`
- Dark mode: `bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950`
- Button gradients: `bg-gradient-to-r from-indigo-600 to-violet-600`

**Shadows:**
- Cards: `shadow-xl hover:shadow-2xl transition-shadow`
- Buttons: `shadow-md hover:shadow-lg`

**Animations:**
- Smooth transitions: `transition-all duration-200`
- Hover effects on all interactive elements
- Fade-in animations: `animate-in fade-in duration-300`

**Icons:**
- Larger icons in navigation: `w-6 h-6` instead of `w-5 h-5`
- Colored icons matching the theme

---

## Implementation Priority & Flow

### Step 5.1: Authentication & Layout (Priority: CRITICAL)
- Platform admin login page
- Forgot password page
- Reset password page
- Platform auth store
- Platform layout (header + sidebar)
- Navigation components
- Theme & base components

### Step 5.2: Platform RBAC (Priority: HIGH)
- Platform admin management (list, create, edit, delete)
- Platform roles management
- Platform permissions management
- Module management

### Step 5.3: Tenant Management (Priority: HIGH)
- Tenant list with filters
- Create tenant (manual + provisioning)
- Edit tenant details
- Suspend/activate tenant
- View tenant usage statistics

### Step 5.4: Plan Management (Priority: MEDIUM)
- Plan list
- Create/edit plans
- Plan limits configuration
- Plan features toggles

### Step 5.5: Analytics & Dashboard (Priority: MEDIUM)
- Platform dashboard
- Usage analytics
- Tenant statistics
- Revenue metrics (placeholder)

---

## Detailed Implementation Steps

---

## Step 5.1: Authentication & Layout (Copy Logic, Different Design)

### Priority: CRITICAL
### Estimated Time: 8-10 hours

### Tenant Auth Structure to Copy:
```
Tenant:
- Login: src/components/common/login.tsx
- Reset Password: src/app/reset-password/page.tsx
  - Step 1: Enter Email (src/components/user/Step1.tsx)
  - Step 2: Validate OTP (src/components/user/Step2.tsx)
  - Step 3: New Password (src/components/user/Step3.tsx)
- Auth Store: src/store/authStore.ts
```

### Platform Auth Structure (Mirror Logic):
```
Platform:
- Login: src/app/platform-auth/login/page.tsx
- Reset Password: src/app/platform-auth/reset-password/page.tsx
  - Step 1: Enter Email (copy logic from tenant Step1.tsx)
  - Step 2: Validate OTP (copy logic from tenant Step2.tsx)
  - Step 3: New Password (copy logic from tenant Step3.tsx)
- Auth Store: src/store/platformAuthStore.ts
```

### Files to Create:

```
frontend/src/app/
├── platform-auth/
│   ├── login/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx

frontend/src/app/(platform)/
└── layout.tsx (protected routes)

frontend/src/components/platform/
├── auth/
│   ├── platform-login-form.tsx
│   ├── platform-forgot-password-form.tsx
│   └── platform-reset-password-form.tsx

frontend/src/store/
└── platformAuthStore.ts

frontend/src/lib/
└── platform-utils.ts
```

**Important Note:** Platform auth pages are placed in `app/platform-auth/` (outside the protected `(platform)` route group) to allow unauthenticated access, similar to how tenant auth works.

### What to Build:

#### 5.1.1: Platform Login Page
**Location:** `src/app/platform-auth/login/page.tsx`

**Copy Logic From:** `src/components/common/login.tsx`

**Logic to Copy:**
- Email/password form with react-hook-form
- Zod validation (email, password min 6 chars)
- Remember me checkbox (if exists)
- Forgot password link → `/platform-auth/reset-password`
- Show/hide password toggle (EyeIcon/EyeOffIcon)
- Loading states during submission
- Error handling with toast
- Redirect to `/platform/dashboard` on success
- Check if already authenticated → redirect to dashboard
- Theme toggle in top right

**Design Changes:**
- Background: Gradient `bg-gradient-to-br from-indigo-50 via-white to-violet-50`
- Dark mode: `bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950`
- Card: Larger with `shadow-2xl`, `rounded-xl`, `p-8`
- Header: Gradient `bg-gradient-to-r from-indigo-600 to-violet-600`
- Heading: "Platform Admin Portal" with `text-4xl font-bold`
- Description: "Manage tenants, plans, and platform settings"
- Inputs: Indigo focus ring `focus:border-indigo-500 focus:ring-indigo-500`, height `h-11`
- Button: Indigo gradient `bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700`
- Forgot password link: `text-indigo-600 hover:text-indigo-700`

**Code Changes:**
- Use `platformAuthStore` instead of `authStore`
- Redirect to `/platform/dashboard` instead of `/dashboard`
- Link to `/platform-auth/reset-password` instead of `/reset-password`
- Apply platform color classes (indigo/violet)
- Increase spacing: `space-y-6` instead of `space-y-4`

#### 5.1.2: Platform Reset Password
**Location:** `src/app/platform-auth/reset-password/page.tsx`

**Copy Logic From:** `src/components/user/reset-password.tsx`

**Logic to Copy:**
- 3-step wizard (Email → OTP → New Password)
- Progress bar with step indicators
- Step navigation (next/previous)
- Email state management
- OTP state management
- Loading state check
- Redirect if authenticated
- Theme toggle
- Step circles with numbers (1, 2, 3)
- Progress line connecting steps

**Design Changes:**
- Background: Gradient `bg-gradient-to-br from-indigo-50 via-white to-violet-50`
- Card: Larger with `shadow-2xl`, `rounded-xl`, `p-8`
- Progress bar: Indigo gradient `bg-gradient-to-r from-indigo-600 to-violet-600`
- Step circles: Indigo background when active `bg-indigo-600`
- Active step text: Emerald color `text-emerald-500`
- Inactive step: `bg-slate-100 dark:bg-slate-800 border-slate-400`
- Inputs: Indigo focus ring, larger height `h-11`
- Buttons: Indigo gradient
- More spacing: `space-y-8` between steps

**Copy These Components (with design changes):**
- `Step1.tsx` (Enter Email) → `src/components/platform/auth/Step1.tsx`
  - Copy form logic, validation, API call structure
  - Change colors to indigo theme
  - Increase spacing
- `Step2.tsx` (Validate OTP) → `src/components/platform/auth/Step2.tsx`
  - Copy OTP input logic
  - Change colors to indigo theme
- `Step3.tsx` (New Password) → `src/components/platform/auth/Step3.tsx`
  - Copy password validation logic
  - Copy password strength indicator
  - Change colors to indigo theme

**Code Changes:**
- Use `platformAuthStore` instead of `authStore`
- Redirect to `/platform/dashboard` instead of `/dashboard`
- Change heading to "Reset Platform Admin Password"
- Apply platform color scheme throughout
- Increase padding: `p-8` instead of `p-6`

#### 5.1.3: Platform Auth Store
**Location:** `src/store/platformAuthStore.ts`

**Copy Logic From:** `src/store/authStore.ts`

**Exact State to Copy:**
```typescript
interface PlatformAuthState {
  platformAdmin: PlatformAdmin | null; // same as user
  tenant: null; // platform doesn't have tenant context
  tenantType: 'PLATFORM'; // always PLATFORM
  initializing: boolean;
  loading: boolean;
  error?: string | null;
  success?: boolean;
  
  // Same methods as tenant
  login: (credentials: { email: string; password: string }) => Promise<void>;
  initializeAuth: () => void;
  logout: () => void;
  permissions: Record<string, Permissions> | null;
  setPermissions: (permissions: Record<string, Permissions> | null, admin: PlatformAdmin | null) => Promise<void>;
  setPlatformAdmin: (admin: PlatformAdmin | null) => void;
  isAuthenticated: () => boolean;
  
  // Permission checkers (copy pattern from tenant)
  hasPermissionTenantEdit: () => boolean;
  hasPermissionPlanEdit: () => boolean;
  hasPermissionAdminEdit: () => boolean;
  hasPermissionAnalyticsRead: () => boolean;
}

interface PlatformAdmin {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    role_permissions: Permissions[];
  };
  token: string;
}
```

**Code Changes:**
- Rename `user` → `platformAdmin`
- API endpoint: `/platform/auth/login` (when integrating)
- localStorage key: `platformAdmin` instead of `user`
- Cookie: `platformToken` instead of `token`
- Remove tenant context logic (platform doesn't need it)
- Set `tenantType: 'PLATFORM'` always
- Copy permission checking logic from tenant

#### 5.1.4: Platform Layout (Protected)
**Location:** `src/app/(platform)/layout.tsx`

**Copy Logic From:** `src/app/(admin)/layout.tsx`

**Logic to Copy:**
- Same layout structure with header + sidebar
- Same auth protection logic
- Same theme provider
- Same responsive design
- Check authentication on mount
- Redirect if not authenticated

**Design Changes:**
- Use `PlatformHeader` component (indigo theme)
- Use `PlatformSidebar` component (gradient background)
- Different navigation items

**Auth Protection Logic:**
```typescript
// Check if platform admin is authenticated
const { platformAdmin, isAuthenticated, initializeAuth } = usePlatformAuthStore();

useEffect(() => {
  initializeAuth();
}, []);

if (!isAuthenticated()) {
  redirect('/platform-auth/login');
}
```

**Navigation Items:**
- 📊 Dashboard → `/platform/dashboard`
- 🏢 Tenants → `/platform/tenants`
- 💳 Plans → `/platform/plans`
- 👥 Platform Admins → `/platform/admins`
- 🔐 Roles → `/platform/roles`
- 📈 Analytics → `/platform/analytics`

**Code Changes:**
- Use `platformAuthStore` instead of `authStore`
- Redirect to `/platform-auth/login` if not authenticated
- Use platform-specific components
- Apply platform theme

#### 5.1.5: Platform Header
**Component:** `platform-header.tsx`

**Copy Logic From:** `src/components/common/header.tsx`

**Logic to Copy:**
- Same tenant branding display (show "Platform Admin" instead of tenant slug)
- Same theme toggle
- Same user avatar with dropdown
- Same logout functionality
- Same responsive design
- Same Building2 icon

**Design Changes:**
- Background: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`
- Border: `border-b border-slate-200 dark:border-slate-700`
- Badge: Gradient `bg-gradient-to-r from-indigo-600 to-violet-600 text-white`
- Shadow: `shadow-sm`
- More padding: `px-8 py-4` instead of `px-6 py-3`

**Code Changes:**
- Show "Platform Admin" badge instead of tenant name
- Use `platformAuthStore` for user data
- Logout redirects to `/platform-auth/login`
- Apply indigo color scheme

#### 5.1.6: Platform Sidebar
**Component:** `platform-sidebar.tsx`

**Copy Logic From:** `src/components/common/sidebar.tsx`

**Logic to Copy:**
- Same collapsible sidebar
- Same navigation items with icons
- Same active state highlighting
- Same responsive behavior
- Same logo display
- Same badge below logo

**Design Changes:**
- Background: Gradient `bg-gradient-to-b from-indigo-600 to-violet-700`
- Active item: `bg-white/10 backdrop-blur-sm`
- Hover: `hover:bg-white/5`
- Icons: Larger `w-6 h-6` instead of `w-5 h-5`
- Text: White `text-white`
- Badge: `bg-white/20 text-white`

**Navigation Items:**
- 📊 Dashboard → `/platform/dashboard`
- 🏢 Tenants → `/platform/tenants`
- 💳 Plans → `/platform/plans`
- 👥 Platform Admins → `/platform/admins`
- 🔐 Roles → `/platform/roles`
- 📈 Analytics → `/platform/analytics`

**Code Changes:**
- Different navigation items (platform-specific)
- Use `platformAuthStore` for permissions
- Show "Platform Admin" badge instead of tenant badge
- Apply gradient background

---

## Step 5.2: Platform RBAC (Copy Logic, Different Design)

### Priority: HIGH
### Estimated Time: 6-8 hours

### Tenant RBAC Structure to Copy:
```
Tenant:
- Users: src/app/(admin)/users/page.tsx
  - Table: src/components/user/user-table.tsx
  - Form: src/components/user/user-form.tsx
  - Header: src/components/user/header.tsx
- Roles: src/app/(admin)/roles/page.tsx
  - Table: src/components/roles/role-table.tsx
  - Form: src/components/roles/role-form.tsx
  - Header: src/components/roles/header.tsx
  - Permissions: src/components/roles/permission-table.tsx
- Store: src/store/authStore.ts (user management)
- Store: src/store/roleStore.ts
```

### Platform RBAC Structure (Mirror Logic):
```
Platform:
- Admins: src/app/(platform)/admins/page.tsx
  - Table: src/components/platform/admins/platform-admin-table.tsx
  - Form: src/components/platform/admins/platform-admin-form.tsx
  - Header: src/components/platform/admins/platform-admin-header.tsx
- Roles: src/app/(platform)/roles/page.tsx
  - Table: src/components/platform/roles/platform-role-table.tsx
  - Form: src/components/platform/roles/platform-role-form.tsx
  - Header: src/components/platform/roles/platform-role-header.tsx
  - Permissions: src/components/platform/roles/platform-permission-table.tsx
- Store: src/store/platformAdminStore.ts
- Store: src/store/platformRoleStore.ts
```

### Files to Create:

```
frontend/src/app/(platform)/
├── admins/
│   └── page.tsx
├── roles/
│   └── page.tsx
└── permissions/
    └── page.tsx

frontend/src/components/platform/
├── admins/
│   ├── platform-admin-table.tsx
│   ├── platform-admin-form.tsx
│   ├── platform-admin-header.tsx
│   └── platform-admin-filters.tsx
├── roles/
│   ├── platform-role-table.tsx
│   ├── platform-role-form.tsx
│   ├── platform-role-header.tsx
│   └── platform-permission-table.tsx

frontend/src/store/
├── platformAdminStore.ts
└── platformRoleStore.ts
```

### What to Build:

#### 5.2.1: Platform Admin Management
**Location:** `src/app/(platform)/admins/page.tsx`

**Copy Logic From:** `src/app/(admin)/users/page.tsx`

**Exact Structure to Copy:**
```tsx
// Same structure as tenant users page
<Card className="p-8 shadow-xl rounded-xl">
  <Header /> {/* Create/Search */}
  <AdminTable /> {/* List with actions */}
</Card>
```

**Platform Admin Table** (Copy logic from `user-table.tsx`):

**Logic to Copy:**
- Same columns: Name, Email, Role, Created By, Actions
- Same features: Edit, Delete (except Super Admin)
- Same pagination (10, 25, 50, 100 per page)
- Same search/filter
- Same SWR data fetching pattern: `useSWR(url, fetcher)`
- Same StatusWrapper for loading/error states
- Same ReusableTable component
- Same DeleteDialog component
- Same Tooltip on action buttons
- Same permission checking before showing actions

**Design Changes:**
- Card: `p-8 shadow-xl rounded-xl` instead of `p-6 shadow-lg rounded-lg`
- Table header: `bg-slate-50 dark:bg-slate-800` with indigo text
- Row hover: `hover:bg-indigo-50 dark:hover:bg-slate-800`
- Action buttons: Indigo color `text-indigo-600 hover:text-indigo-700`
- Badges: Gradient backgrounds for roles
- More padding in cells: `px-6 py-4` instead of `px-4 py-3`
- Rounded table: `rounded-xl overflow-hidden`

**Platform Admin Form** (Copy logic from `user-form.tsx`):

**Logic to Copy:**
- Same fields: Email, Password, Role, Status
- Same validation with react-hook-form + Zod
- Same 3-step wizard (if exists in tenant)
- Same form handling
- Same dialog/modal structure
- Same error handling
- Same success toast

**Design Changes:**
- Modal: Larger `max-w-2xl`, more padding `p-8`
- Inputs: Indigo focus ring, larger height `h-11`
- Buttons: Indigo gradient `bg-gradient-to-r from-indigo-600 to-violet-600`
- Form spacing: `space-y-6` instead of `space-y-4`
- Labels: Larger and bolder `text-sm font-semibold`

**Platform Admin Header** (Copy logic from `user/header.tsx`):

**Logic to Copy:**
- Same search input
- Same "Create Admin" button
- Same layout (search left, button right)
- Same debounced search

**Design Changes:**
- Search: Indigo focus ring, larger `h-11`
- Button: Indigo gradient with icon
- More spacing: `gap-6` instead of `gap-4`
- Search bar: Subtle shadow `shadow-sm`

**Code Changes:**
- API endpoints: `/platform/admins` instead of `/user`
- Store: `platformAdminStore` instead of `authStore`
- Permissions: Check `hasPermissionAdminEdit()` instead of `hasPermissionUserEdit()`
- Labels: "Platform Admin" instead of "User"
- Apply platform color classes throughout

#### 5.2.2: Platform Roles Management
**Location:** `src/app/(platform)/roles/page.tsx`

**Copy Logic From:** `src/app/(admin)/roles/page.tsx`

**Exact Structure to Copy:**
```tsx
// Same structure as tenant roles page
<Card className="p-8 shadow-xl rounded-xl">
  <Header /> {/* Create/Search */}
  <RoleTable /> {/* List with permissions */}
</Card>
```

**Platform Role Table** (Copy logic from `role-table.tsx`):

**Logic to Copy:**
- Same columns: Name, Permissions (badges), Actions
- Same features: Edit, Delete (except Super Admin)
- Same permission badges display
- Same SWR data fetching: `useSWR(url, fetcher)`
- Same StatusWrapper for loading/error
- Same ReusableTable component
- Same DeleteDialog
- Same permission checking (only Super Admin can edit)

**Design Changes:**
- Permission badges: Gradient backgrounds `bg-gradient-to-r from-indigo-500 to-violet-500`
- Badge styling: `rounded-full px-3 py-1 text-xs font-medium`
- Table hover: Indigo tint
- More spacing between badges: `gap-2`

**Platform Role Form** (Copy logic from `role-form.tsx`):

**Logic to Copy:**
- Same fields: Role Name, Description
- Same permission checkboxes grouped by module
- Same validation
- Same dialog structure
- Same form handling with react-hook-form

**Design Changes:**
- Modal: Larger with more padding
- Permission checkboxes: Indigo accent `accent-indigo-600`
- Module grouping: Cards with subtle background
- Checkbox labels: Larger text

**Platform Permission Table** (Copy logic from `permission-table.tsx`):

**Logic to Copy:**
- Same module grouping
- Same Can Read / Can Edit checkboxes
- Same visual layout
- Same state management

**Platform Modules:**
- Tenant Management (can_read, can_edit)
- Plan Management (can_read, can_edit)
- Admin Management (can_read, can_edit)
- Analytics (can_read)

**Design Changes:**
- Module headers: Indigo background `bg-indigo-50 dark:bg-indigo-900/20`
- Checkboxes: Indigo accent
- Table borders: Slate colors
- More padding in cells

**Code Changes:**
- API endpoints: `/platform/roles` instead of `/role`
- Store: `platformRoleStore` instead of `roleStore`
- Modules: Platform modules instead of tenant modules
- Labels: "Platform Role" instead of "Role"
- Apply platform color scheme

#### 5.2.3: Platform Admin Store
**Location:** `src/store/platformAdminStore.ts`

**Copy Logic From:** `src/store/authStore.ts` (user management part)

**Exact State to Copy:**
```typescript
interface PlatformAdminStore {
  adminFilter: string; // copy from userFilter
  adminList: PlatformAdminData[]; // copy from userList
  adminCount: number; // copy from userCount
  
  setAdminFilter: (filter: string) => void;
  setAdminListData: (count: number, list: PlatformAdminData[]) => void;
}
```

**Code Changes:**
- Rename `userFilter` → `adminFilter`
- Rename `userList` → `adminList`
- Rename `userCount` → `adminCount`
- Copy exact Zustand pattern from tenant

#### 5.2.4: Platform Role Store
**Location:** `src/store/platformRoleStore.ts`

**Copy Logic From:** `src/store/roleStore.ts`

**Exact State to Copy:**
```typescript
interface PlatformRoleStore {
  rolesFilter: string;
  rolesList: PlatformRoleData[];
  rolesCount: number;
  
  setRolesFilter: (filter: string) => void;
  setRolesListData: (count: number, list: PlatformRoleData[]) => void;
}
```

**Code Changes:**
- Copy exact Zustand pattern
- No changes needed, just create platform version

---

## Step 5.3: Tenant Management

### Priority: HIGH
### Estimated Time: 8-10 hours

### Files to Create:

```
frontend/src/app/(platform)/
├── tenants/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── usage/
│           └── page.tsx

frontend/src/components/platform/
├── tenants/
│   ├── tenant-table.tsx
│   ├── tenant-form.tsx
│   ├── tenant-header.tsx
│   ├── tenant-filters.tsx
│   ├── tenant-detail-modal.tsx
│   ├── tenant-status-badge.tsx
│   ├── tenant-usage-chart.tsx
│   ├── provision-tenant-form.tsx
│   └── suspend-tenant-dialog.tsx

frontend/src/store/
└── platformTenantStore.ts
```

### What to Build:

#### 5.3.1: Tenant List Page
**Location:** `src/app/(platform)/tenants/page.tsx`

**Features:**
- List all tenants
- Search by name, slug, email
- Filter by status (active, suspended, trial, expired, cancelled)
- Filter by plan (Free, Pro, Enterprise)
- Filter by expiry date range
- Sort by name, created date, expiry date
- Pagination (10, 25, 50, 100 per page)
- Quick actions (suspend, activate, view usage)

**Table Columns:**
- Tenant Name
- Slug (subdomain)
- Admin Email
- Plan (badge with color)
- Status (badge with color)
- Trial Ends / Subscription Ends
- Created At
- Actions (View, Edit, Suspend, Delete)

**Status Colors:**
- Active: Green
- Trial: Blue
- Suspended: Orange
- Expired: Red
- Cancelled: Gray

#### 5.3.2: Create Tenant Page
**Location:** `src/app/(platform)/tenants/create/page.tsx`

**Two Modes:**
1. **Manual Creation** - Just create tenant record
2. **Auto Provision** - Create database + tenant record

**Form Fields:**
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

**Provisioning Mode:**
- Show progress steps
- Database creation status
- Migration status
- Seeding status
- Success message with credentials

#### 5.3.3: Tenant Detail Page
**Location:** `src/app/(platform)/tenants/[id]/page.tsx`

**Sections:**
1. **Tenant Info**
   - Name, slug, status
   - Admin details
   - Plan details
   - Subscription dates
   - Database info

2. **Usage Statistics**
   - Candidates (current / limit)
   - Assessments (current / limit)
   - Questions (current / limit)
   - Storage (current / limit)
   - API Calls (current / limit)
   - Progress bars for each metric

3. **Actions**
   - Edit tenant
   - Change plan
   - Suspend/Activate
   - Extend subscription
   - View full usage history

#### 5.3.4: Tenant Filters Component
**Component:** `tenant-filters.tsx`

**Filters:**
- Search (name, slug, email)
- Status (multi-select dropdown)
- Plan (multi-select dropdown)
- Expiry Date Range (date picker)
- Created Date Range (date picker)
- Sort By (dropdown)
- Sort Order (asc/desc)

#### 5.3.5: Tenant Usage Chart
**Component:** `tenant-usage-chart.tsx`

**Features:**
- Bar chart showing usage vs limits
- Color coding (green < 70%, yellow 70-90%, red > 90%)
- Tooltip with exact numbers
- Responsive design
- Use Recharts library

#### 5.3.6: Platform Tenant Store
**Location:** `src/store/platformTenantStore.ts`

**State:**
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
  
  // Actions
  setTenants: (tenants: Tenant[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPagination: (page: number, perPage: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}
```

---

## Step 5.4: Plan Management

### Priority: MEDIUM
### Estimated Time: 4-6 hours

### Files to Create:

```
frontend/src/app/(platform)/
└── plans/
    ├── page.tsx
    └── [id]/
        └── page.tsx

frontend/src/components/platform/
├── plans/
│   ├── plan-table.tsx
│   ├── plan-form.tsx
│   ├── plan-header.tsx
│   ├── plan-card.tsx
│   ├── plan-limits-form.tsx
│   └── plan-features-form.tsx

frontend/src/store/
└── platformPlanStore.ts
```

### What to Build:

#### 5.4.1: Plan List Page
**Location:** `src/app/(platform)/plans/page.tsx`

**Features:**
- List all plans (card view + table view toggle)
- Search by plan name
- Filter by active/inactive
- Create new plan
- Edit plan
- Delete plan (if no tenants using it)
- Toggle active/inactive

**Card View:**
- Plan name
- Price
- Limits (candidates, assessments, questions, storage, API calls)
- Features (custom branding, API access, priority support)
- Tenant count using this plan
- Active/Inactive badge
- Actions (Edit, Delete, Toggle)

**Table View:**
- Name
- Price
- Candidates Limit
- Assessments Limit
- Questions Limit
- Tenant Count
- Status
- Actions

#### 5.4.2: Plan Form
**Component:** `plan-form.tsx`

**Form Sections:**

**1. Basic Info:**
- Plan Name (required)
- Description
- Price (number, required)
- Active Status (toggle)

**2. Limits:**
- Candidates (-1 for unlimited)
- Assessments (-1 for unlimited)
- Questions (-1 for unlimited)
- Storage MB (-1 for unlimited)
- API Calls (-1 for unlimited)

**3. Features:**
- Custom Branding (checkbox)
- API Access (checkbox)
- Priority Support (checkbox)
- Advanced Analytics (checkbox)

**Validation:**
- All limits must be -1 or positive numbers
- Price must be >= 0
- Name must be unique

#### 5.4.3: Plan Detail Page
**Location:** `src/app/(platform)/plans/[id]/page.tsx`

**Sections:**
- Plan details
- Limits breakdown
- Features list
- Tenants using this plan (table)
- Usage statistics across all tenants

---

## Step 5.5: Analytics & Dashboard

### Priority: MEDIUM
### Estimated Time: 6-8 hours

### Files to Create:

```
frontend/src/app/(platform)/
├── dashboard/
│   └── page.tsx
└── analytics/
    └── page.tsx

frontend/src/components/platform/
├── dashboard/
│   ├── platform-dashboard.tsx
│   ├── stats-card.tsx
│   ├── tenant-growth-chart.tsx
│   ├── revenue-chart.tsx
│   ├── usage-overview.tsx
│   └── recent-tenants-table.tsx

frontend/src/store/
└── platformDashboardStore.ts
```

### What to Build:

#### 5.5.1: Platform Dashboard
**Location:** `src/app/(platform)/dashboard/page.tsx`

**Sections:**

**1. Stats Cards (Top Row):**
- Total Tenants (with growth %)
- Active Tenants
- Trial Tenants
- Expired Tenants
- Total Revenue (placeholder)
- MRR (placeholder)

**2. Charts (Middle):**
- Tenant Growth Chart (line chart, last 12 months)
- Revenue Chart (bar chart, last 12 months) - placeholder
- Plan Distribution (pie chart)
- Status Distribution (donut chart)

**3. Tables (Bottom):**
- Recent Tenants (last 10)
- Expiring Soon (next 7 days)
- High Usage Tenants (near limits)

#### 5.5.2: Analytics Page
**Location:** `src/app/(platform)/analytics/page.tsx`

**Features:**
- Date range selector
- Tenant growth metrics
- Usage metrics across all tenants
- Plan popularity
- Churn rate (placeholder)
- Revenue metrics (placeholder)
- Export data (CSV) - placeholder

---

## Step 5.6: Theme & Components

### Priority: HIGH
### Estimated Time: 4-6 hours

### Files to Create:

```
frontend/src/components/platform/
├── common/
│   ├── platform-table.tsx
│   ├── platform-header.tsx
│   ├── platform-sidebar.tsx
│   ├── platform-filters.tsx
│   ├── platform-pagination.tsx
│   ├── platform-search.tsx
│   └── platform-per-page-select.tsx

frontend/src/styles/
└── platform-theme.css

frontend/src/lib/
└── platform-theme-config.ts
```

### What to Build:

#### 5.6.1: Platform Theme Configuration
**Location:** `src/lib/platform-theme-config.ts`

**Color Scheme:**
```typescript
export const platformTheme = {
  primary: '#2563eb', // Blue 600
  secondary: '#64748b', // Slate 500
  accent: '#0ea5e9', // Sky 500
  success: '#10b981', // Green 500
  warning: '#f59e0b', // Amber 500
  error: '#ef4444', // Red 500
  background: '#f8fafc', // Slate 50
  surface: '#ffffff',
  text: '#0f172a', // Slate 900
  textSecondary: '#475569', // Slate 600
  border: '#e2e8f0', // Slate 200
};
```

**Typography:**
- Headings: Inter font, bold
- Body: Inter font, regular
- Larger font sizes than tenant UI
- More spacing

#### 5.6.2: Platform Table Component
**Component:** `platform-table.tsx`

**Features:**
- Same functionality as tenant table
- Different styling (blue theme)
- Hover effects
- Row selection
- Sorting indicators
- Loading states
- Empty states
- Responsive design

**Differences from Tenant Table:**
- Blue accent colors
- Larger padding
- Different hover color
- Professional look

#### 5.6.3: Platform Sidebar
**Component:** `platform-sidebar.tsx`

**Features:**
- Platform logo
- Navigation items with icons
- Active state highlighting
- Collapsible
- User profile at bottom
- Logout button

**Navigation Items:**
- 📊 Dashboard
- 🏢 Tenants
- 💳 Plans
- 👥 Platform Admins
- 🔐 Roles & Permissions
- 📈 Analytics
- ⚙️ Settings

#### 5.6.4: Platform Header
**Component:** `platform-header.tsx`

**Features:**
- "Platform Admin" badge
- Search bar (global)
- Notifications icon (placeholder)
- Theme toggle
- User avatar with dropdown
- Logout option

#### 5.6.5: Platform Filters
**Component:** `platform-filters.tsx`

**Reusable filter component with:**
- Search input
- Dropdown filters
- Date range picker
- Clear filters button
- Apply filters button
- Filter count badge

---

## UI/UX Guidelines

### Design Principles:

1. **Professional & Clean**
   - More whitespace than tenant UI
   - Larger typography
   - Clear hierarchy
   - Minimal distractions

2. **Color Scheme**
   - Primary: Blue (#2563eb)
   - Secondary: Slate gray
   - Success: Green
   - Warning: Amber
   - Error: Red
   - Background: Light gray (#f8fafc)

3. **Typography**
   - Font: Inter
   - Headings: 24px-32px, bold
   - Body: 14px-16px, regular
   - Small text: 12px-14px

4. **Spacing**
   - More padding in cards (24px vs 16px)
   - Larger gaps between sections (32px vs 24px)
   - More breathing room

5. **Components**
   - Rounded corners (8px)
   - Subtle shadows
   - Smooth transitions
   - Hover effects

6. **Tables**
   - Striped rows (subtle)
   - Hover highlight (blue tint)
   - Sticky headers
   - Responsive

7. **Forms**
   - Clear labels
   - Helpful placeholders
   - Inline validation
   - Error messages below fields
   - Success feedback

8. **Buttons**
   - Primary: Blue solid
   - Secondary: Blue outline
   - Danger: Red solid
   - Ghost: Transparent with hover

---

## Folder Structure

```
frontend/src/
├── app/
│   ├── platform-auth/
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── (platform)/
│       ├── dashboard/page.tsx
│       ├── tenants/
│       │   ├── page.tsx
│       │   ├── create/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── usage/page.tsx
│       ├── plans/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── admins/page.tsx
│       ├── roles/page.tsx
│       ├── analytics/page.tsx
│       └── layout.tsx
│
├── components/
│   └── platform/
│       ├── auth/
│       │   ├── platform-login-form.tsx
│       │   ├── platform-forgot-password-form.tsx
│       │   └── platform-reset-password-form.tsx
│       ├── common/
│       │   ├── platform-table.tsx
│       │   ├── platform-sidebar.tsx
│       │   ├── platform-filters.tsx
│       │   ├── platform-pagination.tsx
│       │   └── platform-search.tsx
│       ├── dashboard/
│       │   ├── stats-card.tsx
│       │   ├── tenant-growth-chart.tsx
│       │   └── recent-tenants-table.tsx
│       ├── tenants/
│       │   ├── tenant-table.tsx
│       │   ├── tenant-form.tsx
│       │   ├── tenant-filters.tsx
│       │   └── tenant-usage-chart.tsx
│       ├── plans/
│       │   ├── plan-table.tsx
│       │   ├── plan-form.tsx
│       │   └── plan-card.tsx
│       ├── admins/
│       │   ├── platform-admin-table.tsx
│       │   └── platform-admin-form.tsx
│       └── roles/
│           ├── platform-role-table.tsx
│           └── platform-permission-table.tsx
│
├── store/
│   ├── platformAuthStore.ts
│   ├── platformAdminStore.ts
│   ├── platformTenantStore.ts
│   ├── platformPlanStore.ts
│   ├── platformRoleStore.ts
│   └── platformDashboardStore.ts
│
├── lib/
│   ├── platform-utils.ts
│   └── platform-theme-config.ts
│
└── styles/
    └── platform-theme.css
```

---

## Route Structure

### Public Routes (Unauthenticated Access):
```
/platform-auth/login
/platform-auth/forgot-password
/platform-auth/reset-password
```

### Protected Routes (Requires Platform Admin Auth):
```
/platform/dashboard
/platform/tenants
/platform/tenants/create
/platform/tenants/[id]
/platform/plans
/platform/plans/[id]
/platform/admins
/platform/roles
/platform/analytics
```

**Auth Flow:**
1. User visits `admin.lr-mcq.com` → Redirects to `/platform-auth/login`
2. After login → Redirects to `/platform/dashboard`
3. All `/platform/*` routes check authentication in layout
4. If not authenticated → Redirect to `/platform-auth/login`

---

## Implementation Checklist

### Step 5.1: Authentication & Layout ✅ COMPLETE
- [x] Platform login page (`/platform-auth/login`)
- [x] Platform auth store (platformAuthStore.ts)
- [x] Platform layout with auth protection
- [x] Redirect logic (unauthenticated → login, authenticated → dashboard)
- [x] Authentication separation (tenant vs platform)
- [x] Middleware validation (prevent cross-access)
- [x] Platform sidebar with Indigo/Violet gradient theme
- [x] Collapse/expand functionality
- [x] Theme toggle (light/dark mode)
- [x] Logout functionality
- [x] Navigation items with tooltips and prefetching
- [x] Responsive design (collapsed/expanded states)
- [x] Platform CSS with scoped variables (.platform-theme)
- [x] PlatformCard component using CSS variables
- [x] Platform dashboard with proper structure
- [x] ScrollArea integration matching tenant layout
- [x] SWRConfig integration
- [x] Reset password page (`/platform-auth/reset-password`)

### Step 5.2: Platform RBAC ✅ COMPLETE
- [x] Platform admin list page
- [x] Platform admin form
- [x] Platform roles page
- [x] Platform role form
- [x] Platform permission table
- [x] Sidebar navigation updated (Admins, Roles)

### Step 5.3: Tenant Management ⏳ PENDING
- [ ] Tenant list page - TODO
- [ ] Tenant filters - TODO
- [ ] Create tenant page (manual) - TODO
- [ ] Provision tenant form - TODO
- [ ] Tenant detail page - TODO
- [ ] Tenant usage chart - TODO
- [ ] Suspend/activate dialog - TODO
- [ ] Platform tenant store - TODO

### Step 5.4: Plan Management ⏳ PENDING
- [ ] Plan list page - TODO
- [ ] Plan form - TODO
- [ ] Plan card component - TODO
- [ ] Plan detail page - TODO
- [ ] Platform plan store - TODO

### Step 5.5: Analytics & Dashboard ⏳ PENDING
- [ ] Platform dashboard - BASIC STRUCTURE DONE
- [ ] Stats cards - BASIC DONE
- [ ] Tenant growth chart - TODO
- [ ] Recent tenants table - TODO
- [ ] Analytics page - TODO
- [ ] Platform dashboard store - TODO

### Step 5.6: Additional Components ⏳ PENDING
- [ ] Platform filters - TODO
- [ ] Platform pagination - TODO
- [ ] Platform search - TODO
- [ ] Platform table enhancements - TODO

---

## Progress Summary (End of Day)

### ✅ Completed:
1. **Step 5.1 (Complete)** - Platform authentication flow with platformAuthStore
2. **Step 5.1 (Complete)** - Platform navigation and layout with sidebar
3. **Step 5.1 (Complete)** - Reset password page with 3-step flow
4. **Step 5.2 (Complete)** - Platform RBAC (admins and roles management)
5. **Platform Theme System** - CSS variables, PlatformCard component, Indigo/Violet theme
6. **Authentication Separation** - Complete isolation between tenant and platform auth
7. **Middleware Protection** - Prevent cross-access between tenant and platform routes
8. **Dashboard Structure** - Basic platform dashboard with proper layout matching tenant

### 🚧 Next Steps:
1. **Start Step 5.3** - Tenant Management (list, create, edit, suspend)
2. Implement Step 5.4 - Plan Management
3. Complete Step 5.5 - Analytics & Dashboard with charts

### 📝 Key Files Created:
**Step 5.1 - Authentication:**
- `frontend/src/store/platformAuthStore.ts`
- `frontend/src/app/platform-auth/login/page.tsx`
- `frontend/src/app/platform-auth/reset-password/page.tsx`
- `frontend/src/components/platform/auth/PlatformStep1.tsx`
- `frontend/src/components/platform/auth/PlatformStep2.tsx`
- `frontend/src/components/platform/auth/PlatformStep3.tsx`
- `frontend/src/app/platform/layout.tsx`
- `frontend/src/app/platform/dashboard/page.tsx`
- `frontend/src/components/platform/layout/PlatformSidebar.tsx`
- `frontend/src/components/platform/layout/PlatformUserAvatar.tsx`
- `frontend/src/components/platform/ui/PlatformCard.tsx`
- `frontend/src/styles/platform.css`

**Step 5.2 - Platform RBAC:**
- `frontend/src/app/platform/admins/page.tsx`
- `frontend/src/app/platform/roles/page.tsx`
- `frontend/src/components/platform/admins/header.tsx`
- `frontend/src/components/platform/admins/admin-table.tsx`
- `frontend/src/components/platform/admins/admin-form.tsx`
- `frontend/src/components/platform/roles/header.tsx`
- `frontend/src/components/platform/roles/role-table.tsx`
- `frontend/src/components/platform/roles/role-form.tsx`
- `frontend/src/components/platform/roles/permission-table.tsx`

### 🔧 Technical Decisions:
- Platform routes use `/platform/*` prefix (not route groups)
- CSS variables scoped to `.platform-theme` class to avoid conflicts
- Sidebar uses `sticky` positioning (not `fixed`) matching tenant
- Layout structure mirrors tenant exactly (ScrollArea + SWRConfig)
- PlatformCard uses CSS variables instead of hardcoded colors
- Complete auth separation with separate stores, cookies, and localStorage keys

---

## Testing Checklist

### Authentication:
- [ ] Platform admin can login
- [ ] Invalid credentials show error
- [ ] Forgot password sends email (mock)
- [ ] Reset password works (mock)
- [ ] Logout clears session
- [ ] Protected routes redirect to login

### RBAC:
- [ ] Platform admin list loads
- [ ] Create platform admin works
- [ ] Edit platform admin works
- [ ] Delete platform admin works
- [ ] Role list loads
- [ ] Create role with permissions works
- [ ] Edit role works
- [ ] Delete role works (if no admins)

### Tenant Management:
- [ ] Tenant list loads with filters
- [ ] Search works
- [ ] Status filter works
- [ ] Plan filter works
- [ ] Pagination works
- [ ] Create tenant form validates
- [ ] Tenant detail page shows data
- [ ] Usage chart displays correctly

### Plan Management:
- [ ] Plan list loads
- [ ] Create plan works
- [ ] Edit plan works
- [ ] Delete plan works (if no tenants)
- [ ] Plan limits validate correctly
- [ ] Features toggle works

### Dashboard:
- [ ] Stats cards show data
- [ ] Charts render correctly
- [ ] Recent tenants table loads
- [ ] Date range filter works

### Theme:
- [ ] Platform theme applies correctly
- [ ] Colors are distinct from tenant
- [ ] Components are responsive
- [ ] Dark mode works (if implemented)

---

## Estimated Timeline

| Step | Component | Time |
|------|-----------|------|
| 5.1 | Authentication & Layout | 8-10 hours |
| 5.2 | Platform RBAC | 6-8 hours |
| 5.3 | Tenant Management | 8-10 hours |
| 5.4 | Plan Management | 4-6 hours |
| 5.5 | Analytics & Dashboard | 6-8 hours |

**Total: 32-42 hours (1-1.5 weeks full-time)**

---

## Notes

1. **No API Integration** - All components should use mock data or empty states
2. **Reusable Components** - Create platform-specific components, don't reuse tenant components
3. **Consistent Patterns** - Follow same patterns as tenant UI (stores, forms, tables)
4. **Theme Separation** - Use separate theme config for platform
5. **Responsive Design** - All components must be mobile-friendly
6. **Accessibility** - Follow WCAG guidelines
7. **Performance** - Lazy load components where possible
8. **Documentation** - Add comments for complex logic

---

## Success Criteria

Phase 5 Step 5 is complete when:

- ✅ Platform admin can login (mock)
- ✅ All RBAC pages are built
- ✅ All tenant management pages are built
- ✅ All plan management pages are built
- ✅ Dashboard shows mock data
- ✅ All components use platform theme
- ✅ UI is distinct from tenant UI
- ✅ All features match tenant UI (pagination, filters, etc.)
- ✅ Responsive design works
- ✅ No API integration (ready for Phase 4 completion)

---

## Next Steps After Step 5

1. Wait for Phase 4 backend APIs to complete
2. Integrate platform APIs with UI
3. Replace mock data with real API calls
4. Test end-to-end flows
5. Add error handling for API failures
6. Implement loading states
7. Add success/error notifications
8. Performance optimization
9. Security audit
10. User acceptance testing

---

**Ready to start implementation!**
