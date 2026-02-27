# Platform Admin API Testing Guide - Phase 4.1 to 4.6

## Base URL
```
http://localhost:3001/api/v1/platform
```

---

## Phase 4.1: Platform Admin Authentication

### 1. Login (Public)
```
POST /api/v1/platform/auth/login
Content-Type: application/json
 
Body:
{
  "email": "admin@logicrays.com",
  "password": "Admin@123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "admin@logicrays.com",
    "name": "Super Admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get Profile (Protected)
```
GET /api/v1/platform/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Admin profile retrieved",
  "data": {
    "id": "uuid",
    "email": "admin@logicrays.com",
    "name": "Super Admin",
    "role": {...}
  }
}
```

### 3. Logout (Protected)
```
POST /api/v1/platform/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

---

## Phase 4.2: Plan Management APIs

**Note:** All routes require `Authorization: Bearer <token>` header

### 1. Create Plan
```
POST /api/v1/platform/plans
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Starter",
  "description": "Perfect for small teams getting started",
  "price": 29,
  "limits": {
    "candidates": 50,
    "assessments": 10,
    "questions": 100,
    "storage_mb": 500,
    "api_calls": 5000
  },
  "features": {
    "custom_branding": false,
    "api_access": false,
    "priority_support": false,
    "advanced_analytics": false
  }
}

Response (201):
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "id": "uuid",
    "name": "Starter",
    "description": "Perfect for small teams getting started",
    "price": 29,
    "limits": {...},
    "features": {...},
    "is_active": true,
    "created_at": "2025-02-10T..."
  }
}
```

### 2. Create Business Plan
```
POST /api/v1/platform/plans
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Business",
  "description": "For growing businesses with advanced needs",
  "price": 199,
  "limits": {
    "candidates": 500,
    "assessments": 100,
    "questions": 1000,
    "storage_mb": 5000,
    "api_calls": 50000
  },
  "features": {
    "custom_branding": true,
    "api_access": true,
    "priority_support": true,
    "advanced_analytics": true
  }
}
```

### 3. Create Unlimited Plan
```
POST /api/v1/platform/plans
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Unlimited",
  "description": "Unlimited everything for large enterprises",
  "price": 999,
  "limits": {
    "candidates": -1,
    "assessments": -1,
    "questions": -1,
    "storage_mb": -1,
    "api_calls": -1
  },
  "features": {
    "custom_branding": true,
    "api_access": true,
    "priority_support": true,
    "advanced_analytics": true
  }
}

Note: -1 means unlimited
```

### 4. Get All Plans
```
GET /api/v1/platform/plans
Authorization: Bearer <token>

Optional Query Parameters:
?is_active=true
?search=starter

Response (200):
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "Starter",
        "price": 29,
        "is_active": true,
        "_count": {
          "tenants": 0
        }
      }
    ],
    "count": 3
  }
}
```

### 5. Get Plan by ID
```
GET /api/v1/platform/plans/:plan_id
Authorization: Bearer <token>

Replace :plan_id with actual UUID

Response (200):
{
  "success": true,
  "message": "Plan retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Starter",
    "description": "...",
    "price": 29,
    "limits": {...},
    "features": {...},
    "is_active": true,
    "_count": {
      "tenants": 0
    }
  }
}
```

### 6. Update Plan
```
PUT /api/v1/platform/plans/:plan_id
Authorization: Bearer <token>
Content-Type: application/json

Body (all fields optional):
{
  "name": "Starter Plus",
  "description": "Updated description",
  "price": 39,
  "limits": {
    "candidates": 75,
    "assessments": 15,
    "questions": 150,
    "storage_mb": 750,
    "api_calls": 7500
  },
  "features": {
    "custom_branding": false,
    "api_access": true,
    "priority_support": false,
    "advanced_analytics": false
  }
}

Response (200):
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "id": "uuid",
    "name": "Starter Plus",
    "price": 39,
    ...
  }
}
```

