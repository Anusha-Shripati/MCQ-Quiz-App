# MCQ Quiz - Multi-Tenant SaaS Platform Overview

## 🎯 Project Summary

A full-stack multi-tenant SaaS platform for MCQ assessments with **database-per-tenant isolation**. Organizations get isolated workspaces with their own databases, while a central platform manages tenants, plans, and subscriptions.

**Tech Stack:**
- **Backend:** Node.js, Express, Prisma, PostgreSQL, Redis, BullMQ
- **Frontend:** Next.js 14, React, Zustand, SWR, TailwindCSS, ShadCN UI
- **Architecture:** Database-per-tenant, Subdomain-based routing

---

## 🏗️ Architecture Overview

### Two-Layer System

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                           │
│              (SaaS Owner - admin.lr-mcq.com)                │
│  • Manages tenants, plans, subscriptions                    │
│  • Platform admins with RBAC                                │
│  • Usage tracking & enforcement                             │
│  • Automated tenant provisioning                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    TENANT LAYER                             │
│           (Organizations - {tenant}.lr-mcq.com)             │
│  • Isolated database per tenant                             │
│  • Users, Roles, Assessments, Questions                     │
│  • Candidates, Exams, Results                               │
│  • Complete data isolation                                  │
└─────────────────────────────────────────────────────────────┘
```

### Database Architecture

**Platform Database** (Central - `platform_db`):
- `tenants` - Organization registry with subscription tracking
- `plans` - Subscription plans (Free, Pro, Enterprise)
- `platform_admins` - Platform admin users
- `platform_roles` - RBAC for platform
- `tenant_usage` - Usage tracking per tenant

**Tenant Databases** (Isolated - `tenant_{slug}`):
- `users` - Tenant users with RBAC
- `assessments` - MCQ assessments
- `questions` - Question bank
- `candidates` - Candidate management
- `exams` - Exam sessions
- `results` - Exam results

---

## 🔄 Multi-Tenancy Flow

### 1. Tenant Resolution (Backend)

```
Request → Extract subdomain from x-tenant-slug header
       → Lookup tenant in platform DB
       → Validate status (active/suspended/expired)
       → Create tenant Prisma client
       → Inject into req.context.prisma
       → Services use tenant-specific DB
```

**Middleware:** `tenantResolver` extracts subdomain, validates tenant, injects tenant DB client.

### 2. Service Pattern (Constructor Injection)

```typescript
// Service accepts Prisma client
class QuestionService {
  constructor(private prisma: PrismaClient) {}
  async getQuestions() {
    return this.prisma.questions.findMany();
  }
}

// Controller creates service per request
const service = new QuestionService(req.context!.prisma);
```

**All 13 tenant services refactored:** Users, Roles, Assessments, Questions, Candidates, Results, Dashboard, Exams, Technologies, Modules, Articles, Profile, Upload.

### 3. Frontend Subdomain Detection

```
User visits: acme.lr-mcq.com
          ↓
Middleware extracts subdomain: "acme"
          ↓
Axios interceptor adds header: x-tenant-slug: acme
          ↓
Backend validates tenant on every API call
```

**No cookies for tenant context** - URL is source of truth (prevents multi-tab conflicts).

### 4. Authentication Separation

**Tenant Auth:**
- Cookie: `token`
- Store: `authStore`
- Routes: `/auth/login`, `/dashboard`
- Endpoint: `/api/v1/user/login`

**Platform Auth:**
- Cookie: `platformToken`
- Store: `platformAuthStore`
- Routes: `/platform-auth/login`, `/platform/dashboard`
- Endpoint: `/api/v1/platform/auth/login`

**Complete isolation** - Middleware prevents cross-access.

---

## 🚀 Key Features

### Platform Admin Features
- ✅ Tenant Management (CRUD, suspend/activate, subscription management)
- ✅ Plan Management (CRUD, limits, features, pricing)
- ✅ Admin Management (CRUD, RBAC, password management)
- ✅ **Automated Provisioning** (creates DB, runs migrations, seeds data)
- ✅ Usage Tracking (view tenant usage statistics)
- ⏳ Usage Enforcement (limit creation based on plan - **PENDING**)

### Tenant Features
- ✅ User Management with RBAC
- ✅ Assessment Creation & Management
- ✅ Question Bank (MCQ, Code Editor, Video, Text)
- ✅ Candidate Management
- ✅ Proctored Exams (face tracking, screen sharing, violation detection)
- ✅ Results & Analytics
- ✅ Dashboard with statistics

### Subscription Management
- ✅ Trial & Paid subscriptions
- ✅ Expiry detection (Cron job + Middleware)
- ✅ Status management (active, trial, suspended, expired, cancelled)
- ✅ Automatic blocking on expiry

---

## 📁 Project Structure

```
mcq-quiz-new/
├── backend/
│   ├── src/
│   │   ├── platform/              # Platform admin layer
│   │   │   ├── controllers/       # Plan, Tenant, Admin, Provisioning
│   │   │   ├── services/          # Business logic
│   │   │   ├── routes/            # API routes
│   │   │   ├── validations/       # Joi schemas
│   │   │   └── middlewares/       # Platform auth
│   │   ├── tenant/                # Tenant business logic
│   │   │   ├── controllers/       # 13 controllers
│   │   │   ├── services/          # 13 refactored services
│   │   │   ├── routes/            # Tenant routes
│   │   │   └── validations/       # Joi schemas
│   │   ├── db/
│   │   │   ├── prisma/            # Platform DB schema
│   │   │   └── tenant/            # Tenant DB schema
│   │   ├── middlewares/           # Tenant resolver, auth, validation
│   │   ├── cron/                  # Exam expiry, subscription expiry
│   │   └── index.ts
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/           # Tenant UI (protected)
│   │   │   ├── platform/          # Platform UI (protected)
│   │   │   └── platform-auth/     # Platform login (public)
│   │   ├── components/
│   │   │   ├── common/            # Tenant components
│   │   │   └── platform/          # Platform components
│   │   ├── store/
│   │   │   ├── authStore.ts       # Tenant auth
│   │   │   └── platformAuthStore.ts  # Platform auth
│   │   └── middleware.ts          # Subdomain detection, auth
│   └── package.json

