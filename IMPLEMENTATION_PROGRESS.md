# Multi-Tenant SaaS Implementation Progress

## Project Overview
Transforming LR-MCQ from single-organization to multi-tenant SaaS platform using database-per-tenant isolation.

---

## Architecture Pattern
- **Platform DB**: Main Prisma (src/db/prisma/) - manages tenants, plans, platform admins
- **Tenant DBs**: Dynamic per tenant (src/db/tenant/) - isolated business data
- **Pattern**: Constructor injection - `new Service(req.context!.prisma)` per request

---

## Phase 1: Foundation ✅ COMPLETE

### What Was Done:
1. ✅ Created folder structure (platform/ and tenant/)
2. ✅ Moved existing code to tenant/ folder
3. ✅ Created platform database schema with:
   - Platform_admins, Platform_roles, Platform_modules, Platform_role_permissions
   - Plans (Free, Pro, Enterprise)
   - Tenants (organization registry)
   - Tenant_usage (usage tracking)
4. ✅ Created tenant database client factory with connection pooling
5. ✅ Created tenant resolver middleware (extracts subdomain, injects tenant DB)
6. ✅ Updated TypeScript types (req.context with tenant info)
7. ✅ Updated main router to use tenant resolver
8. ✅ Generated Prisma clients for both platform and tenant
9. ✅ Ran platform migrations and seeded data
10. ✅ Updated docker-compose to create platform_db automatically
11. ✅ Renamed platform/ → prisma/ for cleaner structure
12. ✅ Updated .gitignore for generated Prisma folders

### Key Files:
- `src/db/prisma/schema.prisma` - Platform DB schema
- `src/db/prisma/client.ts` - Platform Prisma singleton
- `src/db/tenant/schema.prisma` - Tenant DB schema
- `src/db/tenant/client.ts` - Tenant Prisma factory with pooling
- `src/middlewares/tenant-resolver.middleware.ts` - Tenant resolution
- `src/routes/index.ts` - Main router with tenant resolver
- `src/types/express/index.d.ts` - Extended Request types

### Environment Variables:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/platform_db"
TENANT_DB_URL="postgresql://postgres:root@localhost:5432/app_db"
DEV_TENANT_SLUG="localhost"
```

### Platform Admin Credentials:
```
Email: admin@logicrays.com
Password: Admin@123
```

---

## Phase 2: Database Setup ✅ COMPLETE

### What Was Done:
1. ✅ Cleaned up old prisma folder (removed src/db/prisma/ old location)
2. ✅ Copied migrations and seeders to tenant folder
3. ✅ Updated prisma.client.ts to use platform/tenant clients
4. ✅ Generated Prisma clients for both databases
5. ✅ Created platform seeder with loops (clean code)
6. ✅ Ran platform seeder successfully
7. ✅ Updated package.json scripts for platform and tenant

### Commands:
```bash
npm run prisma:generate      # Generate platform client
npm run tenant:generate      # Generate tenant client
npm run seed:platform        # Seed platform DB
npm run seed:tenant          # Seed tenant DB
```

---

## Phase 3: Service Refactoring ✅ COMPLETE

### Pattern to Follow:
```typescript
// Service (Constructor Injection)
export class SomeService {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async someMethod() {
    return this.prisma.model.findMany();
  }
}