### 7. Toggle Plan Active Status
```
PUT /api/v1/platform/plans/:plan_id/toggle
Authorization: Bearer <token>

No Body Required

Response (200):
{
  "success": true,
  "message": "Plan activated successfully",
  "data": {
    "id": "uuid",
    "is_active": true,
    ...
  }
}
```

### 8. Get Tenants Using Plan
```
GET /api/v1/platform/plans/:plan_id/tenants
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Plan tenants retrieved successfully",
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "Acme Corp",
        "slug": "acme",
        "status": "active",
        "created_at": "2025-02-10T..."
      }
    ],
    "count": 1
  }
}
```

### 9. Delete Plan
```
DELETE /api/v1/platform/plans/:plan_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Plan deleted successfully",
  "data": {}
}

Error (400) - If plan has active tenants:
{
  "success": false,
  "message": "Cannot delete plan with active tenants",
  "data": {}
}
```

---

## Phase 4.3: Tenant Management APIs

**Note:** All routes require `Authorization: Bearer <token>` header

### 1. Create Tenant
```
POST /api/v1/platform/tenants
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Acme Corporation",
  "slug": "acme",
  "plan_id": "<plan_uuid>",
  "db_name": "tenant_acme",
  "db_url": "postgresql://postgres:root@localhost:5432/tenant_acme",
  "admin_email": "admin@acme.com",
  "admin_name": "John Doe",
  "status": "trial",
  "trial_ends_at": "2025-03-10T00:00:00Z"
}

Response (201):
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "slug": "acme",
    "status": "trial",
    "plan": {...},
    "created_at": "2025-02-10T..."
  }
}
```

### 2. Get All Tenants
```
GET /api/v1/platform/tenants
Authorization: Bearer <token>

Optional Query Parameters:
?status=active
?plan_id=<uuid>
?search=acme

Response (200):
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "Acme Corporation",
        "slug": "acme",
        "status": "trial",
        "admin_email": "admin@acme.com",
        "plan": {
          "id": "uuid",
          "name": "Pro",
          "price": 99
        },
        "created_at": "2025-02-10T..."
      }
    ],
    "count": 1
  }
}
```

### 3. Get Tenant by ID
```
GET /api/v1/platform/tenants/:tenant_id
Authorization: Bearer <token>

Replace :tenant_id with actual UUID

Response (200):
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "slug": "acme",
    "status": "trial",
    "plan": {...},
    "usage": [...],
    "trial_ends_at": "2025-03-10T00:00:00Z",
    "created_at": "2025-02-10T..."
  }
}
```

### 4. Update Tenant
```
PUT /api/v1/platform/tenants/:tenant_id
Authorization: Bearer <token>
Content-Type: application/json

Body (all fields optional):
{
  "name": "Acme Corp Updated",
  "slug": "acme-corp",
  "plan_id": "<new_plan_uuid>",
  "admin_email": "newemail@acme.com",
  "admin_name": "Jane Smith"
}

Response (200):
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid",
    "name": "Acme Corp Updated",
    ...
  }
}
```

### 5. Update Tenant Status
```
PUT /api/v1/platform/tenants/:tenant_id/status
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "suspended"
}

Allowed values: active, suspended, trial, expired, cancelled

Response (200):
{
  "success": true,
  "message": "Tenant status updated to suspended",
  "data": {
    "id": "uuid",
    "status": "suspended",
    ...
  }
}
```

### 6. Update Subscription Dates
```
PUT /api/v1/platform/tenants/:tenant_id/subscription
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "trial_ends_at": "2025-03-15T00:00:00Z",
  "subscription_ends_at": "2026-02-10T00:00:00Z"
}

Note: At least one date field is required

Response (200):
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "uuid",
    "trial_ends_at": "2025-03-15T00:00:00Z",
    "subscription_ends_at": "2026-02-10T00:00:00Z",
    ...
  }
}
```

