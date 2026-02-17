import { PrismaClient } from '../generated/client';
import bcrypt from 'bcryptjs';

const platformPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const MODULES = [
  { name: 'tenants', description: 'Manage organizations and tenants' },
  { name: 'plans', description: 'Manage subscription plans' },
  { name: 'admins', description: 'Manage platform administrators' },
  { name: 'roles', description: 'Manage platform roles and permissions' },
  { name: 'analytics', description: 'View platform analytics and reports' },
];

const PLANS = [
  {
    name: 'Free',
    description: 'Free plan for testing',
    price: 0,
    limits: { candidates: 10, assessments: 5, questions: 50, storage_mb: 100, api_calls: 1000 },
    features: { custom_branding: false, api_access: false, priority_support: false, advanced_analytics: false },
  },
  {
    name: 'Pro',
    description: 'Professional plan for growing teams',
    price: 99,
    limits: { candidates: 100, assessments: 50, questions: 500, storage_mb: 1000, api_calls: 10000 },
    features: { custom_branding: true, api_access: true, priority_support: false, advanced_analytics: true },
  },
  {
    name: 'Enterprise',
    description: 'Enterprise plan with unlimited resources',
    price: 499,
    limits: { candidates: -1, assessments: -1, questions: -1, storage_mb: -1, api_calls: -1 },
    features: { custom_branding: true, api_access: true, priority_support: true, advanced_analytics: true },
  },
];

async function seedPlatform() {
  console.log('🌱 Seeding platform database...');

  try {
    // 1. Create Platform Modules
    console.log('Creating platform modules...');
    const modules = [];
    for (const module of MODULES) {
      const created = await platformPrisma.platform_modules.upsert({
        where: { name: module.name },
        update: module,
        create: module,
      });
      modules.push(created);
    }
    console.log(`✅ Created ${modules.length} modules`);

    // 2. Create Super Admin Role
    console.log('Creating Super Admin role...');
    const superAdminRole = await platformPrisma.platform_roles.upsert({
      where: { name: 'Super Admin' },
      update: {},
      create: {
        name: 'Super Admin',
        description: 'Full access to all platform features',
      },
    });
    console.log('✅ Created Super Admin role');

    // 3. Assign Permissions to Super Admin
    console.log('Assigning permissions to Super Admin...');
    for (const module of modules) {
      await platformPrisma.platform_role_permissions.upsert({
        where: {
          role_id_module_id: {
            role_id: superAdminRole.id,
            module_id: module.id,
          },
        },
        update: {
          can_read: true,
          can_edit: true,
        },
        create: {
          role_id: superAdminRole.id,
          module_id: module.id,
          can_read: true,
          can_edit: true,
        },
      });
    }
    console.log('✅ Assigned permissions to Super Admin');

    // 4. Create Subscription Plans
    console.log('Creating subscription plans...');
    for (const plan of PLANS) {
      await platformPrisma.plans.upsert({
        where: { name: plan.name },
        update: {},
        create: { ...plan, is_active: true },
      });
    }
    console.log(`✅ Created ${PLANS.length} subscription plans`);

    // 5. Create Super Admin User
    console.log('Creating super admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await platformPrisma.platform_admins.upsert({
      where: { email: 'admin@logicrays.com' },
      update: {
        role_id: superAdminRole.id,
        is_active: true,
      },
      create: {
        email: 'admin@logicrays.com',
        password: hashedPassword,
        name: 'Super Admin',
        role_id: superAdminRole.id,
        is_active: true,
      },
    });
    console.log('✅ Created super admin user');
    console.log('   Email: admin@logicrays.com');
    console.log('   Password: Admin@123');

    console.log('\n🎉 Platform database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding platform database:', error);
    throw error;
  } finally {
    await platformPrisma.$disconnect();
  }
}

seedPlatform()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
