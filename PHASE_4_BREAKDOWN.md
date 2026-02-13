# Phase 4: Platform Admin APIs - Breakdown into Sub-Phases

## Overview

Phase 4 is divided into 7 smaller sub-phases that can be implemented independently with clear dependencies. Each sub-phase is a complete, testable unit of work.

---

## Phase 4.1: Platform Admin Authentication

**Priority:** CRITICAL (Foundation for all other phases)  
**Dependencies:** None  
**Estimated Time:** 2-3 hours  
**Status:** ⏳ Not Started

### What This Phase Delivers:
- Platform admin can login/logout
- JWT tokens with `PLATFORM_ADMIN` type
- Platform auth middleware for protecting routes
- Separate authentication from tenant auth

### Files to Create:
```
src/platform/middlewares/platform-auth.middleware.ts
src/platform/services/platform-admin.service.ts
src/platform/controllers/platform-admin.controller.ts
src/platform/validations/platform-admin.validations.ts
src/platform/routes/platform-admin.routes.ts
src/platform/routes/index.ts (update)
```

### Endpoints:
```
POST /api/v1/platform/auth/login
POST /api/v1/platform/auth/logout
GET  /api/v1/platform/auth/me
```

### Implementation Steps:

#### 1. Create PlatformAdminService
```typescript
// Methods needed:
- findAdminByEmail(email)
- findAdminById(id)
- validateCredentials(email, password)
```

#### 2. Create PlatformAdminController
```typescript
// Methods needed:
- login()  // Generate JWT with token_type: 'PLATFORM_ADMIN'
- logout() // Invalidate token
- me()     // Get current admin profile
```

#### 3. Create PlatformAuthMiddleware
```typescript
// Functionality:
- Validate JWT token
- Check token_type === 'PLATFORM_ADMIN'
- Load admin from platform_admins table
- Inject req.user with platform admin data
- Support permission checking (module.action)
```

#### 4. Create Validation Schemas
```typescript
// Schemas needed:
- login: { email, password }
- logout: no body
```

#### 5. Create Routes
```typescript
// Public routes:
router.post('/auth/login', validate(schema.login), controller.login);

// Protected routes:
router.post('/auth/logout', platformAuth(), controller.logout);
router.get('/auth/me', platformAuth(), controller.me);
```

#### 6. Update Main Router
```typescript
// src/routes/index.ts
import platformRoutes from '../platform/routes';
router.use('/platform', platformResolver, platformRoutes);
```

### Testing Checklist:
- [ ] Platform admin can login with correct credentials
- [ ] Login returns JWT with token_type='PLATFORM_ADMIN'
- [ ] Invalid credentials are rejected
- [ ] Protected routes require valid token
- [ ] Logout invalidates token
- [ ] /auth/me returns admin profile

### Success Criteria:
✅ Platform admin authentication is completely separate from tenant auth  
✅ JWT tokens include token_type field  
✅ Middleware validates platform admin tokens correctly  
✅ All tests pass

---

## Phase 4.2: Plan Management APIs

**Priority:** HIGH (Required before tenant creation)  
**Dependencies:** Phase 4.1 (Platform Auth)  
**Estimated Time:** 2-3 hours  
**Status:** ✅ COMPLETE

### What This Phase Delivers:
- Platform admin can manage subscription plans
- CRUD operations for plans
- Plan activation/deactivation
- View tenants using each plan

### Files to Create:
```
src/platform/services/plan.service.ts
src/platform/controllers/plan.controller.ts
src/platform/validations/plan.validations.ts
src/platform/routes/plan.routes.ts
```

### Endpoints:
```
POST   /api/v1/platform/plans
GET    /api/v1/platform/plans
GET    /api/v1/platform/plans/:id
PUT    /api/v1/platform/plans/:id
DELETE /api/v1/platform/plans/:id
PUT    /api/v1/platform/plans/:id/toggle
GET    /api/v1/platform/plans/:id/tenants
```

### Implementation Steps:

#### 1. Create PlanService
```typescript
// Methods needed:
- createPlan(data)
- findPlanById(id)
- findManyPlans(filter)
- updatePlan(id, data)
- deletePlan(id) // Only if no active tenants
- toggleActive(id)
- getPlanTenants(id)
```

