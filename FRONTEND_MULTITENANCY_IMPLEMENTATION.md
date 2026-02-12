# Frontend Multi-Tenancy Implementation Guide

## Overview
Implementing multi-tenant architecture in Next.js frontend with subdomain-based tenant routing and platform admin separation.

---

## Architecture Pattern
- **Platform Admin UI**: `admin.lr-mcq.com` - SaaS owner console
- **Tenant UI**: `{tenant}.lr-mcq.com` - Organization workspace
- **Single Codebase**: Conditional rendering based on tenant context
- **Subdomain Detection**: Middleware extracts tenant from hostname

---

## Phase 5: Frontend Multi-Tenancy Implementation

### Step 1: Subdomain Detection & Middleware ✅ COMPLETE

#### What Was Implemented:

**1. Tenant Utility Functions** (`src/lib/tenant-utils.ts`)
- `extractSubdomain()` - Extracts subdomain from hostname
- `getTenantContext()` - Returns tenant type (PLATFORM/TENANT) and slug
- `isPlatformAdmin()` - Checks if request is for platform admin

**Handles:**
- Production: `admin.lr-mcq.com` → Platform Admin
- Production: `acme.lr-mcq.com` → Tenant (slug: acme)
- Development: `localhost:3000` → Tenant (slug: localhost)

**2. Enhanced Middleware** (`src/middleware.ts`)
- Subdomain detection on every request
- Tenant context stored in cookies (`tenant-slug`, `tenant-type`)
- Platform admin routing (`admin.lr-mcq.com` → `/platform`)
- **No backend verification** - Backend validates tenant on API calls

**Flow:**
```
Request → Extract subdomain → Check if platform/tenant
  ↓
Platform? → Redirect to /platform
  ↓
Tenant? → Store context in cookies
  ↓
Continue → Backend validates on API calls
```

**Why no tenant verification in middleware?**
- Backend already validates tenant on every API request
- Avoids unnecessary duplicate calls
- Reduces latency and server load
- Tenant errors handled by API layer with proper error messages

**3. Error Pages**
- `src/app/tenant-not-found/page.tsx` - Tenant error page with dynamic messages
- `src/app/platform/page.tsx` - Platform admin placeholder

**Error Handling:**
- Backend returns specific error codes: `TENANT_NOT_FOUND`, `TENANT_SUSPENDED`, `TENANT_EXPIRED`, `TENANT_CANCELLED`
- Axios interceptor catches these errors and redirects to `/tenant-not-found`
- Error page shows appropriate message based on error type

**4. Environment Configuration** (`.env`)
```env
NEXT_PUBLIC_DEV_TENANT_SLUG='localhost'
```

**Files Created:**
- `src/lib/tenant-utils.ts`
- `src/app/tenant-not-found/page.tsx`
- `src/app/platform/page.tsx`

**Files Modified:**
- `src/middleware.ts`
- `.env`

---

### Step 2: API Configuration & Tenant Headers ✅ COMPLETE

#### What Was Implemented:

**1. Updated Axios Request Interceptor** (`src/components/Axios.tsx`)
- Uses `extractSubdomain()` from `tenant-utils.ts` for consistency
- Extracts tenant slug from `window.location.hostname` on every request
- No cookie dependency - reads directly from URL
- Adds tenant headers to all API requests
- Headers added: `x-tenant-slug`, `x-tenant-type`
- Applied to both main instance and candidate instance

**Tenant Extraction Logic:**
```typescript
import { extractSubdomain } from '@/lib/tenant-utils';

// In interceptor
const tenantSlug = extractSubdomain(window.location.hostname);
config.headers['x-tenant-slug'] = tenantSlug;
```

**Request Headers:**
```typescript
headers: {
  'Authorization': 'Bearer {token}',
  'x-tenant-slug': 'acme',      // Extracted from URL
  'x-tenant-type': 'TENANT',    // Determined from subdomain
}
```

