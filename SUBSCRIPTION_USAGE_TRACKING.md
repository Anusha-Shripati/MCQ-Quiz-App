# Subscription-Based Usage Tracking System

## Overview
This document outlines the new approach for usage tracking based on actual subscription billing periods instead of calendar months, ensuring accurate usage limits and billing alignment.

## Key Changes

### Database Schema Changes
- **Add**: `subscription_starts_at` field to tenants table
- **Remove**: `trial_ends_at` field from tenants table
- **Unified Approach**: Treat trial and paid subscriptions the same, only differing in usage limits

### Core Principle
Usage tracking periods will align with tenant's actual subscription billing cycle (e.g., Jan 15 - Feb 14) instead of calendar months (Jan 1 - Jan 31).

## Implementation Approach

### 1. Usage Entry Creation Points

#### A. Provisioning (New Tenant)
- Create usage entries for current subscription period when tenant is provisioned
- Calculate period_start from `subscription_starts_at`
- Calculate period_end based on subscription duration

#### B. Manual Tenant Updates (Admin Panel)
- When admin extends subscription manually
- When admin changes subscription dates
- Always create/update usage entries for new period

#### C. Plan Changes (Upgrade/Downgrade)
- Update existing usage entry limits to new plan limits
- Validate current usage against new limits
- Handle over-limit scenarios appropriately

#### D. Subscription Renewal
- Create new usage entries for next billing period
- Reset usage counters for new period

### 2. Usage Service Logic

#### Primary Flow
```
API Request → Check Usage Entry Exists → 
If Exists: Validate current date within period → Update usage
If Not Exists: Check subscription active → Create entry → Update usage
If Expired: Return error message
```

#### Validation Rules
- Current date must be between period_start and period_end
- If outside period bounds, return appropriate error
- No usage entry creation for expired subscriptions

### 3. Sync API Updates
- Only sync usage data for current subscription period
- Don't count historical data from previous periods
- Calculate actual counts from tenant database for current period only

## Error Handling Scenarios

### Usage Entry Not Found
```
Check tenant subscription status:
- If expired: "Subscription expired, please renew"
- If active: Create new usage entry for current period
- If system error: "System error, please contact support"
```

### Current Date Outside Period
```
- "Billing period mismatch, please contact support"
- Log incident for investigation
```

### Over Limit After Plan Downgrade
```
- Block new operations
- Show: "Current usage exceeds new plan limits"
- Suggest upgrade or data cleanup
```

## Potential Problems & Solutions

### 1. Manual Subscription Extensions
**Problem**: Admin manually extends subscription but doesn't trigger usage entry creation
**Solution**: 
- Ensure all subscription modification flows create usage entries
- Add validation in admin panel to prevent incomplete updates
- Create usage entries automatically when subscription dates change

### 2. Subscription Downgrade Mid-Period
**Problem**: Current usage might exceed new plan limits after downgrade
**Solution**:
- Update existing usage entry limits immediately
- Validate current usage against new limits
- Block operations if over new limits
- Provide clear messaging about limit exceeded

### 3. Failed Provisioning Recovery
**Problem**: Tenant created but usage entries not created due to partial failure
**Solution**:
- Add validation in usage service to detect missing entries for active tenants
- Automatic recovery: Create missing usage entries when detected
- Log incidents for monitoring

### 4. Bulk Operations Edge Case
**Problem**: Bulk operations spanning period boundaries cause inconsistent tracking
**Solution**:
- Process bulk operations atomically within single period
- If period changes during bulk operation, handle gracefully
- Consider operation timestamp for period assignment

### 5. System Clock Drift
**Problem**: Different servers have different system times causing validation failures
**Solution**:
- Use centralized time source (UTC)
- Add small tolerance buffer (±5 minutes) for period validation
- Monitor system time synchronization

## Implementation Checklist

### Database Changes
- [ ] Remove `trial_ends_at` field from tenants table
- [ ] Update tenant creation/update queries
- [ ] Create migration script

### Backend Updates
- [ ] Update provisioning service to create usage entries
- [ ] Modify usage service period calculation logic
- [ ] Update sync API to use subscription periods
- [ ] Add manual subscription extension handling
- [ ] Implement plan change usage validation
- [ ] Update error messages and handling

### Admin Panel Updates
- [ ] Add usage entry creation to manual updates
- [ ] Implement plan change validation
- [ ] Update subscription extension workflows

### Testing Scenarios
- [ ] New tenant provisioning
- [ ] Manual subscription extension
- [ ] Plan upgrade/downgrade
- [ ] Subscription renewal
- [ ] Edge cases (expired, failed provisioning)
- [ ] Bulk operations
- [ ] Period boundary transitions

## Benefits of This Approach

1. **Accurate Billing Alignment**: Usage periods match actual subscription billing
2. **Prevents Limit Bypassing**: No more month-boundary exploitation
3. **Clear Separation of Concerns**: Cron job manages lifecycle, usage service tracks usage
4. **Consistent Behavior**: All usage operations follow same validation logic
5. **Better Error Handling**: Clear distinction between different failure scenarios

## Migration Strategy

1. **Phase 1**: Add new field, keep old field for compatibility
2. **Phase 2**: Update all creation/update flows to use new field
3. **Phase 3**: Migrate existing data from old field to new field
4. **Phase 4**: Remove old field and update all references
5. **Phase 5**: Update usage entries to use subscription periods

## Monitoring & Alerts

- Monitor cron job execution for subscription lifecycle management
- Alert on failed usage entry creation during provisioning
- Track usage service errors for pattern analysis
- Monitor system time synchronization across servers
- Alert on manual subscription modifications without usage entry creation