#### 2. Create PlanController
```typescript
// Methods needed:
- create()
- list()
- getById()
- update()
- delete()
- toggle()
- getTenants()
```

#### 3. Create Validation Schemas
```typescript
// Schemas needed:
- create: { name, description, price, limits, features }
- update: { name?, description?, price?, limits?, features? }
- toggle: no body
```

#### 4. Create Routes
```typescript
router.post('/', platformAuth('plans.can_edit'), validate(schema.create), controller.create);
router.get('/', platformAuth('plans.can_read'), controller.list);
// ... other routes
```

### Plan Structure:
```json
{
  "name": "Pro",
  "description": "Professional plan",
  "price": 99,
  "limits": {
    "candidates": 100,
    "assessments": 50,
    "questions": 500,
    "storage_mb": 1000,
    "api_calls": 10000
  },
  "features": {
    "custom_branding": true,
    "api_access": true,
    "priority_support": false,
    "advanced_analytics": true
  },
  "is_active": true
}
```

### Testing Checklist:
- [ ] Platform admin can create plans
- [ ] Platform admin can list all plans
- [ ] Platform admin can update plan details
- [ ] Platform admin can toggle plan active status
- [ ] Cannot delete plan with active tenants
- [ ] Can view tenants using a plan
- [ ] Validation works for limits and features

### Success Criteria:
✅ Full CRUD operations for plans  
✅ Plan limits use -1 for unlimited  
✅ Cannot delete plans in use  
✅ All tests pass

---

## Phase 4.3: Tenant Management APIs (Basic CRUD)

**Priority:** HIGH  
**Dependencies:** Phase 4.1 (Auth), Phase 4.2 (Plans)  
**Estimated Time:** 3-4 hours  
**Status:** ✅ COMPLETE

### What This Phase Delivers:
- Platform admin can manage tenants manually
- CRUD operations for tenants
- Status management (suspend/activate)
- View tenant details and usage

### Files to Create:
```
src/platform/services/tenant.service.ts
src/platform/controllers/tenant.controller.ts
src/platform/validations/tenant.validations.ts
src/platform/routes/tenant.routes.ts
```

### Endpoints:
```
POST   /api/v1/platform/tenants
GET    /api/v1/platform/tenants
GET    /api/v1/platform/tenants/:id
PUT    /api/v1/platform/tenants/:id
DELETE /api/v1/platform/tenants/:id
PUT    /api/v1/platform/tenants/:id/status
PUT    /api/v1/platform/tenants/:id/subscription
GET    /api/v1/platform/tenants/:id/usage
```

### Implementation Steps:

#### 1. Create TenantService
```typescript
// Methods needed:
- createTenant(data)
- findTenantById(id)
- findTenantBySlug(slug)
- findManyTenants(filter, pagination)
- updateTenant(id, data)
- deleteTenant(id)
- updateStatus(id, status)
- updateSubscription(id, dates)
- getTenantUsage(id)
```

#### 2. Create TenantController
```typescript
// Methods needed:
- create()
- list()
- getById()
- update()
- delete()
- updateStatus()
- updateSubscription()
- getUsage()
```

#### 3. Create Validation Schemas
```typescript
// Schemas needed:
- create: { name, slug, plan_id, db_name, db_url, admin_email, admin_name }
- update: { name?, slug?, plan_id?, admin_email?, admin_name? }
- updateStatus: { status: enum }
- updateSubscription: { trial_ends_at?, subscription_ends_at? }
```

#### 4. Create Routes
```typescript
router.post('/', platformAuth('tenants.can_edit'), validate(schema.create), controller.create);
router.get('/', platformAuth('tenants.can_read'), controller.list);
// ... other routes
```

### Features:
- Search by name, slug, email
- Filter by status, plan, expiry date
- Pagination support
- Status management (active, suspended, expired, cancelled, trial)

### Testing Checklist:
- [ ] Platform admin can create tenant manually
- [ ] Platform admin can list all tenants
- [ ] Platform admin can filter tenants
- [ ] Platform admin can update tenant details
- [ ] Platform admin can suspend/activate tenant
- [ ] Platform admin can view tenant usage
- [ ] Suspended tenant cannot access workspace
- [ ] Slug validation works (unique, format)