**Flow:**
```
User on: acme.lr-mcq.com
  ↓
API Request → Axios interceptor
  ↓
Extracts subdomain from window.location.hostname
  ↓
Adds header: x-tenant-slug: acme
  ↓
Backend receives and validates tenant
```

**Multi-Tab Safety:**
- Each tab extracts tenant from its own URL
- No shared state (no cookies)
- Tab 1 (acme.lr-mcq.com) → sends "acme"
- Tab 2 (xyz.lr-mcq.com) → sends "xyz"
- Both work independently ✅

**Files Modified:**
- `src/components/Axios.tsx` - Added URL-based tenant extraction to both axios instances

---

### Step 3: Auth Store & Tenant Context ✅ COMPLETE

#### What Was Implemented:

**1. Updated Auth Store Interface** (`src/store/authStore.ts`)
- Added `TenantInfo` interface
- Added `tenant` state (id, name, slug, status, plan)
- Added `tenantType` state ('PLATFORM' | 'TENANT')
- Added `setTenant()` and `setTenantType()` methods

**State Structure:**
```typescript
interface AuthState {
  user: User | null;
  tenant: TenantInfo | null;  // ← New
  tenantType: 'PLATFORM' | 'TENANT' | null;  // ← New
  // ... other fields
}
```

**2. Enhanced initializeAuth Method**
- Uses `getTenantContext()` from `tenant-utils.ts` for consistency
- Extracts tenant from `window.location.hostname` (not cookies)
- Sets tenant slug and type in state
- Maintains user authentication state
- No cookie dependency

**Flow:**
```
App loads → initializeAuth() called
  ↓
Calls getTenantContext(window.location.hostname)
  ↓
Extracts subdomain (e.g., "acme")
  ↓
Sets tenant context in Zustand store
  ↓
Components can access tenant info
```

**Usage in Components:**
```typescript
const { tenant, tenantType } = useAuthStore();

// Access tenant info
console.log(tenant?.slug);  // "acme"
console.log(tenantType);    // "TENANT"
```

**Multi-Tab Safety:**
- Each tab reads from its own `window.location`
- No shared cookies
- Perfect tab isolation

**Files Modified:**
- `src/store/authStore.ts` - Added tenant context from URL (removed cookie dependency)

---

### Step 4: Conditional UI Rendering ✅ COMPLETE

#### What Was Implemented:

**1. Updated Header Component** (`src/components/common/header.tsx`)
- Added tenant branding display with Building2 icon
- Shows tenant slug for TENANT type (e.g., "acme")
- Shows "Platform Admin" for PLATFORM type
- Repositioned layout: tenant info on left, actions on right

**Header Display:**
```typescript
// Tenant UI
🏢 acme | [Theme Toggle] [User Avatar]

// Platform Admin UI
🏢 Platform Admin | [Theme Toggle] [User Avatar]
```

**2. Updated Sidebar Component** (`src/components/common/sidebar.tsx`)
- Added tenant context badge below logo
- Shows tenant slug with Building2 icon for TENANT type
- Shows "Platform Admin" badge for PLATFORM type
- Badge has subtle background (secondary/20) for visual distinction
- Responsive: badge only shows when sidebar is expanded

**Sidebar Display:**
```typescript
// Expanded Sidebar
[Logo]
[🏢 acme]  // Tenant badge
[Navigation Items...]

// Collapsed Sidebar
[Logo Icon]
[Navigation Items...]  // No badge when collapsed
```

**3. Tenant Context Integration**
- Both components use `useAuthStore()` to access tenant info
- Reads `tenant` (TenantInfo) and `tenantType` from store
- Conditional rendering based on tenant type
- Capitalizes tenant slug for better readability

**Visual Changes:**
- Tenant name visible in both header and sidebar
- Clear visual indicator of current tenant context
- Platform admin clearly distinguished from tenant UI
- Consistent branding across navigation components

**Files Modified:**
- `src/components/common/header.tsx` - Added tenant branding
- `src/components/common/sidebar.tsx` - Added tenant badge below logo

