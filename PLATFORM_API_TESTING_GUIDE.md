# Platform Admin API Testing Guide - Phase 4.1, 4.2, 4.3, 4.4 & 4.5

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

### Step 3: Test Tenant Provisioning (NEW)
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

### Step 5: Test Authentication
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
