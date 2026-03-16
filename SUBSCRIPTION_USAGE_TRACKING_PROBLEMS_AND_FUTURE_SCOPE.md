# Subscription Usage Tracking - Problems & Future Scope

## ✅ **CURRENT IMPLEMENTATION: Creation-Based Usage Tracking**

### **Implemented Solution **

We have successfully implemented a **creation-based usage tracking system** that addresses the core billing and data management challenges:

#### **Key Features Implemented:**

1. **Creation Limits Per Period**
   - Usage tracks resources created within subscription period, not total existing resources
   - Deleting resources does NOT reduce usage count
   - Tenants keep all historical data as loyalty benefit

2. **Period-Based Usage Reset**
   - Usage counts reset at subscription renewal
   - Historical data remains intact
   - Long-term customers accumulate more resources over time

3. **Database-Based Period Tracking**
   - Usage queries filter by `created_at` within subscription period boundaries
   - Eliminates date calculation discrepancies
   - Uses actual stored period dates from usage entries

4. **Admin Reset Controls**
   - Platform admins can reset usage counts to 0 without affecting actual data
   - Granular reset per metric (candidates, assessments, questions)
   - Clear messaging about what reset does and doesn't do

5. **Plan Change Validation**
   - Real-time validation when changing plans
   - Prevents downgrades that would exceed new limits
   - Automatic usage limit updates for approved plan changes

#### **Business Benefits:**
- **Fair Billing**: Pay for creation capacity, not storage
- **Data Ownership**: Tenants keep all historical data
- **Loyalty Rewards**: Longer subscriptions = more accumulated resources
- **Predictable Costs**: Clear monthly creation limits
- **No Data Loss**: Deletion doesn't affect billing or usage tracking

#### **Technical Implementation:**
```sql
-- Usage tracking with period-specific filtering
SELECT COUNT(*) FROM candidates 
WHERE tenant_id = ? 
  AND deleted_at IS NULL 
  AND created_at >= subscription_starts_at 
  AND created_at <= subscription_ends_at;
```

---

## 🚨 **REMAINING PROBLEMS FOR FUTURE ENHANCEMENT**

### **Problem 1: No Subscription History Tracking**

**Issue**: We don't have any subscription history table to track:
- When subscriptions are renewed
- Who renewed them (admin vs auto-renewal)
- Previous subscription periods
- Plan changes over time
- Payment history
- Subscription modifications

**Current Impact**:
- No audit trail of subscription changes
- Cannot track subscription lifecycle
- No way to identify renewal patterns
- Billing reconciliation is impossible
- Cannot generate subscription reports

### **Problem 2: Dual Usage Entry Conflict**

**Issue**: When admin changes subscription dates, multiple usage entries can exist for overlapping periods.

**Scenario Example**:
```
Original Subscription: Jan 1 - Jan 31
Usage Entry 1: period_start=Jan 1, period_end=Jan 31

Admin Changes To: Jan 5 - Feb 5  
Usage Entry 2: period_start=Jan 5, period_end=Feb 5

Overlap Period: Jan 5 - Jan 31 (both entries exist)
```

**Current Impact**:
- System doesn't know which usage entry to update during overlap period
- Usage tracking becomes inconsistent
- Billing calculations are incorrect
- Data integrity is compromised

### **Problem 3: No Period Transition Handling**

**Issue**: When subscription periods change, existing usage data becomes orphaned or inconsistent.

**Current Impact**:
- Historical usage data loses context
- Cannot properly calculate usage across period boundaries
- Reporting becomes unreliable
- Data cleanup is manual and error-prone

### **Problem 4: No Subscription State Management**

**Issue**: No proper state machine for subscription lifecycle.

**Missing States**:
- `pending_renewal`
- `grace_period`
- `payment_failed`
- `scheduled_cancellation`
- `paused`

**Current Impact**:
- Cannot handle complex subscription scenarios
- No grace period handling
- No failed payment recovery
- Limited subscription management options

### **Problem 5: No Usage Period Versioning**

**Issue**: Usage entries don't have versioning or relationship to subscription changes.