### Success Criteria:
✅ Full CRUD operations for tenants  
✅ Status management works correctly  
✅ Suspended tenants are blocked by middleware  
✅ All tests pass

---

## Phase 4.4: Platform Admin Management

**Priority:** MEDIUM  
**Dependencies:** Phase 4.1 (Auth)  
**Estimated Time:** 2-3 hours  
**Status:** ⏳ Not Started

### What This Phase Delivers:
- Platform admin can manage other platform admins
- CRUD operations for platform admins
- Role assignment
- Password management

### Files to Update:
```
src/platform/services/platform-admin.service.ts (extend)
src/platform/controllers/platform-admin.controller.ts (extend)
src/platform/validations/platform-admin.validations.ts (extend)
src/platform/routes/platform-admin.routes.ts (extend)
```

### New Endpoints:
```
POST   /api/v1/platform/admins
GET    /api/v1/platform/admins
GET    /api/v1/platform/admins/:id
PUT    /api/v1/platform/admins/:id
DELETE /api/v1/platform/admins/:id
PUT    /api/v1/platform/admins/:id/password
```

### Implementation Steps:

#### 1. Extend PlatformAdminService
```typescript
// Add methods:
- createAdmin(data)
- findManyAdmins(filter)
- updateAdmin(id, data)
- deleteAdmin(id)
- changePassword(id, password)
```

#### 2. Extend PlatformAdminController
```typescript
// Add methods:
- create()
- list()
- getById()
- update()
- delete()
- changePassword()
```

#### 3. Create Validation Schemas
```typescript
// Schemas needed:
- create: { email, password, name, role_id }
- update: { email?, name?, role_id? }
- changePassword: { oldPassword, newPassword }
```

#### 4. Add Routes
```typescript
router.post('/admins', platformAuth('admins.can_edit'), validate(schema.create), controller.create);
router.get('/admins', platformAuth('admins.can_read'), controller.list);
// ... other routes
```

### Testing Checklist:
- [ ] Platform admin can create other admins
- [ ] Platform admin can list all admins
- [ ] Platform admin can update admin details
- [ ] Platform admin can delete admins
- [ ] Platform admin can change passwords
- [ ] Role-based permissions work
- [ ] Cannot delete self

### Success Criteria:
✅ Full CRUD operations for platform admins  
✅ Role assignment works  
✅ Password management works  
✅ All tests pass

---

## Phase 4.5: Tenant Provisioning Automation

**Priority:** HIGH (Most Complex)  
**Dependencies:** Phase 4.2 (Plans), Phase 4.3 (Tenants)  
**Estimated Time:** 5-6 hours  
**Status:** ⏳ Not Started

### What This Phase Delivers:
- Automated tenant provisioning with one API call
- Database creation and migration
- Default data seeding
- Rollback on failure

### Files to Create:
```
src/platform/services/provisioning.service.ts
src/platform/controllers/provisioning.controller.ts
src/platform/validations/provisioning.validations.ts
src/platform/routes/provisioning.routes.ts
src/platform/utils/database.utils.ts
```

### Endpoint:
```
POST /api/v1/platform/provision
```

### Implementation Steps:

#### 1. Create Database Utils
```typescript
// src/platform/utils/database.utils.ts
- createDatabase(name)
- dropDatabase(name)
- runPrismaMigrations(dbUrl)
- testConnection(dbUrl)
```

#### 2. Create ProvisioningService
```typescript
// Main orchestrator:
- provisionTenant(data)
- validateProvisioningData(data)
- createTenantDatabase(slug)
- runTenantMigrations(dbUrl)
- seedTenantDefaults(dbUrl, adminData)
- registerTenant(data)
- initializeUsage(tenantId, planId)
- rollbackProvisioning(tenantId, dbName)
```

#### 3. Create ProvisioningController
```typescript
// Single endpoint:
- provision() // Orchestrates entire flow
```

#### 4. Create Validation Schema
```typescript
// Schema:
- provision: { name, slug, plan_id, admin_email, admin_name, admin_password }
```

#### 5. Provisioning Flow
```
1. Validate input data
2. Check slug availability
3. Generate database name (tenant_<slug>)
4. Generate connection string
5. Create PostgreSQL database
6. Run Prisma migrations
7. Seed default data (roles, modules, admin)
8. Create tenant record in platform DB
9. Set subscription dates
10. Initialize usage tracking
11. Return credentials
```

