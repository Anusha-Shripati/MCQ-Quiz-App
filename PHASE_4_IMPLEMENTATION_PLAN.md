# Phase 4: Platform Admin APIs - Implementation Plan

## Document Overview

This document provides a complete implementation plan for Phase 4 of the multi-tenant SaaS architecture. It includes a detailed analysis of what's already implemented, what's missing, and a step-by-step plan to complete the platform admin layer.

---

## Current Status Analysis

### ✅ Already Implemented

#### 1. Platform Database Schema
Complete schema with all required tables:
- `platform_admins` - Platform admin users with RBAC
- `platform_roles` - Role definitions for platform
- `platform_modules` - Permission modules
- `platform_role_permissions` - Role-permission mappings
- `tenants` - Tenant/organization records with subscription tracking
- `plans` - Subscription plans with limits and features
- `tenant_usage` - Usage tracking per tenant per metric

#### 2. Platform Seeder (`src/db/prisma/seeders/platform-seed.ts`)
Fully functional seeder that creates:
- 4 default modules (Tenant Management, Plan Management, Admin Management, Analytics)
- Super Admin role with full permissions
- 3 subscription plans (Free, Pro, Enterprise)
- Default super admin user (admin@logicrays.com / Admin@123)

#### 3. Middleware Infrastructure
- `tenantResolver` - Resolves tenant from subdomain/header, injects tenant Prisma
- `platformResolver` - Injects platform context with platform Prisma
- Both inject `req.context` with appropriate database client

#### 4. Subscription Expiry Cron (`src/cron/subscription-expiry.ts`)
Fully implemented cron job:
- Runs daily at 1 AM
- Checks trial_ends_at and subscription_ends_at
- Updates tenant status to 'expired' when dates pass
- Per-tenant error handling
- Comprehensive logging

#### 5. Multi-tenant Service Pattern
All 13 tenant services refactored:
- Constructor injection pattern (accepts PrismaClient)
- Controllers create service instances per request
- No global Prisma imports in services
- Clean separation of concerns

#### 6. Authentication Infrastructure
Tenant authentication exists:
- JWT-based authentication
- Role-based authorization
- Permission checking (module.action format)
- Token management

---

### ❌ Missing Components

#### 1. Platform Admin Authentication
- ❌ No platform admin login/logout endpoints
- ❌ No platform admin JWT token generation
- ❌ No platform admin auth middleware (separate from tenant auth)
- ❌ Token type differentiation not implemented (`PLATFORM_ADMIN` vs `TENANT_ADMIN`)
- ❌ No platform admin session management

#### 2. Platform Admin Services
- ❌ No `TenantService` for tenant CRUD operations
- ❌ No `PlanService` for plan management
- ❌ No `ProvisioningService` for automated tenant provisioning
- ❌ No `UsageService` for usage tracking and enforcement
- ❌ No `PlatformAdminService` for admin management

#### 3. Platform Admin Controllers
- ❌ No `TenantController` for tenant management endpoints
- ❌ No `PlanController` for plan management endpoints
- ❌ No `PlatformAdminController` for admin operations
- ❌ No `ProvisioningController` for tenant provisioning
- ❌ No `UsageController` for usage tracking

#### 4. Platform Routes
- ❌ Empty platform routes file (only health check exists)
- ❌ No route registration in main router
- ❌ No route structure for platform APIs

#### 5. Platform Middleware
- ❌ No `platformAuth` middleware for JWT validation
- ❌ No platform-specific permission checking
- ❌ No usage enforcement middleware

#### 6. Tenant Provisioning Automation
- ❌ No database creation automation
- ❌ No migration runner for new tenant databases
- ❌ No default data seeding for new tenants
- ❌ No connection string generation
- ❌ No rollback mechanism for failed provisioning

#### 7. Usage Limit Enforcement
- ❌ No usage checking before resource creation
- ❌ No usage increment after resource creation
- ❌ No limit enforcement logic
- ❌ No integration with tenant controllers