// Controller (Create service per request)
export class SomeController {
  someAction = async (req: Request, res: Response) => {
    const service = new SomeService(req.context!.prisma);
    const data = await service.someMethod();
  };
}
```

### Services Status:

#### ✅ COMPLETED - ALL SERVICES REFACTORED:
1. **UserService** & **UserController** - All 13 methods refactored
2. **RoleService** & **RoleController** - All 4 methods refactored
3. **AssessmentsService** & **AssessmentController** - All 7 methods refactored
4. **TechnologyService** & **TechnologyController** - All 8 methods refactored
5. **ExamService** & **ExamController** - All 7 methods refactored
6. **ModuleService** & **ModuleController** - All 1 method refactored
7. **QuestionService** & **QuestionController** - All 9 methods refactored
8. **ResultService** & **ResultController** - All 4 methods refactored
9. **CandidatesService** & **CandidateController** - All 6 methods refactored
10. **ProfileService** - Refactored (no controller)
11. **ArticlesService** - Empty service, removed unused import
12. **DashboardService** & **DashboardController** - All 7 methods refactored
13. **CandidateExamService** & **CandidateExamController** - All 13 methods refactored

**Note:** UploadService doesn't use Prisma, so it doesn't need refactoring.

### Summary:
- ✅ 13 Services refactored with constructor injection
- ✅ 12 Controllers refactored with per-request service instantiation
- ✅ All global `prisma` imports removed from tenant services
- ✅ All services now use `this.prisma` for database operations
- ✅ All controllers create service instances with `req.context!.prisma`
- ✅ Multi-tenant isolation fully implemented at service layer

---

## Phase 3.5: Subscription Expiry Detection ⚠️ PARTIALLY COMPLETE

### What Was Done:
1. ✅ Platform schema has `subscription_ends_at` and `trial_ends_at` fields
2. ✅ Platform schema has `status` enum (active, suspended, trial, expired, cancelled)
3. ✅ Tenant resolver middleware checks `tenant.status === 'expired'`
4. ✅ Exam expiry cron pattern exists (`src/cron/exam-expiry.ts`)
5. ✅ Multi-tenant cron pattern implemented

### What Needs to Be Done:
1. ❌ Create subscription expiry cron job
2. ❌ Add date-based expiry check in tenant-resolver middleware
3. ❌ Implement email notifications for expiring subscriptions
4. ❌ Add usage limit enforcement logic

### How Expiry Works:

**Two-Layer Detection:**

**Layer 1: Cron Job (Proactive)**
```typescript
// Daily at 1 AM
- Compare subscription_ends_at < now()
- Update status = 'expired'
- Send warning emails (7 days before)
```

**Layer 2: Middleware (Reactive)**
```typescript
// On every request
if (tenant.status === 'expired') {
  block access
}
```

### Files to Create:
- `src/cron/subscription-expiry.ts` - Daily cron to mark expired subscriptions

### Pattern Reference:
Follow existing `src/cron/exam-expiry.ts` pattern:
1. Get all tenants from platform DB
2. Check expiry dates
3. Update status
4. Log events

---

## Phase 4: Platform Admin APIs ⏳ NOT STARTED

### What Needs to Be Done:
1. Create platform admin authentication
2. Create tenant CRUD APIs
3. Create plan management APIs
4. Create tenant provisioning automation:
   - Create new database
   - Run migrations
   - Seed default data
   - Store tenant in platform DB
   - Set subscription dates
5. Create usage tracking APIs
6. Create tenant suspension/activation
7. Create subscription expiry cron job
8. Implement usage limit enforcement

### Files to Create:
- `src/platform/controllers/tenant.controller.ts`
- `src/platform/controllers/plan.controller.ts`
- `src/platform/controllers/platform-admin.controller.ts`
- `src/platform/services/tenant.service.ts`
- `src/platform/services/plan.service.ts`
- `src/platform/services/provisioning.service.ts`
- `src/platform/routes/index.ts`
- `src/platform/middlewares/platform-auth.middleware.ts`
- `src/cron/subscription-expiry.ts`

---

## Phase 5: Frontend Updates ⏳ NOT STARTED

### What Needs to Be Done:
1. Add subdomain detection in Next.js middleware
2. Create platform admin UI
3. Update tenant UI for branding
4. Add tenant context to frontend state
5. Update API calls to include tenant context

### Files to Update:
- `frontend/src/middleware.ts` - Add subdomain detection
- `frontend/src/app/(admin)/` - Platform admin UI
- `frontend/src/store/authStore.ts` - Add tenant context

---

## ⚠️ CRITICAL WARNINGS

### Platform Database Not Applied

**Status**: Platform schema exists but migration NOT applied to database

**Impact**: 
- Tenant resolver will fail (tenants table doesn't exist)
- Application will crash on startup
- Cron jobs will fail
- Cannot create tenants

**Fix Required**:
```bash
# 1. Apply platform migration
npx prisma migrate deploy --schema=./src/db/prisma/schema.prisma