### 7. Get Tenant Usage
```
GET /api/v1/platform/tenants/:tenant_id/usage
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Tenant usage retrieved successfully",
  "data": {
    "list": [
      {
        "id": "uuid",
        "metric_type": "candidates",
        "current_value": 25,
        "limit_value": 100,
        "period_start": "2025-02-01T00:00:00Z",
        "period_end": "2025-03-01T00:00:00Z"
      },
      {
        "metric_type": "assessments",
        "current_value": 5,
        "limit_value": 50
      }
    ],
    "count": 5
  }
}
```

### 8. Delete Tenant (Soft Delete)
```
DELETE /api/v1/platform/tenants/:tenant_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Tenant deleted successfully",
  "data": {}
}
```

---

## Phase 4.4: Platform Admin Management

**Note:** All routes require `Authorization: Bearer <token>` header

### 1. Create Platform Admin
```
POST /api/v1/platform/admins
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "email": "newadmin@logicrays.com",
  "password": "SecurePass123",
  "name": "New Admin",
  "role_id": "<super_admin_role_id>"
}

Response (201):
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "uuid",
    "email": "newadmin@logicrays.com",
    "name": "New Admin",
    "role_id": "uuid",
    "is_active": true,
    "created_at": "2025-02-10T..."
  }
}
```

### 2. Get All Admins
```
GET /api/v1/platform/admins
Authorization: Bearer <token>

Optional Query Parameters:
?search=admin
?is_active=true

Response (200):
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "list": [
      {
        "id": "uuid",
        "email": "admin@logicrays.com",
        "name": "Super Admin",
        "role": {
          "id": "uuid",
          "name": "Super Admin"
        },
        "is_active": true,
        "last_login": "2025-02-10T...",
        "created_at": "2025-02-10T..."
      }
    ],
    "count": 2
  }
}
```

### 3. Get Admin by ID
```
GET /api/v1/platform/admins/:admin_id
Authorization: Bearer <token>

Replace :admin_id with actual UUID

Response (200):
{
  "success": true,
  "message": "Admin retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "admin@logicrays.com",
    "name": "Super Admin",
    "role": {...},
    "is_active": true,
    "last_login": "2025-02-10T..."
  }
}
```

### 4. Update Admin
```
PUT /api/v1/platform/admins/:admin_id
Authorization: Bearer <token>
Content-Type: application/json

Body (all fields optional):
{
  "email": "updated@logicrays.com",
  "name": "Updated Name",
  "role_id": "<new_role_id>",
  "is_active": false
}

Response (200):
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "uuid",
    "email": "updated@logicrays.com",
    "name": "Updated Name",
    ...
  }
}
```

### 5. Change Admin Password
```
PUT /api/v1/platform/admins/:admin_id/password
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "old_password": "OldPass123",
  "new_password": "NewSecurePass456"
}

Note: old_password is optional

Response (200):
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

### 6. Delete Admin (Soft Delete)
```
DELETE /api/v1/platform/admins/:admin_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Admin deleted successfully",
  "data": {}
}

Error (400) - Cannot delete self:
{
  "success": false,
  "message": "Cannot delete your own account",
  "data": {}
}
```

---

## Phase 4.5: Tenant Provisioning Automation

**Note:** This route requires `Authorization: Bearer <token>` header

### 1. Provision Tenant (Automated)
```
POST /api/v1/platform/provision
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Acme Corporation",
  "slug": "acme",
  "plan_id": "<plan_uuid>",
  "admin_email": "admin@acme.com",
  "admin_name": "John Doe",
  "admin_password": "SecurePass123"
}

Response (201):
{
  "success": true,
  "message": "Tenant provisioned successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Acme Corporation",
      "slug": "acme",
      "status": "trial",
      "subdomain": "acme.lr-mcq.com"
    },
    "admin": {
      "email": "admin@acme.com",
      "password": "SecurePass123",
      "loginUrl": "https://acme.lr-mcq.com/login"
    },
    "database": {
      "name": "tenant_acme",
      "url": "postgresql://postgres:root@localhost:5432/tenant_acme"
    }
  }
}