#### 8. Validations
- ❌ No platform admin validation schemas
- ❌ No tenant validation schemas
- ❌ No plan validation schemas

---

## Implementation Plan

### Step 1: Platform Admin Authentication Layer

**Priority:** HIGH (Foundation for everything else)  
**Estimated Time:** 2-3 hours

#### Files to Create:
```
src/platform/middlewares/platform-auth.middleware.ts
src/platform/services/platform-admin.service.ts
src/platform/controllers/platform-admin.controller.ts
src/platform/validations/platform-admin.validations.ts
```

#### What to Implement:

**PlatformAdminService:**
- `findAdminByEmail(email)` - Lookup admin with role/permissions
- `findAdminById(id)` - Get admin by ID
- `createAdmin(data)` - Create new platform admin
- `updateAdmin(id, data)` - Update admin details
- `deleteAdmin(id)` - Soft delete admin
- `changePassword(id, password)` - Update password
- `validateCredentials(email, password)` - Login validation

**PlatformAdminController:**
- `POST /platform/auth/login` - Platform admin login
- `POST /platform/auth/logout` - Platform admin logout
- `GET /platform/auth/me` - Get current admin profile
- `POST /platform/admins` - Create platform admin
- `GET /platform/admins` - List platform admins
- `GET /platform/admins/:id` - Get admin details
- `PUT /platform/admins/:id` - Update admin
- `DELETE /platform/admins/:id` - Delete admin
- `PUT /platform/admins/:id/password` - Change password

**PlatformAuthMiddleware:**
```typescript
// Validates JWT token
// Checks token_type === 'PLATFORM_ADMIN'
// Loads admin from platform_admins table
// Injects req.user with platform admin data
// Supports permission checking (module.action)
```

**Key Features:**
- JWT token with `token_type: 'PLATFORM_ADMIN'`
- Separate from tenant authentication
- Uses platform Prisma client
- Permission-based access control
- Token stored in platform_admin_tokens table (create if needed)

---

### Step 2: Tenant Management APIs

**Priority:** HIGH  
**Estimated Time:** 3-4 hours

#### Files to Create:
```
src/platform/services/tenant.service.ts
src/platform/controllers/tenant.controller.ts
src/platform/validations/tenant.validations.ts
```

#### Endpoints to Implement:

**TenantController:**
1. `POST /platform/tenants` - Create tenant (manual, no auto-provisioning)
2. `GET /platform/tenants` - List all tenants with filters
3. `GET /platform/tenants/:id` - Get tenant details
4. `PUT /platform/tenants/:id` - Update tenant info
5. `DELETE /platform/tenants/:id` - Soft delete tenant
6. `PUT /platform/tenants/:id/status` - Change status (suspend/activate/cancel)
7. `GET /platform/tenants/:id/usage` - Get tenant usage statistics
8. `PUT /platform/tenants/:id/subscription` - Update subscription dates

**TenantService Methods:**
- `createTenant(data)` - Create tenant record
- `findTenantById(id)` - Get tenant with plan
- `findTenantBySlug(slug)` - Lookup by subdomain
- `findManyTenants(filter, pagination)` - List with filters
- `updateTenant(id, data)` - Update tenant
- `deleteTenant(id)` - Soft delete
- `updateStatus(id, status)` - Change status
- `updateSubscription(id, dates)` - Update subscription dates
- `getTenantUsage(id)` - Get usage stats

**Features:**
- Search by name, slug, email
- Filter by status, plan, expiry date
- Pagination support
- Status management (active, suspended, expired, cancelled, trial)
- Subscription date management
- Usage statistics view

**Validations:**
- Slug format (lowercase, alphanumeric, hyphens)
- Unique slug validation
- Email format validation
- Plan ID validation
- Status enum validation
- Date validation for subscriptions

---

### Step 3: Plan Management APIs

**Priority:** MEDIUM  
**Estimated Time:** 2-3 hours

#### Files to Create:
```
src/platform/services/plan.service.ts
src/platform/controllers/plan.controller.ts
src/platform/validations/plan.validations.ts
```

