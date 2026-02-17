#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Multi-Tenant Setup Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Database credentials
DB_USER="postgres"
DB_PASSWORD="root"
DB_HOST="localhost"
DB_PORT="5432"
PLATFORM_DB="platform_db"

# Tenant configurations
TENANT_1_SLUG="localhost"
TENANT_1_NAME="Localhost Development"
TENANT_1_DB="app_db"
TENANT_1_DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${TENANT_1_DB}"

TENANT_2_SLUG="xyz"
TENANT_2_NAME="XYZ Corporation"
TENANT_2_DB="xyz_db"
TENANT_2_DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${TENANT_2_DB}"

# Function to check if database exists
check_db_exists() {
    local db_name=$1
    local result=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db_name';" 2>/dev/null)
    [ "$result" = "1" ]
}

# Function to check if tenant exists in platform DB
check_tenant_exists() {
    local tenant_slug=$1
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $PLATFORM_DB -tAc \
        "SELECT COUNT(*) FROM tenants WHERE slug='$tenant_slug';" 2>/dev/null
}

echo -e "${YELLOW}Step 1: Checking Tenant 1 (${TENANT_1_SLUG})...${NC}"

# Check if tenant 1 DB exists (should already exist)
if check_db_exists $TENANT_1_DB; then
    echo -e "${GREEN}✓ Database '${TENANT_1_DB}' already exists${NC}"
else
    echo -e "${RED}✗ Database '${TENANT_1_DB}' does not exist. Please run migrations first.${NC}"
    exit 1
fi

# Check if tenant 1 exists in platform DB
TENANT_1_COUNT=$(check_tenant_exists $TENANT_1_SLUG)
if [ "$TENANT_1_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tenant '${TENANT_1_SLUG}' already exists in platform DB${NC}"
else
    echo -e "${BLUE}→ Creating tenant '${TENANT_1_SLUG}' in platform DB...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $PLATFORM_DB <<EOF
INSERT INTO tenants (id, name, slug, db_name, db_url, admin_email, admin_name, status, plan_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '${TENANT_1_NAME}',
    '${TENANT_1_SLUG}',
    '${TENANT_1_DB}',
    '${TENANT_1_DB_URL}',
    'admin@localhost.com',
    'Localhost Admin',
    'active',
    (SELECT id FROM plans WHERE name = 'Free' LIMIT 1),
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
EOF
    echo -e "${GREEN}✓ Tenant '${TENANT_1_SLUG}' created${NC}"
fi

echo -e "\n${YELLOW}Step 2: Setting up Tenant 2 (${TENANT_2_SLUG})...${NC}"

# Check if tenant 2 DB exists
if check_db_exists $TENANT_2_DB; then
    echo -e "${GREEN}✓ Database '${TENANT_2_DB}' already exists${NC}"
else
    echo -e "${BLUE}→ Creating database '${TENANT_2_DB}'...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER <<EOF
CREATE DATABASE ${TENANT_2_DB};
EOF
    echo -e "${GREEN}✓ Database '${TENANT_2_DB}' created${NC}"
fi

# Check if tenant 2 exists in platform DB
TENANT_2_COUNT=$(check_tenant_exists $TENANT_2_SLUG)
if [ "$TENANT_2_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tenant '${TENANT_2_SLUG}' already exists in platform DB${NC}"
else
    echo -e "${BLUE}→ Creating tenant '${TENANT_2_SLUG}' in platform DB...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $PLATFORM_DB <<EOF
INSERT INTO tenants (id, name, slug, db_name, db_url, admin_email, admin_name, status, plan_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '${TENANT_2_NAME}',
    '${TENANT_2_SLUG}',
    '${TENANT_2_DB}',
    '${TENANT_2_DB_URL}',
    'admin@xyz.com',
    'XYZ Admin',
    'active',
    (SELECT id FROM plans WHERE name = 'Free' LIMIT 1),
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
EOF
    echo -e "${GREEN}✓ Tenant '${TENANT_2_SLUG}' created${NC}"
fi

echo -e "\n${YELLOW}Step 3: Running migrations for ${TENANT_2_DB}...${NC}"

# Check if tables exist in xyz_db
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TENANT_2_DB -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tables already exist in ${TENANT_2_DB}${NC}"
else
    echo -e "${BLUE}→ Running Prisma migrations...${NC}"
    # Set environment variable for tenant DB and run migrations
    cd ..
    export DATABASE_URL="${TENANT_2_DB_URL}"
    npx prisma migrate deploy --schema=./src/db/tenant/schema.prisma
    cd test
    echo -e "${GREEN}✓ Migrations complete${NC}"
fi

echo -e "\n${YELLOW}Step 4: Running seeders for ${TENANT_2_DB}...${NC}"
echo -e "${BLUE}→ Running Prisma seed...${NC}"
cd ..
export DATABASE_URL="${TENANT_2_DB_URL}"
npx prisma db seed --schema=./src/db/tenant/schema.prisma
cd test
echo -e "${GREEN}✓ Seeding complete${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Tenant Summary:${NC}"
echo -e "1. ${TENANT_1_SLUG}"
echo -e "   - Name: ${TENANT_1_NAME}"
echo -e "   - Database: ${TENANT_1_DB}"
echo -e "   - URL: ${TENANT_1_DB_URL}"
echo -e ""
echo -e "2. ${TENANT_2_SLUG}"
echo -e "   - Name: ${TENANT_2_NAME}"
echo -e "   - Database: ${TENANT_2_DB}"
echo -e "   - URL: ${TENANT_2_DB_URL}"
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Update your hosts file (optional for testing):"
echo -e "   ${BLUE}127.0.0.1 localhost.lr-mcq.com${NC}"
echo -e "   ${BLUE}127.0.0.1 xyz.lr-mcq.com${NC}"
echo -e ""
echo -e "2. Access tenants:"
echo -e "   ${BLUE}http://localhost:3000${NC} → localhost tenant"
echo -e "   ${BLUE}http://xyz.lr-mcq.com:3000${NC} → xyz tenant"
echo -e ""