**User Experience:**
- Users always know which tenant they're working in
- Platform admins see clear "Platform Admin" indicator
- Tenant slug displayed in user-friendly format
- No confusion between different tenant contexts

---

### Step 5: Platform Admin UI (Optional) ⏳ NOT STARTED

#### What Needs to Be Done:

**Note:** This step depends on Phase 4 (Backend Platform APIs) being completed first.

**1. Create Platform Routes**
- `src/app/(platform)/` - Platform admin layout
- `src/app/(platform)/tenants/` - Tenant management
- `src/app/(platform)/plans/` - Plan management
- `src/app/(platform)/analytics/` - Usage analytics

**2. Create Platform Components**
- `src/components/platform/tenant-table.tsx`
- `src/components/platform/plan-form.tsx`
- `src/components/platform/usage-chart.tsx`

**3. Platform Admin Store**
- `src/store/platformStore.ts` - Platform admin state

**Files to Create:**
- Multiple platform-specific files
- Platform admin components
- Platform admin pages

**Dependencies:**
- Phase 4 backend APIs must be complete
- Platform admin authentication
- Tenant provisioning APIs

---

## Testing Guide

### Local Development Testing

**1. Start Backend:**
```bash
cd backend
npm run dev
```

**2. Start Frontend:**
```bash
cd frontend
npm run dev
```

**3. Access Application:**
- Tenant UI: `http://localhost:3000`
- Uses `localhost` as tenant slug

### Testing with Subdomains (Optional)

**1. Update Hosts File:**

Linux/Mac: `/etc/hosts`
Windows: `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 localhost.lr-mcq.com
127.0.0.1 admin.lr-mcq.com
127.0.0.1 acme.lr-mcq.com
```

**2. Access Different Tenants:**
- Platform: `http://admin.lr-mcq.com:3000`
- Tenant (localhost): `http://localhost.lr-mcq.com:3000`
- Tenant (acme): `http://acme.lr-mcq.com:3000`

### Test Scenarios

**Scenario 1: Valid Tenant**
- URL: `http://localhost:3000`
- Expected: ✅ Tenant UI loads
- Axios extracts: `tenant-slug=localhost`
- Backend validates tenant

**Scenario 2: Platform Admin**
- URL: `http://admin.lr-mcq.com:3000`
- Expected: ✅ Platform admin placeholder
- Axios sends: `x-tenant-type=PLATFORM`

**Scenario 3: Invalid Tenant**
- URL: `http://invalid.lr-mcq.com:3000`
- Expected: ✅ "Organization Not Found" page
- Axios sends: `x-tenant-slug=invalid`
- Backend returns 404 with error code
- Frontend redirects to error page

**Scenario 4: Multi-Tab Test**
- Tab 1: `http://acme.lr-mcq.com:3000` → API sends `x-tenant-slug=acme`
- Tab 2: `http://xyz.lr-mcq.com:3000` → API sends `x-tenant-slug=xyz`
- Expected: ✅ Both tabs work independently
- No cookie conflicts

---

## Environment Variables

### Current Configuration (`.env`)
```env
NEXT_PUBLIC_API_URL='http://localhost:3001'
NEXT_PUBLIC_IMGAE_PREFIX='http://localhost:3001/'
NEXT_PUBLIC_DEV_TENANT_SLUG='localhost'
```

### Production Configuration (`.env.production`)
```env
NEXT_PUBLIC_API_URL='https://api.lr-mcq.com'
NEXT_PUBLIC_IMGAE_PREFIX='https://api.lr-mcq.com/'
# No DEV_TENANT_SLUG in production
```

---

## Implementation Progress

### Completed ✅
- [x] Step 1: Subdomain Detection & Middleware
  - [x] Tenant utility functions
  - [x] Middleware tenant detection
  - [x] Error pages
  - [x] Platform placeholder
  - [x] Backend error codes
  - [x] Frontend error handling
- [x] Step 2: API Configuration & Tenant Headers
  - [x] Axios request interceptor
  - [x] Tenant headers injection
  - [x] Cookie-based tenant context