#### Endpoints to Implement:

**PlanController:**
1. `POST /platform/plans` - Create subscription plan
2. `GET /platform/plans` - List all plans
3. `GET /platform/plans/:id` - Get plan details
4. `PUT /platform/plans/:id` - Update plan
5. `DELETE /platform/plans/:id` - Soft delete plan
6. `PUT /platform/plans/:id/toggle` - Activate/deactivate plan
7. `GET /platform/plans/:id/tenants` - Get tenants using this plan

**PlanService Methods:**
- `createPlan(data)` - Create plan
- `findPlanById(id)` - Get plan by ID
- `findManyPlans(filter)` - List plans
- `updatePlan(id, data)` - Update plan
- `deletePlan(id)` - Soft delete (if no active tenants)
- `toggleActive(id)` - Activate/deactivate
- `getPlanTenants(id)` - Get tenants using plan

**Plan Structure:**
```typescript
{
  name: string;
  description: string;
  price: number;
  limits: {
    candidates: number;      // -1 = unlimited
    assessments: number;     // -1 = unlimited
    questions: number;       // -1 = unlimited
    storage_mb: number;      // -1 = unlimited
    api_calls: number;       // -1 = unlimited
  };
  features: {
    custom_branding: boolean;
    api_access: boolean;
    priority_support: boolean;
    advanced_analytics: boolean;
  };
  is_active: boolean;
}
```

**Features:**
- Limit management (use -1 for unlimited)
- Feature toggles
- Pricing management
- Active/inactive status
- Prevent deletion if tenants are using the plan

---

### Step 4: Tenant Provisioning Automation

**Priority:** HIGH (Most Complex)  
**Estimated Time:** 5-6 hours

#### Files to Create:
```
src/platform/services/provisioning.service.ts
src/platform/controllers/provisioning.controller.ts
src/platform/validations/provisioning.validations.ts
src/platform/utils/database.utils.ts
```

#### Endpoint:
- `POST /platform/tenants/provision` - Automated tenant provisioning

#### Provisioning Flow:

**Step 1: Validation**
- Validate tenant data (name, slug, admin email, plan)
- Check slug availability
- Validate plan exists and is active
- Check admin email format

**Step 2: Database Creation**
```typescript
// Generate database name
const dbName = `tenant_${slug}`;

// Generate connection string
const dbUrl = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;

// Create database using admin connection
await createDatabase(dbName);
```

**Step 3: Schema Migration**
```typescript
// Run Prisma migrations on new database
await runMigrations(dbUrl);
```

**Step 4: Seed Default Data**
```typescript
// Create default roles (Super Admin, Admin, User)
// Create default modules (Users, Assessments, Questions, etc.)
// Create role permissions
// Create admin user with credentials
```

**Step 5: Platform Registration**
```typescript
// Create tenant record in platform DB
await platformPrisma.tenants.create({
  name, slug, status: 'trial',
  plan_id, db_name, db_url,
  admin_email, admin_name,
  trial_ends_at: addDays(now, 14)
});
```

**Step 6: Usage Initialization**
```typescript
// Create usage tracking records for all metrics
const metrics = ['candidates', 'assessments', 'questions', 'storage_mb', 'api_calls'];
for (const metric of metrics) {
  await createUsageRecord(tenantId, metric, plan.limits[metric]);
}
```