Error (400) - Slug already exists:
{
  "success": false,
  "message": "Tenant with this slug already exists",
  "data": {}
}

Error (400) - Plan not found:
{
  "success": false,
  "message": "Plan not found",
  "data": {}
}

Error (400) - Database creation failed:
{
  "success": false,
  "message": "Failed to create database: ...",
  "data": {}
}
```

### What This Endpoint Does:
1. Validates slug availability
2. Validates plan exists and is active
3. Creates PostgreSQL database (tenant_<slug>)
4. Runs Prisma migrations on new database
5. Seeds default data (roles, modules, permissions)
6. Creates tenant admin user
7. Registers tenant in platform database
8. Initializes usage tracking
9. Returns complete tenant credentials

### Rollback on Failure:
If any step fails, the endpoint automatically:
- Drops the created database
- Deletes tenant record from platform DB
- Deletes usage records
- Returns error message

---

## Phase 4.6: Usage Tracking & Enforcement

**Note:** All routes require `Authorization: Bearer <token>` header

### 1. Get All Tenants Usage Summary
```
GET /api/v1/platform/usage/summary
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Usage summary fetched successfully",
  "data": [
    {
      "tenantId": "uuid",
      "tenantName": "Acme Corporation",
      "planName": "Starter",
      "metrics": {
        "candidates": {
          "current": 45,
          "limit": 100,
          "percentage": 45
        },
        "assessments": {
          "current": 8,
          "limit": 50,
          "percentage": 16
        },
        "questions": {
          "current": 234,
          "limit": 500,
          "percentage": 47
        },
        "storage_mb": {
          "current": 0,
          "limit": 500,
          "percentage": 0
        },
        "api_calls": {
          "current": 0,
          "limit": 5000,
          "percentage": 0
        }
      }
    }
  ]
}
```

### 2. Get Tenant Usage Statistics
```
GET /api/v1/platform/usage/:tenant_id
Authorization: Bearer <token>

Replace :tenant_id with actual UUID

Response (200):
{
  "success": true,
  "message": "Usage statistics fetched successfully",
  "data": {
    "tenantId": "uuid",
    "planName": "Starter",
    "usage": {
      "candidates": {
        "current": 45,
        "limit": 100,
        "percentage": 45,
        "unlimited": false
      },
      "assessments": {
        "current": 8,
        "limit": 50,
        "percentage": 16,
        "unlimited": false
      },
      "questions": {
        "current": 234,
        "limit": 500,
        "percentage": 47,
        "unlimited": false
      },
      "storage_mb": {
        "current": 0,
        "limit": 500,
        "percentage": 0,
        "unlimited": false
      },
      "api_calls": {
        "current": 0,
        "limit": 5000,
        "percentage": 0,
        "unlimited": false
      }
    },
    "lastUpdated": "2025-02-17T10:30:00Z"
  }
}
```

### 3. Get Specific Metric Usage
```
GET /api/v1/platform/usage/:tenant_id/:metric
Authorization: Bearer <token>

Replace :tenant_id with actual UUID
Replace :metric with: candidates, assessments, questions, storage_mb, or api_calls

Example: GET /api/v1/platform/usage/abc-123/candidates

Response (200):
{
  "success": true,
  "message": "Metric usage fetched successfully",
  "data": {
    "metric": "candidates",
    "current": 45,
    "limit": 100,
    "unlimited": false,
    "percentage": 45
  }
}
```

### 4. Reset Metric Usage
```
PUT /api/v1/platform/usage/:tenant_id/:metric/reset
Authorization: Bearer <token>
Content-Type: application/json

Replace :tenant_id with actual UUID
Replace :metric with: candidates, assessments, questions, storage_mb, or api_calls