```

---

## 🔐 Security & Isolation

### Database Isolation
- Each tenant has separate PostgreSQL database
- No shared tables between tenants
- Connection pooling per tenant (max 50 connections)

### Authentication Isolation
- Separate JWT tokens (tenant vs platform)
- Separate cookies and localStorage keys
- Middleware prevents cross-access

### Middleware Protection
```typescript
// Tenant routes
router.use('/', tenantResolver, tenantRoutes);

// Platform routes
router.use('/platform', platformResolver, platformRoutes);
```

---

## 🎨 UI/UX Design

### Tenant UI
- **Theme:** Default (Blue/Gray)
- **Routes:** `/dashboard`, `/candidates`, `/assessments`, `/questions`, `/results`, `/users`, `/roles`
- **Layout:** Sidebar + Header + Content

### Platform UI
- **Theme:** Indigo/Violet gradient (distinct from tenant)
- **Routes:** `/platform/dashboard`, `/platform/tenants`, `/platform/plans`, `/platform/admins`, `/platform/roles`
- **Layout:** Gradient sidebar + Header + Content
- **Design:** More whitespace, larger typography, professional look

---

## 🔄 Tenant Provisioning Flow

```
Platform Admin creates tenant
         ↓
1. Validate slug availability
2. Generate DB name: tenant_{slug}
3. Create PostgreSQL database
4. Run Prisma migrations
5. Seed default data (roles, modules, admin user)
6. Register tenant in platform DB
7. Initialize usage tracking
8. Return credentials
         ↓
Tenant can login immediately at {slug}.lr-mcq.com
```

**Rollback on failure:** Drops DB, deletes tenant record, cleans up usage records.

---

## 📊 Subscription Lifecycle

### Status Flow
```
trial → active → expired
  ↓       ↓         ↓