**Step 7: Return Credentials**
```typescript
return {
  tenant: { id, name, slug, subdomain: `${slug}.lr-mcq.com` },
  admin: { email, password, loginUrl: `https://${slug}.lr-mcq.com/login` },
  database: { name: dbName, url: dbUrl }
};
```

**Error Handling & Rollback:**
```typescript
try {
  // Provisioning steps
} catch (error) {
  // Rollback: Drop database if created
  // Rollback: Delete tenant record if created
  // Rollback: Delete usage records if created
  // Log error details
  throw new ProvisioningError(error);
}
```

**ProvisioningService Methods:**
- `provisionTenant(data)` - Main provisioning orchestrator
- `validateProvisioningData(data)` - Pre-validation
- `createTenantDatabase(slug)` - Database creation
- `runTenantMigrations(dbUrl)` - Schema setup
- `seedTenantDefaults(dbUrl, adminData)` - Default data
- `registerTenant(data)` - Platform registration
- `initializeUsage(tenantId, planId)` - Usage tracking setup
- `rollbackProvisioning(tenantId, dbName)` - Cleanup on failure

**Utilities (database.utils.ts):**
- `createDatabase(name)` - Execute CREATE DATABASE
- `dropDatabase(name)` - Execute DROP DATABASE
- `runPrismaMigrations(dbUrl)` - Run migrations via CLI
- `testConnection(dbUrl)` - Verify database connectivity

---

### Step 5: Usage Tracking & Enforcement

**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours

#### Files to Create:
```
src/platform/services/usage.service.ts
src/platform/controllers/usage.controller.ts
src/platform/middlewares/usage-enforcement.middleware.ts
```

#### UsageService Methods:

**Core Operations:**
- `checkUsageLimit(tenantId, metricType)` - Check if limit reached
- `incrementUsage(tenantId, metricType, amount = 1)` - Increment counter
- `decrementUsage(tenantId, metricType, amount = 1)` - Decrement counter
- `getUsageStats(tenantId)` - Get all usage metrics
- `resetUsage(tenantId, metricType)` - Reset monthly usage
- `getCurrentUsage(tenantId, metricType)` - Get current value

**Usage Checking Logic:**
```typescript
async checkUsageLimit(tenantId: string, metricType: UsageMetric) {
  const usage = await platformPrisma.tenant_usage.findFirst({
    where: { tenant_id: tenantId, metric_type: metricType }
  });
  
  // -1 means unlimited
  if (usage.limit_value === -1) return { allowed: true };
  
  // Check if limit reached
  if (usage.current_value >= usage.limit_value) {
    return { 
      allowed: false, 
      message: `${metricType} limit reached. Upgrade plan to continue.`,
      current: usage.current_value,
      limit: usage.limit_value
    };
  }
  
  return { allowed: true };
}
```

#### Usage Enforcement Middleware:

**Pattern:**
```typescript
export const enforceUsageLimit = (metricType: UsageMetric) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.context?.tenant?.id;
    
    const usageService = new UsageService(getPrisma());
    const check = await usageService.checkUsageLimit(tenantId, metricType);
    
    if (!check.allowed) {
      return generateResponse(res, 403, check, false, check.message);
    }
    
    next();
  };
};
```

#### Integration Points:

**Update Tenant Controllers:**
```typescript
// Candidate creation
router.post('/candidates', 
  tenantResolver,
  authenticateAndAuthorize(),
  enforceUsageLimit('candidates'),
  candidateController.create
);

// After successful creation
await usageService.incrementUsage(tenantId, 'candidates');

// After deletion
await usageService.decrementUsage(tenantId, 'candidates');
```

**Metrics to Track:**
1. `candidates` - Increment on create, decrement on delete
2. `assessments` - Increment on create, decrement on delete
3. `questions` - Increment on create, decrement on delete
4. `storage_mb` - Increment on file upload, decrement on delete
5. `api_calls` - Increment on every API request (optional)

#### Usage Controller Endpoints:
- `GET /platform/usage/:tenantId` - Get all usage stats
- `GET /platform/usage/:tenantId/:metric` - Get specific metric
- `PUT /platform/usage/:tenantId/:metric/reset` - Reset usage counter
- `GET /platform/usage/summary` - Platform-wide usage summary

---

### Step 6: Route Registration & Integration

**Priority:** HIGH  
**Estimated Time:** 1-2 hours

#### Update Files:
```
src/platform/routes/index.ts
src/routes/index.ts
```

#### Platform Routes Structure:

**src/platform/routes/index.ts:**
```typescript
import express from 'express';
import { platformAuth } from '../middlewares/platform-auth.middleware';
import platformAdminRoutes from './platform-admin.routes';
import tenantRoutes from './tenant.routes';
import planRoutes from './plan.routes';
import provisioningRoutes from './provisioning.routes';
import usageRoutes from './usage.routes';