Example: PUT /api/v1/platform/usage/abc-123/candidates/reset

No Body Required

Response (200):
{
  "success": true,
  "message": "candidates usage reset successfully",
  "data": {}
}
```

### 5. Sync Usage from Database
```
POST /api/v1/platform/usage/:tenant_id/sync
Authorization: Bearer <token>
Content-Type: application/json

Replace :tenant_id with actual UUID

No Body Required

Response (200):
{
  "success": true,
  "message": "Usage synced successfully",
  "data": {
    "tenantId": "uuid",
    "planName": "Starter",
    "usage": {
      "candidates": {
        "current": 45,
        "limit": 100,
        "percentage": 45,
        "unlimited": false
      },
      "assessments": {
        "current": 8,
        "limit": 50,
        "percentage": 16,
        "unlimited": false
      },
      "questions": {
        "current": 234,
        "limit": 500,
        "percentage": 47,
        "unlimited": false
      }
    },
    "lastUpdated": "2025-02-17T10:30:00Z"
  }
}

Note: This endpoint counts actual records in the tenant database and updates usage accordingly.
Use this when:
- Initial setup (tenant has existing data)
- After manual database changes
- Periodic accuracy verification
```

### Usage Enforcement (Tenant APIs)

The following tenant endpoints now enforce usage limits:

#### Create Candidate (Enforced)
```
POST /api/v1/tenant/candidates/create
Authorization: Bearer <tenant_token>
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "assessment_id": "uuid",
  "technology_id": "uuid"
}

Success Response (201):
{
  "success": true,
  "message": "Candidate created successfully",
  "data": {...}
}

Limit Reached Response (403):
{
  "success": false,
  "message": "candidates limit reached (100/100). Please upgrade your plan.",
  "error": "USAGE_LIMIT_EXCEEDED",
  "data": {
    "current": 100,
    "limit": 100,
    "upgradeRequired": true
  }
}
```

#### Create Assessment (Enforced)
```
POST /api/v1/tenant/assessments/create
Authorization: Bearer <tenant_token>

Limit Reached Response (403):
{
  "success": false,
  "message": "assessments limit reached (50/50). Please upgrade your plan.",
  "error": "USAGE_LIMIT_EXCEEDED",
  "data": {
    "current": 50,
    "limit": 50,
    "upgradeRequired": true
  }
}
```

#### Create Question (Enforced)
```
POST /api/v1/tenant/questions/create
Authorization: Bearer <tenant_token>

Limit Reached Response (403):
{
  "success": false,
  "message": "questions limit reached (500/500). Please upgrade your plan.",
  "error": "USAGE_LIMIT_EXCEEDED",
  "data": {
    "current": 500,
    "limit": 500,
    "upgradeRequired": true
  }
}
```

#### Import Questions (Enforced)
```
POST /api/v1/tenant/questions/import
Authorization: Bearer <tenant_token>

Limit Reached Response (403):
{
  "success": false,
  "message": "questions limit reached (500/500). Please upgrade your plan.",
  "error": "USAGE_LIMIT_EXCEEDED",
  "data": {
    "current": 500,
    "limit": 500,
    "upgradeRequired": true
  }
}
```

### How Usage Tracking Works

1. **Automatic Increment**: When a resource is created, usage counter increases by 1
2. **Automatic Decrement**: When a resource is deleted, usage counter decreases by 1
3. **Bulk Operations**: Import operations increment by the actual count imported
4. **Monthly Periods**: Usage resets automatically at the start of each month
5. **Unlimited Plans**: Plans with -1 limit allow unlimited resources

### Testing Usage Enforcement

#### Test Scenario 1: Create Until Limit
```bash
# 1. Create a plan with low limits for testing
POST /api/v1/platform/plans
{
  "name": "Test Plan",
  "limits": {
    "candidates": 5,
    "assessments": 3,
    "questions": 10
  }
}