#### 6. Error Handling & Rollback
```typescript
try {
  // Provisioning steps
} catch (error) {
  // Rollback: Drop database if created
  // Rollback: Delete tenant record if created
  // Rollback: Delete usage records if created
  throw new ProvisioningError(error);
}
```

### Request Body:
```json
{
  "name": "Acme Corp",
  "slug": "acme",
  "plan_id": "uuid",
  "admin_email": "admin@acme.com",
  "admin_name": "John Doe",
  "admin_password": "SecurePass123"
}
```

### Response:
```json
{
  "tenant": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme",
    "subdomain": "acme.lr-mcq.com"
  },
  "admin": {
    "email": "admin@acme.com",
    "password": "SecurePass123",
    "loginUrl": "https://acme.lr-mcq.com/login"
  },
  "database": {
    "name": "tenant_acme",
    "url": "postgresql://..."
  }
}
```

### Testing Checklist:
- [ ] Provisioning creates database successfully
- [ ] Migrations run on new database
- [ ] Default data is seeded correctly
- [ ] Tenant record is created in platform DB
- [ ] Usage tracking is initialized
- [ ] Admin can login immediately
- [ ] Rollback works on failure
- [ ] Duplicate slug is rejected

### Success Criteria:
✅ One API call provisions complete tenant  
✅ Database is created and migrated  
✅ Default data is seeded  
✅ Rollback works on failure  
✅ All tests pass

---

## Phase 4.6: Usage Tracking & Enforcement

**Priority:** MEDIUM  
**Dependencies:** Phase 4.2 (Plans), Phase 4.3 (Tenants)  
**Estimated Time:** 3-4 hours  
**Status:** ⏳ Not Started

### What This Phase Delivers:
- Usage limit enforcement before resource creation
- Usage tracking (increment/decrement)
- Usage statistics API
- Integration with tenant controllers

### Files to Create:
```
src/platform/services/usage.service.ts
src/platform/controllers/usage.controller.ts
src/platform/middlewares/usage-enforcement.middleware.ts
src/platform/routes/usage.routes.ts
```

### Endpoints:
```
GET /api/v1/platform/usage/:tenantId
GET /api/v1/platform/usage/:tenantId/:metric
PUT /api/v1/platform/usage/:tenantId/:metric/reset
GET /api/v1/platform/usage/summary
```

### Implementation Steps:

#### 1. Create UsageService
```typescript
// Methods needed:
- checkUsageLimit(tenantId, metricType)
- incrementUsage(tenantId, metricType, amount)
- decrementUsage(tenantId, metricType, amount)
- getUsageStats(tenantId)
- resetUsage(tenantId, metricType)
- getCurrentUsage(tenantId, metricType)
```

#### 2. Create UsageController
```typescript
// Methods needed:
- getUsageStats()
- getMetricUsage()
- resetMetric()
- getSummary()
```

#### 3. Create Usage Enforcement Middleware
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

#### 4. Integrate with Tenant Controllers
```typescript
// Update tenant routes:
router.post('/candidates', 
  tenantResolver,
  authenticateAndAuthorize(),
  enforceUsageLimit('candidates'),
  controller.create
);

// After creation:
await usageService.incrementUsage(tenantId, 'candidates');

// After deletion:
await usageService.decrementUsage(tenantId, 'candidates');
```

### Metrics to Track:
1. `candidates` - Increment on create, decrement on delete
2. `assessments` - Increment on create, decrement on delete
3. `questions` - Increment on create, decrement on delete
4. `storage_mb` - Increment on upload, decrement on delete
5. `api_calls` - Increment on every request (optional)

### Testing Checklist:
- [ ] Usage limits block creation when reached
- [ ] Usage counters increment correctly
- [ ] Usage counters decrement correctly
- [ ] Unlimited plans (-1) bypass limits
- [ ] Usage stats are accurate
- [ ] Error messages guide to upgrade
- [ ] Integration works with all resources

### Success Criteria:
✅ Usage limits are enforced  
✅ Counters are accurate  
✅ Unlimited plans work  
✅ All tests pass