const router = express.Router();

// Public routes (no auth)
router.use('/auth', platformAdminRoutes); // login, logout

// Protected routes (require platform admin auth)
router.use('/admins', platformAuth(), platformAdminRoutes);
router.use('/tenants', platformAuth('tenants.can_read'), tenantRoutes);
router.use('/plans', platformAuth('plans.can_read'), planRoutes);
router.use('/provision', platformAuth('tenants.can_edit'), provisioningRoutes);
router.use('/usage', platformAuth('analytics.can_read'), usageRoutes);

export default router;
```

#### Main Router Update:

**src/routes/index.ts:**
```typescript
import express from 'express';
import { tenantResolver, platformResolver } from '../middlewares/tenant-resolver.middleware';
import tenantRoutes from '../tenant/routes';
import platformRoutes from '../platform/routes';

const router = express.Router();

// Platform routes (admin.lr-mcq.com)
router.use('/platform', platformResolver, platformRoutes);

// Tenant routes (*.lr-mcq.com)
router.use('/', tenantResolver, tenantRoutes);

export default router;
```

#### Route Summary:

**Platform Routes:**
```
POST   /api/v1/platform/auth/login
POST   /api/v1/platform/auth/logout
GET    /api/v1/platform/auth/me

POST   /api/v1/platform/admins
GET    /api/v1/platform/admins
GET    /api/v1/platform/admins/:id
PUT    /api/v1/platform/admins/:id
DELETE /api/v1/platform/admins/:id
PUT    /api/v1/platform/admins/:id/password

POST   /api/v1/platform/tenants
GET    /api/v1/platform/tenants
GET    /api/v1/platform/tenants/:id
PUT    /api/v1/platform/tenants/:id
DELETE /api/v1/platform/tenants/:id
PUT    /api/v1/platform/tenants/:id/status
GET    /api/v1/platform/tenants/:id/usage
PUT    /api/v1/platform/tenants/:id/subscription

POST   /api/v1/platform/plans
GET    /api/v1/platform/plans
GET    /api/v1/platform/plans/:id
PUT    /api/v1/platform/plans/:id
DELETE /api/v1/platform/plans/:id
PUT    /api/v1/platform/plans/:id/toggle
GET    /api/v1/platform/plans/:id/tenants

POST   /api/v1/platform/provision

