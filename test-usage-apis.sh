#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"
PLATFORM_EMAIL="admin@logicrays.com"
PLATFORM_PASSWORD="Admin@123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Phase 4.6: Usage Tracking API Test Script"
echo "=========================================="
echo ""

# Step 1: Login as Platform Admin
echo -e "${YELLOW}[1/8] Logging in as Platform Admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/platform/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PLATFORM_EMAIL\",\"password\":\"$PLATFORM_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Token: ${TOKEN:0:20}..."
fi
echo ""

# Step 2: Get all plans to find a plan_id
echo -e "${YELLOW}[2/8] Getting plans...${NC}"
PLANS_RESPONSE=$(curl -s -X GET "$BASE_URL/platform/plans" \
  -H "Authorization: Bearer $TOKEN")

PLAN_ID=$(echo $PLANS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PLAN_ID" ]; then
  echo -e "${RED}✗ No plans found. Creating a test plan...${NC}"
  
  CREATE_PLAN_RESPONSE=$(curl -s -X POST "$BASE_URL/platform/plans" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Plan",
      "description": "Test plan for usage tracking",
      "price": 29,
      "limits": {
        "candidates": 5,
        "assessments": 3,
        "questions": 10,
        "storage_mb": 100,
        "api_calls": 1000
      },
      "features": {
        "custom_branding": false,
        "api_access": false
      }
    }')
  
  PLAN_ID=$(echo $CREATE_PLAN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  
  if [ -z "$PLAN_ID" ]; then
    echo -e "${RED}✗ Failed to create plan${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ Test plan created${NC}"
  fi
else
  echo -e "${GREEN}✓ Found existing plan${NC}"
fi
echo "Plan ID: $PLAN_ID"
echo ""

# Step 3: Get all tenants to find a tenant_id
echo -e "${YELLOW}[3/8] Getting tenants...${NC}"
TENANTS_RESPONSE=$(curl -s -X GET "$BASE_URL/platform/tenants" \
  -H "Authorization: Bearer $TOKEN")

TENANT_ID=$(echo $TENANTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TENANT_ID" ]; then
  echo -e "${RED}✗ No tenants found${NC}"
  echo "Please provision a tenant first using: POST /api/v1/platform/provision"
  exit 1
else
  echo -e "${GREEN}✓ Found tenant${NC}"
  echo "Tenant ID: $TENANT_ID"
fi
echo ""

# Step 4: Test - Get All Tenants Usage Summary
echo -e "${YELLOW}[4/8] Testing: GET /platform/usage/summary${NC}"
SUMMARY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/platform/usage/summary" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$SUMMARY_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$SUMMARY_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "Response: $(echo $BODY | head -c 200)..."
else
  echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Step 5: Test - Get Tenant Usage Statistics
echo -e "${YELLOW}[5/8] Testing: GET /platform/usage/:tenantId${NC}"
STATS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/platform/usage/$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$STATS_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$STATS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "Response: $(echo $BODY | head -c 200)..."
else
  echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Step 6: Test - Get Specific Metric Usage
echo -e "${YELLOW}[6/8] Testing: GET /platform/usage/:tenantId/candidates${NC}"
METRIC_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/platform/usage/$TENANT_ID/candidates" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$METRIC_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$METRIC_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "Response: $(echo $BODY | head -c 200)..."
else
  echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Step 7: Test - Sync Usage from Database
echo -e "${YELLOW}[7/8] Testing: POST /platform/usage/:tenantId/sync${NC}"
SYNC_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/platform/usage/$TENANT_ID/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$SYNC_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$SYNC_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "Response: $(echo $BODY | head -c 200)..."
else
  echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Step 8: Test - Reset Metric Usage
echo -e "${YELLOW}[8/8] Testing: PUT /platform/usage/:tenantId/candidates/reset${NC}"
RESET_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/platform/usage/$TENANT_ID/candidates/reset" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESET_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$RESET_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Success (200)${NC}"
  echo "Response: $(echo $BODY | head -c 200)..."
else
  echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}All Phase 4.6 Usage Tracking APIs tested!${NC}"
echo ""
echo "Endpoints tested:"
echo "  1. POST /platform/auth/login"
echo "  2. GET  /platform/plans"
echo "  3. GET  /platform/tenants"
echo "  4. GET  /platform/usage/summary"
echo "  5. GET  /platform/usage/:tenantId"
echo "  6. GET  /platform/usage/:tenantId/candidates"
echo "  7. POST /platform/usage/:tenantId/sync"
echo "  8. PUT  /platform/usage/:tenantId/candidates/reset"
echo ""
echo "=========================================="