**Current Impact**:
- Cannot track which usage belongs to which subscription period
- Historical data analysis is impossible
- Cannot handle retroactive billing adjustments
- Data migration becomes complex

---

## 🔮 **FUTURE SCOPE SOLUTIONS**

### **Solution 1: Subscription History System**

#### **A. Subscription History Table**
```sql
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  subscription_id UUID NOT NULL, -- Links to current subscription
  plan_id UUID NOT NULL,
  status VARCHAR NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  created_by UUID, -- Admin who made the change
  created_by_type ENUM('admin', 'system', 'payment_gateway'),
  change_reason VARCHAR, -- 'renewal', 'upgrade', 'downgrade', 'extension'
  previous_subscription_id UUID, -- Links to previous subscription
  billing_amount DECIMAL,
  payment_status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);
```

#### **B. Current Subscription Table**
```sql
CREATE TABLE current_subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID UNIQUE NOT NULL,
  current_history_id UUID NOT NULL,
  next_renewal_date TIMESTAMP,
  auto_renewal BOOLEAN DEFAULT true,
  grace_period_ends_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (current_history_id) REFERENCES subscription_history(id)
);
```

### **Solution 2: Usage Period Versioning**

#### **A. Enhanced Usage Tracking**
```sql
CREATE TABLE tenant_usage_periods (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  subscription_history_id UUID NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  status ENUM('active', 'completed', 'cancelled', 'merged'),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (subscription_history_id) REFERENCES subscription_history(id),
  UNIQUE(tenant_id, subscription_history_id, period_start)
);

CREATE TABLE tenant_usage_entries (
  id UUID PRIMARY KEY,
  usage_period_id UUID NOT NULL,
  metric_type VARCHAR NOT NULL,
  current_value INT DEFAULT 0,
  limit_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (usage_period_id) REFERENCES tenant_usage_periods(id),
  UNIQUE(usage_period_id, metric_type)
);
```

### **Solution 3: Subscription State Machine**

#### **A. Enhanced Status Management**
```typescript
enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PENDING_RENEWAL = 'pending_renewal',
  GRACE_PERIOD = 'grace_period',
  PAYMENT_FAILED = 'payment_failed',
  SCHEDULED_CANCELLATION = 'scheduled_cancellation',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

enum SubscriptionTransition {
  ACTIVATE = 'activate',
  RENEW = 'renew',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  PAUSE = 'pause',
  RESUME = 'resume',
  CANCEL = 'cancel',
  SUSPEND = 'suspend',
  EXPIRE = 'expire'
}
```

#### **B. State Transition Rules**
```typescript
const ALLOWED_TRANSITIONS = {
  [SubscriptionStatus.TRIAL]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.EXPIRED,
    SubscriptionStatus.CANCELLED
  ],
  [SubscriptionStatus.ACTIVE]: [
    SubscriptionStatus.PENDING_RENEWAL,
    SubscriptionStatus.PAUSED,
    SubscriptionStatus.SCHEDULED_CANCELLATION,
    SubscriptionStatus.SUSPENDED
  ],
  // ... more transition rules
};
```

### **Solution 4: Usage Conflict Resolution**

#### **A. Period Overlap Detection**
```typescript
interface UsagePeriodConflict {
  conflictType: 'overlap' | 'gap' | 'duplicate';
  affectedPeriods: UsagePeriod[];
  resolutionStrategy: 'merge' | 'split' | 'prioritize' | 'manual';
  suggestedAction: string;
}

class UsageConflictResolver {
  detectConflicts(tenantId: string): UsagePeriodConflict[];
  resolveConflict(conflict: UsagePeriodConflict): void;
  mergeOverlappingPeriods(periods: UsagePeriod[]): UsagePeriod;
}
```

#### **B. Smart Usage Attribution**
```typescript
class SmartUsageTracker {
  // Determines which usage period to update based on:
  // 1. Current date
  // 2. Active subscription
  // 3. Period priority rules
  determineTargetPeriod(tenantId: string, timestamp: Date): UsagePeriod;
  
  // Handles usage during period transitions
  handlePeriodTransition(
    oldPeriod: UsagePeriod, 
    newPeriod: UsagePeriod, 
    transitionDate: Date
  ): void;
}
```