GET    /api/v1/platform/usage/:tenantId
GET    /api/v1/platform/usage/:tenantId/:metric
PUT    /api/v1/platform/usage/:tenantId/:metric/reset
GET    /api/v1/platform/usage/summary
```

---

### Step 7: Testing & Validation

**Priority:** HIGH  
**Estimated Time:** 3-4 hours

#### Test Scenarios:

**1. Platform Admin Authentication**
- ✅ Platform admin can login with correct credentials
- ✅ Platform admin receives JWT with token_type='PLATFORM_ADMIN'
- ✅ Platform admin can access /platform/* routes
- ✅ Platform admin cannot access tenant routes
- ✅ Invalid credentials are rejected
- ✅ Logout invalidates token

**2. Tenant Management**
- ✅ Platform admin can create tenant manually
- ✅ Platform admin can list all tenants
- ✅ Platform admin can filter tenants by status/plan
- ✅ Platform admin can update tenant details
- ✅ Platform admin can suspend/activate tenant
- ✅ Platform admin can view tenant usage
- ✅ Suspended tenant cannot access their workspace

**3. Plan Management**
- ✅ Platform admin can create plans
- ✅ Platform admin can update plan limits
- ✅ Platform admin can activate/deactivate plans
- ✅ Cannot delete plan with active tenants
- ✅ Plan limits are enforced correctly

**4. Tenant Provisioning**
- ✅ Automated provisioning creates database
- ✅ Migrations run successfully on new database
- ✅ Default data is seeded correctly
- ✅ Tenant record is created in platform DB
- ✅ Usage tracking is initialized
- ✅ Admin credentials are returned
- ✅ Rollback works on failure
- ✅ New tenant can login immediately

**5. Usage Enforcement**
- ✅ Usage limits block resource creation when reached
- ✅ Usage counters increment on creation
- ✅ Usage counters decrement on deletion
- ✅ Unlimited plans (-1) bypass limits
- ✅ Usage stats are accurate
- ✅ Error messages guide users to upgrade

**6. Subscription Expiry**
- ✅ Expired tenants cannot access workspace
- ✅ Cron job marks expired subscriptions
- ✅ Middleware blocks expired tenants in real-time
- ✅ Trial expiry works correctly
- ✅ Subscription renewal reactivates tenant

**7. Isolation & Security**
- ✅ Platform admin cannot access tenant data
- ✅ Tenant admin cannot access platform routes
- ✅ Token types are validated correctly
- ✅ Tenants cannot access other tenant data
- ✅ Database isolation is maintained

#### Testing Tools:
- Postman/Thunder Client for API testing
- Jest for unit tests (optional)
- Manual testing for provisioning flow
- Database inspection for data integrity

---

## Implementation Order (Recommended)

### Phase 4.1: Foundation (Week 1)
1. **Step 1: Platform Admin Authentication** (Day 1-2)
   - Create auth middleware
   - Create admin service & controller
   - Test login/logout flow

2. **Step 3: Plan Management** (Day 3)
   - Create plan service & controller
   - Test CRUD operations
   - Seed additional plans if needed

### Phase 4.2: Core Features (Week 2)
3. **Step 2: Tenant Management** (Day 4-5)
   - Create tenant service & controller
   - Test CRUD operations
   - Test status management

4. **Step 6: Route Integration** (Day 6)
   - Wire all routes together
   - Test end-to-end flows
   - Fix integration issues

### Phase 4.3: Advanced Features (Week 3)
5. **Step 4: Provisioning Automation** (Day 7-9)
   - Create provisioning service
   - Implement database automation
   - Test provisioning flow
   - Implement rollback mechanism

6. **Step 5: Usage Tracking** (Day 10-11)
   - Create usage service
   - Create enforcement middleware
   - Integrate with tenant controllers
   - Test limit enforcement

### Phase 4.4: Testing & Polish (Week 4)
7. **Step 7: Testing & Validation** (Day 12-14)
   - Comprehensive testing
   - Bug fixes
   - Documentation updates
   - Performance optimization

---

## Key Design Decisions

### 1. Token Differentiation
```typescript
// Platform Admin Token
{
  id: string;
  email: string;
  role_id: string;
  role_name: string;
  token_type: 'PLATFORM_ADMIN';
}

// Tenant Admin Token
{
  id: string;
  email: string;
  role_id: string;
  role_name: string;
  token_type: 'TENANT_ADMIN';
}
```

### 2. Prisma Client Usage
- Platform routes use `req.context.prisma` from `platformResolver`
- Tenant routes use `req.context.prisma` from `tenantResolver`
- Services accept PrismaClient in constructor (DI pattern)

### 3. Service Pattern
```typescript
// Platform Service
export class TenantService {
  private prisma: PlatformPrismaClient;
  
  constructor(prisma: PlatformPrismaClient) {
    this.prisma = prisma;
  }
}