# 2. Provision a tenant with this plan
POST /api/v1/platform/provision
{
  "name": "Test Tenant",
  "slug": "test",
  "plan_id": "<test_plan_id>",
  "admin_email": "test@example.com",
  "admin_name": "Test User",
  "admin_password": "Test123"
}

# 3. Login as tenant admin and get token

# 4. Create 5 candidates (should succeed)
POST /api/v1/tenant/candidates/create (x5)

# 5. Try to create 6th candidate (should fail with 403)
POST /api/v1/tenant/candidates/create
# Response: "candidates limit reached (5/5)"

# 6. Check usage as platform admin
GET /api/v1/platform/usage/<tenant_id>
# Should show: candidates: 5/5 (100%)
```

#### Test Scenario 2: Sync Usage
```bash
# 1. Manually delete some candidates via database
# (Simulates out-of-sync scenario)

# 2. Check usage (will be incorrect)
GET /api/v1/platform/usage/<tenant_id>
# Shows: candidates: 5/5

# 3. Sync usage from database
POST /api/v1/platform/usage/<tenant_id>/sync

# 4. Check usage again (now correct)
GET /api/v1/platform/usage/<tenant_id>
# Shows: candidates: 3/5 (after manual deletion)
```

#### Test Scenario 3: Reset Usage
```bash
# 1. Tenant at limit
GET /api/v1/platform/usage/<tenant_id>
# Shows: candidates: 5/5

# 2. Reset usage as platform admin
PUT /api/v1/platform/usage/<tenant_id>/candidates/reset

# 3. Check usage
GET /api/v1/platform/usage/<tenant_id>
# Shows: candidates: 0/5

# 4. Tenant can now create resources again
```

#### Test Scenario 4: Unlimited Plan
```bash
# 1. Create unlimited plan
POST /api/v1/platform/plans
{
  "name": "Unlimited",
  "limits": {
    "candidates": -1,
    "assessments": -1,
    "questions": -1
  }
}

# 2. Upgrade tenant to unlimited plan
PUT /api/v1/platform/tenants/<tenant_id>
{
  "plan_id": "<unlimited_plan_id>"
}

# 3. Create unlimited resources (should never fail)
POST /api/v1/tenant/candidates/create (x1000)
# All succeed

# 4. Check usage
GET /api/v1/platform/usage/<tenant_id>
# Shows: candidates: 1000/-1 (unlimited: true)
```

---

## Testing Workflow

### Step 1: Login
1. POST `/api/v1/platform/auth/login` with credentials
2. Copy the `token` from response
3. Use this token in all subsequent requests

### Step 2: Test Plan Management
1. Create 3 plans (Starter, Business, Unlimited)
2. Get all plans
3. Get specific plan by ID
4. Update a plan
5. Toggle plan status
6. Try to delete a plan
7. Get tenants using a plan

### Step 3: Test Tenant Provisioning
1. Provision a tenant using automated endpoint
2. Verify database was created
3. Verify tenant can login immediately
4. Verify usage tracking is initialized
5. Try to provision with duplicate slug (should fail)

### Step 4: Test Tenant Management
1. Get all tenants (should include provisioned tenant)
2. Get specific tenant by ID
3. Update tenant details
4. Update tenant status (suspend/activate)
5. Update subscription dates
6. Get tenant usage
7. Delete tenant

### Step 5: Test Admin Management
1. Create a new platform admin
2. Get all admins
3. Get specific admin by ID
4. Update admin details
5. Change admin password
6. Try to delete self (should fail)
7. Delete another admin

### Step 6: Test Usage Tracking & Enforcement (NEW)
1. Get all tenants usage summary
2. Get specific tenant usage statistics
3. Get specific metric usage
4. Create resources until limit reached
5. Verify 403 error when limit exceeded
6. Reset usage for a metric
7. Sync usage from database
8. Test unlimited plan (no limits)

### Step 7: Test Authentication
1. Get your profile
2. Logout
3. Try to access protected route (should fail)

---

## Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authorization token is required",
  "data": {}
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "data": {}
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Plan not found",
  "data": {}
}
```

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error: ...",
  "data": {}
}
```

---

## Postman Collection Variables

Set these variables in your Postman collection:

```
base_url: http://localhost:3001/api/v1/platform
token: (set after login)
plan_id: (set after creating a plan)
tenant_id: (set after creating a tenant)
admin_id: (set after creating an admin)
role_id: (get from login response or admin list)
test_metric: (auto-set from usage response, e.g., "candidates")
```

### Login Test Script (Auto-save token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("token", response.data.token);
}
```