### **Solution 5: Billing Integration**

#### **A. Billing Events System**
```sql
CREATE TABLE billing_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  subscription_history_id UUID NOT NULL,
  event_type VARCHAR NOT NULL, -- 'charge', 'refund', 'credit'
  amount DECIMAL NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  payment_gateway_id VARCHAR,
  status VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **B. Usage-Based Billing**
```typescript
class UsageBillingCalculator {
  calculateBillingAmount(
    tenantId: string, 
    billingPeriod: DateRange,
    pricingModel: PricingModel
  ): BillingCalculation;
  
  handleProration(
    oldPlan: Plan, 
    newPlan: Plan, 
    changeDate: Date
  ): ProrationCalculation;
}
```

### **Solution 6: Advanced Reporting & Analytics**

#### **A. Subscription Analytics**
```typescript
interface SubscriptionMetrics {
  churnRate: number;
  renewalRate: number;
  upgradeRate: number;
  downgradeRate: number;
  averageLifetimeValue: number;
  usageEfficiency: Record<string, number>;
}

class SubscriptionAnalytics {
  generateTenantReport(tenantId: string, period: DateRange): TenantReport;
  generatePlatformMetrics(period: DateRange): SubscriptionMetrics;
  predictChurnRisk(tenantId: string): ChurnRiskScore;
}
```

### **Solution 7: Data Migration & Cleanup**

#### **A. Migration Strategy**
```typescript
class SubscriptionMigrator {
  // Migrate existing data to new structure
  migrateExistingSubscriptions(): MigrationResult;
  
  // Clean up orphaned usage entries
  cleanupOrphanedUsage(): CleanupResult;
  
  // Validate data integrity
  validateDataIntegrity(): ValidationResult;
}
```

### **Solution 8: API Enhancements**

#### **A. Enhanced Subscription Management APIs**
```typescript
// Subscription History
GET /api/v1/platform/tenants/:id/subscription-history
POST /api/v1/platform/tenants/:id/renew-subscription
POST /api/v1/platform/tenants/:id/change-plan
PUT /api/v1/platform/tenants/:id/pause-subscription
PUT /api/v1/platform/tenants/:id/resume-subscription

// Usage Period Management
GET /api/v1/platform/tenants/:id/usage-periods
POST /api/v1/platform/tenants/:id/usage-periods/resolve-conflicts
GET /api/v1/platform/tenants/:id/usage-conflicts

// Billing Integration
GET /api/v1/platform/tenants/:id/billing-events
POST /api/v1/platform/tenants/:id/calculate-billing
```

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Critical Fixes (Immediate)**
1. Implement temporary solution for dual usage entry problem
2. Add basic subscription change logging
3. Implement usage period conflict detection

### **Phase 2: Core Infrastructure (Short-term)**
1. Subscription history table implementation
2. Enhanced usage period versioning
3. Basic state machine for subscriptions

### **Phase 3: Advanced Features (Medium-term)**
1. Billing integration
2. Advanced analytics
3. Automated conflict resolution

### **Phase 4: Enterprise Features (Long-term)**
1. Multi-currency support
2. Complex pricing models
3. Advanced reporting dashboard

---

## 📊 **ESTIMATED EFFORT**

- **Phase 1**: 1-2 weeks
- **Phase 2**: 3-4 weeks  
- **Phase 3**: 4-6 weeks
- **Phase 4**: 6-8 weeks

**Total Estimated Effort**: 14-20 weeks (3.5-5 months)

---

## 🔍 **MONITORING & ALERTS**

### **Data Integrity Monitoring**
- Daily checks for usage period conflicts
- Subscription state consistency validation
- Billing calculation accuracy verification
- Usage data completeness monitoring

### **Business Metrics Tracking**
- Subscription lifecycle metrics
- Usage pattern analysis
- Revenue impact tracking
- Customer satisfaction correlation

---

**Status**: Future Scope Documentation  
**Priority**: High (Critical business logic issues)  
**Dependencies**: Current system stabilization  
**Risk Level**: High (Revenue and data integrity impact)