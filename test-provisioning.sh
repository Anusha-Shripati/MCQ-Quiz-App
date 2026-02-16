#!/bin/bash

echo "🧪 Testing Phase 4.5 - Tenant Provisioning"
echo "=========================================="
echo ""

# Step 1: Login
echo "Step 1: Login as Platform Admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@logicrays.com","password":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Token obtained."
echo ""

# Step 2: Get Plans
echo "Step 2: Getting available plans..."
PLANS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/v1/platform/plans \
  -H "Authorization: Bearer $TOKEN")

PLAN_ID=$(echo $PLANS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PLAN_ID" ]; then
  echo "❌ No plans found!"
  echo "$PLANS_RESPONSE"
  exit 1
fi

echo "✅ Plan found! Plan ID: $PLAN_ID"
echo ""

# Step 3: Provision Tenant
echo "Step 3: Provisioning new tenant..."
PROVISION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/platform/provision \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Company\",
    \"slug\": \"testco\",
    \"plan_id\": \"$PLAN_ID\",
    \"admin_email\": \"admin@testco.com\",
    \"admin_name\": \"Test Admin\",
    \"admin_password\": \"TestPass123\"
  }")

echo "$PROVISION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PROVISION_RESPONSE"
echo ""

# Check if successful
if echo "$PROVISION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Tenant provisioned successfully!"
  echo ""
  echo "📋 Summary:"
  echo "  - Tenant Slug: testco"
  echo "  - Database: tenant_testco"
  echo "  - Admin Email: admin@testco.com"
  echo "  - Admin Password: TestPass123"
  echo ""
  echo "🎉 Phase 4.5 Test Completed Successfully!"
else
  echo "❌ Provisioning failed!"
  exit 1
fi