---

## Phase 4.7: Testing & Documentation

**Priority:** HIGH  
**Dependencies:** All previous phases  
**Estimated Time:** 3-4 hours  
**Status:** ⏳ Not Started

### What This Phase Delivers:
- Comprehensive testing of all features
- Bug fixes and refinements
- Updated documentation
- Performance optimization

### Testing Scenarios:

#### 1. Authentication Tests
- [ ] Platform admin login/logout
- [ ] Token validation
- [ ] Permission checking
- [ ] Token type separation

#### 2. Plan Management Tests
- [ ] CRUD operations
- [ ] Plan activation/deactivation
- [ ] Cannot delete plans in use

#### 3. Tenant Management Tests
- [ ] CRUD operations
- [ ] Status management
- [ ] Subscription management
- [ ] Usage viewing

#### 4. Provisioning Tests
- [ ] Successful provisioning
- [ ] Rollback on failure
- [ ] Duplicate slug rejection
- [ ] Admin can login immediately

#### 5. Usage Enforcement Tests
- [ ] Limits block creation
- [ ] Counters are accurate
- [ ] Unlimited plans work

#### 6. Integration Tests
- [ ] Platform admin cannot access tenant data
- [ ] Tenant admin cannot access platform routes
- [ ] Expired tenants are blocked
- [ ] Database isolation maintained

### Documentation Updates:
- [ ] Update README with platform admin setup
- [ ] Document all new API endpoints
- [ ] Add provisioning guide
- [ ] Update architecture diagrams
- [ ] Add troubleshooting section

### Success Criteria:
✅ All tests pass  
✅ No critical bugs  
✅ Documentation is complete  
✅ Performance is acceptable

---

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Phase 4.1 (Platform Auth)
- **Day 3:** Phase 4.2 (Plan Management)
- **Day 4-5:** Phase 4.3 (Tenant Management)

### Week 2: Advanced Features
- **Day 6-7:** Phase 4.4 (Admin Management)
- **Day 8-10:** Phase 4.5 (Provisioning)

### Week 3: Enforcement & Testing
- **Day 11-12:** Phase 4.6 (Usage Tracking)
- **Day 13-14:** Phase 4.7 (Testing & Docs)

---

## Dependency Graph

```
Phase 4.1 (Auth)
    ├── Phase 4.2 (Plans)
    │       ├── Phase 4.3 (Tenants)
    │       │       ├── Phase 4.5 (Provisioning)
    │       │       └── Phase 4.6 (Usage)
    │       └── Phase 4.6 (Usage)
    └── Phase 4.4 (Admin Management)

Phase 4.7 (Testing) - Depends on ALL
```

---

## Quick Start Guide

### To Start Phase 4.1:
```bash
# 1. Ensure platform database is set up
npm run prisma:generate
npm run seed:platform

# 2. Create branch
git checkout -b feature/phase-4.1-platform-auth

# 3. Create files in order:
# - platform-admin.service.ts
# - platform-admin.controller.ts
# - platform-auth.middleware.ts
# - platform-admin.validations.ts
# - platform-admin.routes.ts
# - Update platform/routes/index.ts
# - Update main routes/index.ts

# 4. Test
# - Login endpoint
# - Logout endpoint
# - Protected routes
```

---

## Notes

- Each phase is independently testable
- Complete one phase before moving to next
- Test thoroughly at each phase
- Update IMPLEMENTATION_PROGRESS.md after each phase
- Create separate git branches for each phase
- Review code before merging

---

## Current Status

| Phase | Status | Progress |
|-------|--------|----------|
| 4.1 - Platform Auth | ✅ Complete | 100% |
| 4.2 - Plan Management | ✅ Complete | 100% |
| 4.3 - Tenant Management | ✅ Complete | 100% |
| 4.4 - Admin Management | ⏳ Not Started | 0% |
| 4.5 - Provisioning | ⏳ Not Started | 0% |
| 4.6 - Usage Tracking | ⏳ Not Started | 0% |
| 4.7 - Testing | ⏳ Not Started | 0% |

**Overall Phase 4 Progress: 43%**

---

## Ready to Start!

Begin with **Phase 4.1: Platform Admin Authentication** as it's the foundation for everything else.