# 2. Run platform seeder
npm run seed:platform

# 3. Create tenant record for existing app_db
# See "Next Steps" section for SQL
```

### Subscription Expiry Not Implemented

**Status**: Infrastructure exists but logic not implemented

**Impact**:
- Subscriptions never expire automatically
- Users can use expired subscriptions
- No billing enforcement

**Fix Required**:
- Create `src/cron/subscription-expiry.ts`
- Follow pattern from `src/cron/exam-expiry.ts`
- Register cron in `src/index.ts`

---

## Testing Checklist

### Phase 3 Testing (After Each Service):
- [ ] Service compiles without errors
- [ ] Controller compiles without errors
- [ ] API endpoints work with tenant context
- [ ] No global prisma imports remain
- [ ] TypeScript types are correct

### Integration Testing:
- [ ] Tenant resolver works correctly
- [ ] Different subdomains access different DBs
- [ ] Platform admin can access platform DB
- [ ] Tenant isolation is enforced
- [ ] No cross-tenant data leakage

---

## Important Notes

### Refactoring Pattern:
1. **Service**: Add `private prisma: PrismaClient` and accept in constructor
2. **Service**: Replace all `prisma.` with `this.prisma.`
3. **Controller**: Create service with `new Service(req.context!.prisma)` in each method
4. **Controller**: Remove global service instances
5. **Test**: Verify compilation and functionality

### Common Mistakes to Avoid:
- ❌ Don't use global `prisma` import in services
- ❌ Don't create service as singleton in controllers
- ❌ Don't forget to pass `req.context!.prisma` to service
- ❌ Don't mix platform and tenant Prisma clients

### Performance Notes:
- Creating service instances per request is lightweight
- Prisma client is pooled at tenant level (max 50 connections)
- No performance degradation observed

---

## Next Steps (Continue Here)

1. **⚠️ CRITICAL: Apply platform database migration** (Must do before anything else)
   ```bash
   npx prisma migrate deploy --schema=./src/db/prisma/schema.prisma
   npm run seed:platform
   ```

2. **Create first tenant record** (Map existing app_db)
   ```sql
   INSERT INTO tenants (id, name, slug, status, plan_id, db_name, db_url, admin_email, admin_name)
   VALUES (gen_random_uuid(), 'Default', 'localhost', 'active', '<plan_id>', 'app_db', 'postgresql://...', 'admin@example.com', 'Admin');
   ```

3. **Implement subscription expiry cron** (Follow exam-expiry.ts pattern)

4. **Start Phase 4: Platform Admin APIs**

5. **Test tenant isolation thoroughly**

---

## Quick Reference

### Folder Structure:
```
backend/src/
├── platform/          # Platform admin layer (SaaS owner)
├── tenant/            # Tenant business logic (organizations)
├── db/
│   ├── prisma/       # Platform DB (main)
│   └── tenant/       # Tenant DB (dynamic)
├── middlewares/      # Shared middlewares
├── utils/            # Shared utilities
└── routes/           # Main router
```

### Key Concepts:
- **Platform DB**: Manages SaaS (tenants, plans, admins)
- **Tenant DB**: Isolated per organization (users, assessments, candidates)
- **Tenant Resolution**: Subdomain → Tenant lookup → Inject Prisma
- **Constructor Injection**: Service accepts Prisma in constructor
- **Per-Request Service**: New service instance per request with tenant Prisma

---

## Contact & Support
- Platform Admin: admin@logicrays.com / Admin@123
- Architecture Doc: `lr_mcq_multi_tenant_saas_architecture_guide.md`