### Create Plan Test Script (Auto-save plan_id):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("plan_id", response.data.id);
}
```

### Create Tenant Test Script (Auto-save tenant_id):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("tenant_id", response.data.id);
}
```

### Create Admin Test Script (Auto-save admin_id and role_id):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("admin_id", response.data.id);
    pm.collectionVariables.set("role_id", response.data.role_id);
}
```

### Provision Tenant Test Script (Auto-save tenant_id):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("tenant_id", response.data.tenant.id);
}
```

### Get Usage Test Script (Auto-save for testing):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    // Save first metric for testing
    const firstMetric = Object.keys(response.data.usage)[0];
    pm.collectionVariables.set("test_metric", firstMetric);
}
```

---

## Quick Test Data

### Plan 1: Starter
```json
{
  "name": "Starter",
  "description": "Perfect for small teams",
  "price": 29,
  "limits": {"candidates": 50, "assessments": 10, "questions": 100, "storage_mb": 500, "api_calls": 5000},
  "features": {"custom_branding": false, "api_access": false, "priority_support": false, "advanced_analytics": false}
}
```

### Plan 2: Business
```json
{
  "name": "Business",
  "description": "For growing businesses",
  "price": 199,
  "limits": {"candidates": 500, "assessments": 100, "questions": 1000, "storage_mb": 5000, "api_calls": 50000},
  "features": {"custom_branding": true, "api_access": true, "priority_support": true, "advanced_analytics": true}
}
```

### Plan 3: Unlimited
```json
{
  "name": "Unlimited",
  "description": "Unlimited everything",
  "price": 999,
  "limits": {"candidates": -1, "assessments": -1, "questions": -1, "storage_mb": -1, "api_calls": -1},
  "features": {"custom_branding": true, "api_access": true, "priority_support": true, "advanced_analytics": true}
}
```

### Tenant 1: Acme Corp
```json
{
  "name": "Acme Corporation",
  "slug": "acme",
  "plan_id": "<use_plan_id_from_response>",
  "db_name": "tenant_acme",
  "db_url": "postgresql://postgres:root@localhost:5432/tenant_acme",
  "admin_email": "admin@acme.com",
  "admin_name": "John Doe",
  "status": "trial",
  "trial_ends_at": "2025-03-10T00:00:00Z"
}
```

### Tenant 2: TechStart
```json
{
  "name": "TechStart Inc",
  "slug": "techstart",
  "plan_id": "<use_plan_id_from_response>",
  "db_name": "tenant_techstart",
  "db_url": "postgresql://postgres:root@localhost:5432/tenant_techstart",
  "admin_email": "admin@techstart.com",
  "admin_name": "Sarah Johnson",
  "status": "active",
  "subscription_ends_at": "2026-02-10T00:00:00Z"
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Token expires in 7 days
- Use `-1` for unlimited in plan limits
- Super Admin has full access to all modules
- Plans cannot be deleted if they have active tenants
- Tenant slugs must be lowercase, alphanumeric with hyphens only
- Tenant status values: active, suspended, trial, expired, cancelled
- Suspended tenants are blocked by tenant resolver middleware

---

**Happy Testing! 🚀**