- [x] Step 3: Auth Store & Tenant Context
  - [x] Tenant state in auth store
  - [x] Tenant initialization
  - [x] Tenant context methods
- [x] Step 4: Conditional UI Rendering
  - [x] Header tenant branding
  - [x] Sidebar tenant badge
  - [x] Tenant context display

### In Progress 🔄
- None

### Not Started ⏳
- [ ] Step 5: Platform Admin UI (Optional - Depends on Phase 4 Backend)

---

## Key Decisions Made

### 1. Subdomain Strategy
**Decision:** Extract tenant from URL on every request, no cookies needed

**Rationale:**
- Cookies cause multi-tab conflicts (shared across subdomains)
- URL is source of truth for tenant context
- Each tab uses its own URL → perfect isolation
- No stale data issues

**Implementation:**
- Frontend: Axios extracts subdomain from `window.location.hostname`
- Backend: Reads `x-tenant-slug` header (sent by frontend)
- Fallback: Backend can use `req.hostname` if header missing

### 2. No Cookie Storage for Tenant Context
**Decision:** Remove tenant cookies entirely

**Problem Solved:**
```
Tab 1: acme.lr-mcq.com → Cookie: tenant-slug=acme
Tab 2: xyz.lr-mcq.com  → Cookie: tenant-slug=xyz (overwrites!)
Tab 1 API call → Sends xyz ❌ WRONG!
```

**Solution:**
```
Tab 1: acme.lr-mcq.com → Extracts "acme" from URL → Sends x-tenant-slug: acme ✅
Tab 2: xyz.lr-mcq.com  → Extracts "xyz" from URL → Sends x-tenant-slug: xyz ✅
Both tabs work independently!
```e for development
**Reason:** Standard SaaS pattern, clean URLs, easy tenant isolation

### 2. Tenant Context Storage
**Decision:** Store in cookies (`tenant-slug`, `tenant-type`)
**Reason:** Accessible in middleware and client-side, persists across requests

### 3. Tenant Verification
**Decision:** Backend validates tenant on API calls, not in middleware
**Reason:** Avoids duplicate checks, reduces unnecessary requests, better performance

### 4. Platform Admin Routing
**Decision:** Separate `/platform` route namespace
**Reason:** Clear separation, different UI/UX, different authentication

### 5. Development Mode
**Decision:** Use `NEXT_PUBLIC_DEV_TENANT_SLUG` environment variable
**Reason:** No need for hosts file modification, easier local development

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
│              (subdomain.lr-mcq.com)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Middleware                         │
│  • Extract subdomain                                    │
│  • Determine tenant type (PLATFORM/TENANT)              │
│  • Verify tenant exists (backend call)                  │
│  • Store in cookies                                     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│   Platform   │         │    Tenant    │
│   (admin)    │         │  (acme, etc) │
└──────┬───────┘         └──────┬───────┘
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│  /platform   │         │  /(admin)    │
│   routes     │         │   routes     │
└──────────────┘         └──────────────┘
```

---

## Next Steps

**Immediate (Step 2):**
1. Update axios configuration
2. Add tenant headers to API calls
3. Test API calls with tenant context

**After Step 2:**
1. Update auth store with tenant info
2. Modify UI components for tenant branding
3. Test complete tenant isolation

**Future (Step 5):**
1. Wait for Phase 4 backend APIs
2. Build platform admin UI
3. Implement tenant management

---

## Notes

- All existing functionality preserved (zero breaking changes)
- Tenant verification is async (middleware supports it)
- Platform admin UI is placeholder until Phase 4
- Development mode works without subdomain setup
- Production requires wildcard DNS: `*.lr-mcq.com`

---

## Support

For questions or issues:
- Backend Architecture: `lr_mcq_multi_tenant_saa_s_architecture_guide.md`
- Backend Progress: `IMPLEMENTATION_PROGRESS.md`
- Frontend Progress: This document
