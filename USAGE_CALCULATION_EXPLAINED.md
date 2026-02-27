# Usage Calculation - How It Works

## Two Approaches

### 1. **Incremental Tracking (Current Implementation)**
- Tracks usage by counting create/delete operations
- Fast and efficient
- Requires initial sync to match database reality

### 2. **Real-time Calculation (Available via Sync)**
- Counts actual records in database
- Always accurate
- Slightly slower (requires database query)

## How Usage is Calculated

### Initial State
When a tenant is provisioned, usage starts at 0 for all metrics.

### During Operations

#### Create Operation
```typescript
// 1. Check if limit allows creation
const check = await usageService.checkUsageLimit(tenantId, 'candidates');
if (!check.allowed) {
  return 403; // Limit reached
}

// 2. Create the resource
const candidate = await createCandidate(data);

// 3. Increment usage counter
await usageService.incrementUsage(tenantId, 'candidates'); // +1
```

#### Delete Operation
```typescript
// 1. Delete the resource
await deleteCandidate(id);

// 2. Decrement usage counter
await usageService.decrementUsage(tenantId, 'candidates'); // -1
```

#### Bulk Import
```typescript
// Import 50 questions
const result = await importQuestions(file);

// Increment by actual imported count
await usageService.incrementUsage(tenantId, 'questions', result.totalImported); // +50
```

### Database Storage

Usage is stored in `tenant_usage` table:

```sql
CREATE TABLE tenant_usage (
  id            UUID PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  metric_type   VARCHAR NOT NULL, -- 'candidates', 'assessments', 'questions'
  current_value INT DEFAULT 0,    -- Current usage count
  limit_value   INT,               -- Plan limit
  period_start  TIMESTAMP,         -- Start of month
  period_end    TIMESTAMP,         -- End of month
  created_at    TIMESTAMP,
  updated_at    TIMESTAMP,
  UNIQUE(tenant_id, metric_type, period_start)
);
```

### Monthly Periods

Usage is tracked per month:
- **Period Start**: 1st day of month, 00:00:00
- **Period End**: Last day of month, 23:59:59
- **Auto Reset**: New period created automatically next month

Example:
```
January 2025:  candidates = 45/100
February 2025: candidates = 0/100  (new period, fresh start)
```

## Sync Function - Ensuring Accuracy

### When to Use Sync

Use the sync endpoint when:
1. **Initial Setup**: Tenant already has data before usage tracking
2. **Data Inconsistency**: Manual database changes were made
3. **Migration**: Moving from old system to usage tracking
4. **Audit**: Periodic verification of accuracy

### How Sync Works

```typescript
async syncUsageFromDatabase(tenantId, tenantPrisma) {
  // 1. Count actual records in tenant database
  const candidatesCount = await tenantPrisma.candidates.count({ 
    where: { deleted_at: null } 
  });
  const assessmentsCount = await tenantPrisma.assessments.count({ 
    where: { deleted_at: null } 
  });
  const questionsCount = await tenantPrisma.questions.count({ 
    where: { deleted_at: null } 
  });

  // 2. Update usage table with actual counts
  await updateUsage('candidates', candidatesCount);
  await updateUsage('assessments', assessmentsCount);
  await updateUsage('questions', questionsCount);
}
```

### Sync API Endpoint

```bash
POST /api/v1/platform/usage/{tenantId}/sync
Authorization: Bearer {platform_admin_token}

# Response
{
  "success": true,
  "message": "Usage synced successfully",
  "data": {
    "tenantId": "uuid",
    "planName": "Starter",
    "usage": {
      "candidates": { "current": 45, "limit": 100, "percentage": 45 },
      "assessments": { "current": 12, "limit": 50, "percentage": 24 },
      "questions": { "current": 234, "limit": 500, "percentage": 47 }
    }
  }
}
```

## Example Scenarios

### Scenario 1: New Tenant
```
Day 1: Create tenant
  - candidates: 0/100
  - assessments: 0/50
  - questions: 0/500

Day 2: Create 10 candidates
  - candidates: 10/100 ✅

Day 3: Create 90 more candidates
  - candidates: 100/100 ✅

Day 4: Try to create 1 more
  - ❌ 403 Forbidden: "candidates limit reached (100/100)"
```

### Scenario 2: Existing Tenant (Migration)
```
Before Usage Tracking:
  - Database has 75 candidates
  - Usage table: 0/100 (incorrect!)

After Sync:
  POST /api/v1/platform/usage/{tenantId}/sync
  - Usage table: 75/100 ✅ (correct!)

Now tenant can only create 25 more candidates
```

### Scenario 3: Manual Database Changes
```
Current State:
  - Usage: 50/100 candidates

Admin manually deletes 10 candidates via SQL:
  - Database: 40 candidates
  - Usage: 50/100 (out of sync!)

After Sync:
  POST /api/v1/platform/usage/{tenantId}/sync
  - Usage: 40/100 ✅ (synced!)
```

## Best Practices

### 1. Initial Sync on Provisioning
```typescript
// When provisioning a new tenant
await provisionTenant(data);
await usageService.syncUsageFromDatabase(tenantId, tenantPrisma);
```

### 2. Periodic Sync (Optional)
```typescript
// Run daily/weekly via cron job
cron.schedule('0 0 * * *', async () => {
  const tenants = await getAllTenants();
  for (const tenant of tenants) {
    await usageService.syncUsageFromDatabase(tenant.id, tenantPrisma);
  }
});
```

### 3. Sync After Bulk Operations
```typescript
// After manual data import/cleanup
await bulkImportData(data);
await usageService.syncUsageFromDatabase(tenantId, tenantPrisma);
```

## Performance Considerations

### Incremental Tracking (Fast)
- **Speed**: O(1) - Just increment/decrement
- **Accuracy**: Depends on sync
- **Use Case**: Normal operations

### Real-time Calculation (Accurate)
- **Speed**: O(n) - Count all records
- **Accuracy**: Always 100%
- **Use Case**: Sync operations, audits

### Recommendation
- Use **incremental tracking** for normal operations
- Use **sync** periodically or when needed
- Consider **hybrid**: Sync on provisioning, then track incrementally

## Monitoring

### Check for Drift
```sql
-- Compare usage table vs actual counts
SELECT 
  t.name as tenant_name,
  tu.metric_type,
  tu.current_value as tracked_usage,
  CASE 
    WHEN tu.metric_type = 'candidates' THEN (
      SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL
    )
    WHEN tu.metric_type = 'assessments' THEN (
      SELECT COUNT(*) FROM assessments WHERE deleted_at IS NULL
    )
    WHEN tu.metric_type = 'questions' THEN (
      SELECT COUNT(*) FROM questions WHERE deleted_at IS NULL
    )
  END as actual_count,
  tu.current_value - CASE ... END as drift
FROM tenant_usage tu
JOIN tenants t ON t.id = tu.tenant_id
WHERE ABS(tu.current_value - ...) > 0;
```

## Summary

**How usage is calculated:**
1. **Incremental**: Track create (+1) and delete (-1) operations
2. **Sync**: Count actual database records when needed
3. **Monthly**: Reset automatically each month
4. **Accurate**: Sync ensures alignment with reality

**Key Points:**
- ✅ Fast incremental tracking for normal operations
- ✅ Sync function for accuracy verification
- ✅ Monthly period-based tracking
- ✅ Handles soft deletes (deleted_at IS NULL)
- ✅ Platform admin can sync anytime