suspended ← → cancelled
```

### Expiry Detection (Two-Layer)

**Layer 1: Cron Job (Proactive)**
- Runs daily at 1 AM
- Checks `trial_ends_at` and `subscription_ends_at`
- Updates status to `expired`

**Layer 2: Middleware (Reactive)**
- Validates status on every request
- Blocks access if `status === 'expired'`

---

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Quick Start

**Backend:**
```bash
make local-backend
# Starts PostgreSQL, Redis, runs migrations, starts server
```

**Frontend:**
```bash
make local-frontend
# Starts Next.js dev server
```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/platform_db"
TENANT_DB_URL="postgresql://postgres:root@localhost:5432/app_db"
DEV_TENANT_SLUG="localhost"
BASE_DOMAIN="lr-mcq.local"
```

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_DEV_TENANT_SLUG="localhost"
```

### Default Credentials

**Platform Admin:**
- Email: `admin@logicrays.com`
- Password: `Admin@123`

---

## 📈 Implementation Progress

### Backend: ~90% Complete

| Phase | Status | Progress |
|-------|--------|----------|
| Foundation & Database | ✅ Complete | 100% |
| Service Refactoring (13 services) | ✅ Complete | 100% |
| Platform Auth | ✅ Complete | 100% |
| Plan Management | ✅ Complete | 100% |
| Tenant Management | ✅ Complete | 100% |
| Admin Management | ✅ Complete | 100% |
| Provisioning Automation | ✅ Complete | 100% |
| Subscription Expiry | ✅ Complete | 100% |
| **Usage Tracking & Enforcement** | ⏳ Pending | 0% |

### Frontend: ~80% Complete

| Component | Status | Progress |
|-----------|--------|----------|
| Tenant UI (Complete) | ✅ Complete | 100% |
| Platform Auth | ✅ Complete | 100% |
| Platform Layout | ✅ Complete | 100% |
| Platform RBAC | ✅ Complete | 100% |
| Platform Tenants | ✅ Complete | 100% |
| Platform Plans | ✅ Complete | 100% |
| Platform Profile | ✅ Complete | 100% |
| Platform Dashboard | ✅ Complete | 100% |
| **Landing Page** | ⏳ Pending | 0% |

---

## 🚧 Remaining Work

### 1. Backend: Usage Tracking & Enforcement ⏳

**Priority:** HIGH  
**Time:** 3-4 hours

**What to Build:**

**Files to Create:**
```
src/platform/services/usage.service.ts
src/platform/controllers/usage.controller.ts
src/platform/middlewares/usage-enforcement.middleware.ts
src/platform/routes/usage.routes.ts
```

**Functionality:**
- `checkUsageLimit(tenantId, metricType)` - Check if limit reached
- `incrementUsage(tenantId, metricType)` - Increment counter after creation
- `decrementUsage(tenantId, metricType)` - Decrement counter after deletion
- Middleware: `enforceUsageLimit(metricType)` - Block creation if limit reached

**Integration Points:**
- `/candidates` - Check candidates limit before creation
- `/assessments` - Check assessments limit before creation
- `/questions` - Check questions limit before creation
- `/upload` - Check file size and type before upload

**Metrics to Track:**
1. `candidates` - Increment on create, decrement on delete
2. `assessments` - Increment on create, decrement on delete
3. `questions` - Increment on create, decrement on delete


**API Endpoints:**
```
GET /api/v1/platform/usage/:tenantId
GET /api/v1/platform/usage/:tenantId/:metric
PUT /api/v1/platform/usage/:tenantId/:metric/reset
GET /api/v1/platform/usage/summary
```

---

### 2. Frontend: Landing Page ⏳

**Priority:** MEDIUM  
**Time:** 4-6 hours

**What to Build:**

**File:** `src/app/page.tsx`

**Sections:**
1. **Hero Section**
   - Headline: "Modern MCQ Assessment Platform for Organizations"
   - Subheadline: "Create, manage, and analyze assessments with ease"
   - CTA: "Contact Us" button
   - Hero image/illustration

2. **Features Section**
   - 📝 Question Bank Management
   - 👥 Candidate Management
   - 📊 Real-time Analytics
   - 🔒 Secure Exam Environment
   - 📱 Multi-device Support
   - 🎨 Custom Branding

3. **Footer**
   - Company info
   - Links: About, Contact, Privacy, Terms
   - Copyright notice

**Design:**
- Modern, professional
- Gradient backgrounds
- Smooth animations
- Responsive (mobile-first)
- SEO optimized

---

### 3. Minor Fixes & Improvements ⏳

**Priority:** LOW  
**Time:** 2-3 hours

1. **Upload Path Verification**
   - Verify all uploads follow structure: `uploads/platform-admin/{userId}` and `uploads/tenants/{tenantSlug}/{userId}`

2. **Error Handling Improvements**
   - Add better error messages
   - Add retry logic for failed requests


---

## 📝 Testing Checklist

### Backend
- [ ] Usage limits enforce correctly
- [ ] Usage counters are accurate
- [ ] Provisioning creates tenant successfully
- [ ] Cron jobs run on schedule
- [ ] All APIs return correct responses
- [ ] Database isolation maintained

### Frontend
- [ ] Landing page loads correctly
- [ ] Platform admin can login
- [ ] All CRUD operations work
- [ ] Filters and search work
- [ ] Pagination works
- [ ] Theme toggle works
- [ ] Responsive on all devices

### Integration
- [ ] Platform admin cannot access tenant data
- [ ] Tenant admin cannot access platform routes
- [ ] Expired tenants are blocked
- [ ] Usage limits block creation
- [ ] Subscription expiry updates status

---

## 🎯 Success Criteria

Project is complete when:
- ✅ All backend APIs implemented and tested
- ✅ Usage tracking enforces limits correctly
- ✅ Landing page is live and functional
- ✅ All CRUD operations work
- ✅ No critical bugs
- ✅ Documentation complete
- ✅ Ready for deployment

---

## 📞 Quick Reference

### URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Platform Admin:** http://admin.lr-mcq.local:3000
- **Tenant Example:** http://acme.lr-mcq.local:3000

### Key Commands
```bash
# Backend
make local-backend          # Start backend services
npm run prisma:generate     # Generate Prisma clients
npm run seed:platform       # Seed platform DB

# Frontend
make local-frontend         # Start frontend
npm run dev                 # Development mode
```

### Documentation Files
- `PROJECT_OVERVIEW.md` - This file (overview)
- `IMPLEMENTATION_PROGRESS.md` - Detailed progress tracking
- `PHASE_4_BREAKDOWN.md` - Platform APIs breakdown
- `REMAINING_WORK.md` - Detailed remaining tasks
- `PLATFORM_API_TESTING_GUIDE.md` - API testing guide

---

## 🚀 Estimated Completion

**Overall Progress:** ~85% Complete  
**Remaining Time:** 1-2 weeks  
**Critical Path:** Usage Tracking → Landing Page → Testing → Deployment

---

**Last Updated:** February 2025  
**Version:** 1.0  
**Status:** Production-Ready (after remaining work)
