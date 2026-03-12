import { PrismaClient } from '../../db/prisma/generated/client';
import { PrismaClient as TenantPrismaClient } from '../../db/tenant/generated/client';
import { TenantService } from './tenant.service';
import { DatabaseUtils } from '../utils/database.utils';
import { encryptStringCrypt } from '../../middlewares/auth.middleware';

export class ProvisioningService {
  private prisma: PrismaClient;
  private tenantService: TenantService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.tenantService = new TenantService(prisma);
  }

  async provisionTenant(data: {
    name: string;
    slug: string;
    plan_id: string;
    admin_email: string;
    admin_name: string;
    admin_password: string;
    trial_days?: number;
    created_by?: string;
  }) {
    let dbName: string | null = null;
    let dbUrl: string | null = null;
    let tenantId: string | null = null;

    try {
      console.log(`[Provisioning] Starting tenant provisioning for slug: ${data.slug}`);

      console.log(`[Provisioning] Step 1: Validating provisioning data`);
      const plan = await this.validateProvisioningData(data);
      console.log(`[Provisioning] Validation passed`);

      // Determine status and dates based on plan
      const isFree = plan.name.toLowerCase() === 'free';
      const status = isFree ? 'trial' : 'active';
      const trialEndsAt = isFree
        ? new Date(Date.now() + (data.trial_days || 30) * 24 * 60 * 60 * 1000)
        : undefined;
      const subscriptionEndsAt = !isFree
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined;

      console.log(`[Provisioning] Plan: ${plan.name}, Status: ${status}`);
      if (trialEndsAt) console.log(`[Provisioning] Trial ends at: ${trialEndsAt.toISOString()}`);
      if (subscriptionEndsAt)
        console.log(`[Provisioning] Subscription ends at: ${subscriptionEndsAt.toISOString()}`);

      console.log(`[Provisioning] Step 2: Generating database name and URL`);
      dbName = DatabaseUtils.generateDbName(data.slug);
      dbUrl = DatabaseUtils.generateDbUrl(dbName);
      console.log(`[Provisioning] DB Name: ${dbName}, DB URL: ${dbUrl}`);

      console.log(`[Provisioning] Step 3: Creating database`);
      await DatabaseUtils.createDatabase(dbName);
      console.log(`[Provisioning] Database created successfully`);

      console.log(`[Provisioning] Step 4: Running migrations`);
      await DatabaseUtils.runMigrations(dbUrl);
      console.log(`[Provisioning] Migrations completed`);

      console.log(`[Provisioning] Step 5: Testing database connection`);
      const isConnected = await DatabaseUtils.testConnection(dbUrl);
      if (!isConnected) {
        throw new Error('Failed to connect to tenant database');
      }
      console.log(`[Provisioning] Connection test passed`);

      console.log(`[Provisioning] Step 6: Seeding tenant defaults`);
      await this.seedTenantDefaults(dbUrl, {
        email: data.admin_email,
        name: data.admin_name,
        password: data.admin_password,
      });
      console.log(`[Provisioning] Seeding completed`);

      console.log(`[Provisioning] Step 7: Creating tenant record in platform DB`);
      const tenant = await this.tenantService.createTenant({
        name: data.name,
        slug: data.slug,
        plan_id: data.plan_id,
        db_name: dbName,
        db_url: dbUrl,
        admin_email: data.admin_email,
        admin_name: data.admin_name,
        status,
        trial_ends_at: trialEndsAt,
        subscription_ends_at: subscriptionEndsAt,
        created_by: data.created_by,
      });
      console.log(`[Provisioning] Tenant record created with ID: ${tenant.id}`);

      tenantId = tenant.id;

      console.log(`[Provisioning] Step 8: Initializing usage tracking`);
      await this.initializeUsage(tenant.id, data.plan_id);
      console.log(`[Provisioning] Usage tracking initialized`);

      console.log(`[Provisioning] ✅ Provisioning completed successfully for ${data.slug}`);

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          subdomain: `${tenant.slug}.lr-mcq.com`,
        },
        admin: {
          email: data.admin_email,
          password: data.admin_password,
          loginUrl: `https://${tenant.slug}.lr-mcq.com/login`,
        },
        database: {
          name: dbName,
          url: dbUrl,
        },
      };
    } catch (error: any) {
      console.error(`[Provisioning] ❌ Error during provisioning:`, error.message);
      console.log(`[Provisioning] Starting rollback...`);
      await this.rollbackProvisioning(tenantId, dbName);
      console.log(`[Provisioning] Rollback completed`);
      throw error;
    }
  }

  private async validateProvisioningData(data: {
    slug: string;
    plan_id: string;
    admin_email: string;
  }) {
    const existingTenant = await this.tenantService.findTenantBySlug(data.slug);
    if (existingTenant) {
      throw new Error('Tenant with this slug already exists');
    }

    const plan = await this.prisma.plans.findUnique({
      where: { id: data.plan_id },
    });
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.is_active) {
      throw new Error('Selected plan is not active');
    }

    return plan;
  }

  private async seedTenantDefaults(
    dbUrl: string,
    adminData: { email: string; name: string; password: string }
  ) {
    console.log(`[Seeding] Starting tenant seeding`);
    const tenantPrisma = new TenantPrismaClient({
      datasources: { db: { url: dbUrl } },
    });

    try {
      console.log(`[Seeding] Connecting to tenant database`);
      await tenantPrisma.$connect();
      console.log(`[Seeding] Connected successfully`);

      console.log(`[Seeding] Hashing admin password`);
      const hashedPassword = await encryptStringCrypt(adminData.password);
      console.log(`[Seeding] Password hashed`);

      console.log(`[Seeding] Creating Super Admin role`);
      const role = await tenantPrisma.roles.create({
        data: { name: 'Super Admin' },
      });
      console.log(`[Seeding] Role created with ID: ${role.id}`);

      const moduleNames = ['candidates', 'questions', 'assessments', 'users', 'results'];
      console.log(`[Seeding] Creating ${moduleNames.length} modules and permissions`);
      for (const name of moduleNames) {
        const module = await tenantPrisma.modules.create({ data: { name } });
        await tenantPrisma.role_permissions.create({
          data: {
            role_id: role.id,
            module_id: module.id,
            can_edit: true,
            can_read: true,
          },
        });
        console.log(`[Seeding] Created module: ${name}`);
      }

      console.log(`[Seeding] Creating admin user`);
      await tenantPrisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          role_id: role.id,
          name: adminData.name,
        },
      });
      console.log(`[Seeding] Admin user created: ${adminData.email}`);

      console.log(`[Seeding] Disconnecting from tenant database`);
      await tenantPrisma.$disconnect();
      console.log(`[Seeding] ✅ Seeding completed successfully`);
    } catch (error: any) {
      console.error(`[Seeding] ❌ Error during seeding:`, error.message);
      await tenantPrisma.$disconnect();
      throw new Error(`Failed to seed tenant defaults: ${error.message}`);
    }
  }

  private async initializeUsage(tenantId: string, planId: string) {
    const plan = await this.prisma.plans.findUnique({
      where: { id: planId },
    });

    if (!plan) return;

    const limits = plan.limits as any;
    const usageMetrics = [
      { metric_type: 'candidates', limit: limits?.candidates || -1 },
      { metric_type: 'assessments', limit: limits?.assessments || -1 },
      { metric_type: 'questions', limit: limits?.questions || -1 },
    ];

    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const metric of usageMetrics) {
      await this.prisma.tenant_usage.create({
        data: {
          tenant_id: tenantId,
          metric_type: metric.metric_type as any,
          current_value: 0,
          limit_value: metric.limit,
          period_start: now,
          period_end: periodEnd,
        },
      });
    }
  }

  private async rollbackProvisioning(tenantId: string | null, dbName: string | null) {
    console.log(`[Rollback] Starting rollback process`);
    try {
      if (tenantId) {
        console.log(`[Rollback] Deleting tenant record: ${tenantId}`);
        await this.prisma.tenants.delete({ where: { id: tenantId } }).catch(() => {});
        console.log(`[Rollback] Deleting usage records for tenant: ${tenantId}`);
        await this.prisma.tenant_usage
          .deleteMany({ where: { tenant_id: tenantId } })
          .catch(() => {});
      }

      if (dbName) {
        console.log(`[Rollback] Dropping database: ${dbName}`);
        await DatabaseUtils.dropDatabase(dbName).catch(() => {});
      }
      console.log(`[Rollback] ✅ Rollback completed`);
    } catch (error) {
      console.error(`[Rollback] ❌ Error during rollback:`, error);
    }
  }
}