// Controller Usage
const service = new TenantService(req.context!.prisma);
```

### 4. Validation Pattern
- Use Joi schemas (consistent with tenant validations)
- Validate in middleware before controller
- Return clear error messages

### 5. Error Handling
- Use existing `generateResponse` utility
- Consistent error format across platform
- Detailed logging for debugging

### 6. Database Provisioning
- Use Node.js `child_process` to run Prisma CLI
- Generate unique database names
- Test connection before proceeding
- Implement rollback for failures

### 7. Usage Limits
- Use -1 to represent unlimited
- Check limits before creation
- Increment/decrement atomically
- Provide upgrade messaging

### 8. Permission Checking
- Reuse tenant permission pattern
- Format: `module.action` (e.g., 'tenants.can_edit')
- Check in middleware
- Return 403 for unauthorized

---

## File Structure Summary

```
backend/src/
├── platform/
│   ├── controllers/
│   │   ├── platform-admin.controller.ts
│   │   ├── tenant.controller.ts
│   │   ├── plan.controller.ts
│   │   ├── provisioning.controller.ts
│   │   └── usage.controller.ts
│   ├── services/
│   │   ├── platform-admin.service.ts
│   │   ├── tenant.service.ts
│   │   ├── plan.service.ts
│   │   ├── provisioning.service.ts
│   │   └── usage.service.ts
│   ├── middlewares/
│   │   ├── platform-auth.middleware.ts
│   │   └── usage-enforcement.middleware.ts
│   ├── validations/
│   │   ├── platform-admin.validations.ts
│   │   ├── tenant.validations.ts
│   │   ├── plan.validations.ts
│   │   └── provisioning.validations.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── platform-admin.routes.ts
│   │   ├── tenant.routes.ts
│   │   ├── plan.routes.ts
│   │   ├── provisioning.routes.ts
│   │   └── usage.routes.ts
│   └── utils/
│       └── database.utils.ts
```

---

## Estimated Effort

| Step | Component | Complexity | Time |
|------|-----------|------------|------|
| 1 | Platform Admin Auth | Medium | 2-3 hours |
| 2 | Tenant Management | Medium | 3-4 hours |
| 3 | Plan Management | Easy | 2-3 hours |
| 4 | Provisioning Automation | Hard | 5-6 hours |
| 5 | Usage Tracking | Medium | 3-4 hours |
| 6 | Route Integration | Easy | 1-2 hours |
| 7 | Testing & Validation | Medium | 3-4 hours |

**Total Estimated Time: 19-26 hours (3-4 weeks part-time)**

---

## Success Criteria

Phase 4 is complete when:

- ✅ Platform admin can login separately from tenant admin
- ✅ Platform admin can create/manage tenants manually
- ✅ Platform admin can create/manage subscription plans
- ✅ Automated tenant provisioning creates isolated databases
- ✅ Usage limits are enforced correctly
- ✅ Subscription expiry blocks tenant access
- ✅ Platform admin cannot access tenant data
- ✅ Tenant admin cannot access platform routes
- ✅ All tests pass
- ✅ Documentation is updated

---

## Next Steps After Phase 4

### Phase 5: Frontend Updates
- Add subdomain detection in Next.js middleware
- Create platform admin UI
- Update tenant UI for branding
- Add tenant context to frontend state

### Phase 6: Advanced Features
- Email notifications for expiry warnings
- Billing integration (Stripe/PayPal)
- Analytics dashboard for platform admin
- Tenant self-service portal
- API rate limiting per tenant
- Audit logging for platform actions

---

## Notes & Considerations

### Security
- Always validate tenant isolation
- Use parameterized queries (Prisma handles this)
- Validate all input data
- Rate limit platform APIs
- Log all platform admin actions

### Performance
- Index frequently queried fields (slug, status)
- Use connection pooling for tenant databases
- Cache plan data (rarely changes)
- Paginate large result sets
- Monitor database connections

### Scalability
- Consider database sharding for large tenants
- Implement read replicas for reporting
- Use Redis for session management
- Queue provisioning for async processing
- Monitor resource usage per tenant

### Maintenance
- Regular database backups per tenant
- Monitor disk space for tenant databases
- Clean up soft-deleted records periodically
- Archive old usage data
- Update documentation as features evolve

---

## Conclusion

This implementation plan provides a complete roadmap for Phase 4. Follow the recommended order, test thoroughly at each step, and maintain the established patterns from Phase 3. The modular approach allows for incremental development and testing.

**Ready to start implementation!**
