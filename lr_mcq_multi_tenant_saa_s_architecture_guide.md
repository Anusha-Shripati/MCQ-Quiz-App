# LR‑MCQ — Multi‑Tenant SaaS Architecture Guide

## Purpose of This Document

This document explains how LR‑MCQ evolves from a **single‑organization system** into a **tenant‑isolated SaaS platform** using:

- Separate database per tenant
- Subdomain‑based tenant routing
- Platform (master) admin layer
- Shared backend + shared frontend
- Dependency‑injected tenant DB access

---

# 1. High‑Level Architecture Overview

LR‑MCQ becomes a two‑layer SaaS system:

## Platform Layer (SaaS Owner)

Controls:

- Tenant provisioning
- Subscription plans
- Billing
- Tenant lifecycle

URL example:

```
admin.lr-mcq.com
```

Uses **Platform Database** only.

---

## Tenant Layer (Organization Workspace)

Each organization gets:

- Isolated database
- Admin users
- Questions
- Assessments
- Candidates
- Results

URL example:

```
microvista.lr-mcq.com
```

Each tenant DB is completely isolated.

---

# 2. Database Architecture

## Platform Database (Global SaaS Metadata)

Stores only SaaS management data.

Tables:

### tenants

```
id
name
slug
status (active, suspended, trial, expired, cancelled)
plan_id
db_name
db_url
admin_email
admin_name
trial_ends_at
subscription_ends_at
created_at
updated_at
deleted_at
```

Maps subdomain → tenant DB and tracks subscription lifecycle.

---

### plans

```
id
name
description
price
limits (JSON: candidates, assessments, questions, storage_mb, api_calls)
features (JSON: custom_branding, api_access, priority_support)
is_active
created_at
```

Defines SaaS pricing tiers with usage limits.

---

### tenant_usage

```
id
tenant_id
metric_type (candidates, assessments, questions, storage_mb, api_calls)
current_value
limit_value
period_start
period_end
created_at
```

Tracks tenant usage against plan limits for billing and enforcement.

---

### platform\_admins

```
id
email
password
role
```

Used for SaaS owner login.

---

## Tenant Databases

Each tenant gets its own DB using the **existing schema**:

- users
- roles
- questions
- assessments
- candidates
- exams
- results

No tenant\_id column is required because isolation is at the database level.

---

# 2.1 RBAC (Roles & Permissions) Schema — Platform vs Tenant

Both the **platform database** and each **tenant database** use the **same RBAC table structure**, but they store completely different data. This allows reuse of the permission engine while keeping strict domain isolation.

## Important rule

For platform RBAC tables, you should **copy the structure** from the tenant user/role system, but:

- Keep only identity & permission-related fields
- Remove business-domain fields (assessment links, question ownership, exam relations, etc.)

The goal is structural consistency — not business coupling.

---

## Shared RBAC table structure (used in BOTH domains)

### modules

```
id
name
key
description
created_at
```

### roles

```
id
name
description
created_at
```

### role_permissions

```
id
role_id
module_id
action
allowed
```

---

## Platform user model (derived from tenant users)

Start from the tenant `users` table schema and copy authentication/identity fields only:

```
id
email
password_hash
role_id
is_active
last_login
created_at
```

Remove any unrelated business fields such as:

- assessment ownership
- question links
- exam metadata
- tenant-specific workflow fields

Platform users exist only to control SaaS infrastructure — not exam workflows.

---

## Tenant user model

Tenant databases keep the full business-aware schema:

```
id
email
password_hash
profile fields
role_id
organization metadata
preferences
created_at
```

These evolve with product features.

---

## Domain separation principle

Even though schema structure matches:

- Platform RBAC controls SaaS operations
- Tenant RBAC controls exam/workspace operations

Same engine → different permission universe.

---

# 3. Tenant Resolution Flow

Every backend request follows this flow:

```
tenant middleware
 → resolve tenant
 → create prisma
 → pass to services via DI
```

Steps:

1. Extract subdomain from request host
2. Lookup tenant in platform DB
3. Create tenant Prisma client
4. Inject DB into service layer

This ensures strict tenant isolation.

---

# 4. Backend Service Architecture

## Dependency Injection Pattern

Controllers do NOT directly use a global DB.

Instead:

- Middleware resolves tenant
- Controller creates service with tenant DB

Example conceptual flow:

```
controller → new Service(tenantPrisma)
service → performs DB operations


req.context = {
  tenant,
  prisma: tenantPrisma
};

const service = new QuestionService(req.context.prisma);
```

Benefits: 

- Testable services
- Framework independence
- Scales to microservices
- Clean architecture

---

## Platform Admin Backend

Separate route namespace:

```
/platform/*
```

Handles:

- Tenant creation
- Plan assignment
- Suspension
- Usage tracking

Uses only platform DB.

---

# 5. Tenant Provisioning Flow

When platform admin creates a tenant:

1. Create tenant database
2. Run schema migrations
3. Seed default admin + roles
4. Store tenant mapping in platform DB
5. Set subscription dates (trial_ends_at or subscription_ends_at)
6. Initialize usage tracking records
7. Activate subdomain

Automation is required.

---

# 5.1 Subscription Lifecycle Management

## Expiry Detection (Two-Layer Approach)

### Layer 1: Cron Job (Proactive)

Daily cron job runs to identify and mark expired subscriptions:

```typescript
// Runs at 1 AM daily
- Check subscription_ends_at < now()
- Update status to 'expired'
- Check trial_ends_at < now()
- Update trial status to 'expired'
- Find subscriptions expiring in 7 days
- Send warning emails
```

Pattern follows existing `exam-expiry.ts` cron:
- Iterate through all tenants
- Update status in platform DB
- Log expiry events

### Layer 2: Middleware (Reactive)

Tenant resolver middleware validates on every request:

```typescript
// Real-time validation
if (tenant.status === 'expired') {
  return 403 'Subscription expired'
}

if (tenant.subscription_ends_at < now()) {
  // Auto-update status
  update status to 'expired'
  return 403 'Subscription expired'
}
```

This provides:
- Immediate blocking after expiry
- Catches edge cases between cron runs
- Real-time enforcement

## Usage Limit Enforcement

Before creating resources, check tenant_usage:

```typescript
const usage = await checkUsageLimit(tenantId, 'candidates');

if (usage.current_value >= usage.limit_value) {
  throw new Error('Limit reached. Upgrade plan.');
}

// Create resource
// Increment usage counter
```

This prevents abuse and enables upselling.

---

# 6. Frontend Architecture

## Single Frontend — Dual UI

There is **one frontend codebase**.

Runtime routing decides which UI loads:

- Platform Admin UI
- Tenant Admin UI

Hostname detection determines mode.

---

## Code Splitting

Frontend uses lazy loading so only required UI loads:

```
performance = identical
bundle size = optimized
maintainability = better
```

This avoids large bundle penalties.

---

## URL Routing

Examples:

```
admin.lr-mcq.com → platform UI
microvista.lr-mcq.com → tenant UI
```

No separate frontend deployment per tenant.

---

# 7. Authentication Separation

## Platform Admin Auth

- Validates against platform DB
- Token type: PLATFORM\_ADMIN

## Tenant Admin Auth

- Validates against tenant DB
- Token type: TENANT\_ADMIN

Tokens must never mix contexts.

---

# 8. DNS & Subdomain Setup

Wildcard DNS record:

```
*.lr-mcq.com → frontend host (tenant apps)
admin.lr-mcq.com → frontend host (platform admin)
```

All tenant subdomains resolve to the same frontend.

Backend resolves tenant using request host.

---

# 9. Scaling Strategy

## Backend

- Stateless deployment
- Tenant DB connection pooling

## Databases

- Independent tenant DB scaling
- Enterprise tenants can move to dedicated infra

## Frontend

- CDN cached
- Single build deployment

---

# 10. Migration Strategy

Recommended order:

1. Create platform DB
2. Run platform migrations
3. Seed platform data (admins, plans, modules)
4. Implement tenant resolver middleware
5. Dynamic Prisma injection
6. Refactor services to DI
7. Add platform admin APIs
8. Implement subscription expiry cron
9. Add usage tracking logic
10. Add frontend routing
11. Automate tenant provisioning

Avoid rewriting business logic — reuse tenant schema.

---

# 10.1 Critical Setup Steps

## Before Running Application:

### 1. Platform Database Setup

```bash
# Create platform database
createdb platform_db

# Update .env
DATABASE_URL="postgresql://user:pass@localhost:5432/platform_db"

# Apply migrations
npx prisma migrate deploy --schema=./src/db/prisma/schema.prisma

# Seed platform data
ts-node src/db/prisma/seeders/platform-seed.ts
```

### 2. Create First Tenant Record

For existing app_db, create tenant mapping:

```sql
INSERT INTO tenants (
  id, name, slug, status, plan_id, 
  db_name, db_url, admin_email, admin_name
) VALUES (
  gen_random_uuid(),
  'Default Tenant',
  'localhost', -- or 'default'
  'active',
  '<plan_id_from_plans_table>',
  'app_db',
  'postgresql://user:pass@localhost:5432/app_db',
  'admin@example.com',
  'Admin'
);
```

### 3. Environment Variables

```env
# Platform DB (central)
DATABASE_URL="postgresql://user:pass@localhost:5432/platform_db"

# Development tenant slug
DEV_TENANT_SLUG="localhost"

# Optional: Default tenant DB
TENANT_DB_URL="postgresql://user:pass@localhost:5432/app_db"
```

### 4. Register Cron Jobs

In `src/index.ts`:

```typescript
// Import cron jobs
import './cron/exam-expiry';
import './cron/subscription-expiry';
```

## Common Issues:

**Issue**: `relation "tenants" does not exist`
**Fix**: Run platform migration (step 1)

**Issue**: `Tenant not found`
**Fix**: Create tenant record (step 2)

**Issue**: Subscriptions never expire
**Fix**: Implement subscription-expiry cron (step 4)

---

# 11. Naming Conventions

Platform Layer:

- Platform Admin
- SaaS Console

Tenant Layer:

- Tenant Admin
- MCQ Workspace

This avoids confusion between system ownership and tenant usage.

---

# 12. Design Principles

- Strong tenant isolation
- Stateless backend
- Dependency injection
- Shared frontend, modular UI
- Platform vs tenant separation

This architecture supports:

- SaaS monetization
- Enterprise compliance
- Horizontal scaling
- Future microservices

---

## Final Summary

LR‑MCQ becomes a production‑grade SaaS platform where:

- Each tenant has its own DB
- Subdomains route tenants
- Platform admin manages lifecycle
- Backend injects tenant DB dynamically
- Frontend loads context‑aware UI

This design balances scalability, maintainability, and commercial SaaS readiness.

---

**End of Architecture Guide**

