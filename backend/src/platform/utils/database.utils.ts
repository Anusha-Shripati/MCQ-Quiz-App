import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient as TenantPrismaClient } from '../../db/tenant/generated/client';

const execAsync = promisify(exec);

export class DatabaseUtils {
  static async createDatabase(dbName: string): Promise<void> {
    console.log(`[DB Utils] Creating database: ${dbName}`);
    const command = `docker exec -e PGPASSWORD=root postgres-container psql -U postgres -c "CREATE DATABASE ${dbName};"`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      console.log(`[DB Utils] Database created successfully: ${dbName}`);
      if (stdout) console.log(`[DB Utils] stdout:`, stdout);
      if (stderr) console.log(`[DB Utils] stderr:`, stderr);
    } catch (error: any) {
      console.error(`[DB Utils] Failed to create database: ${error.message}`);
      if (error.message.includes('already exists')) {
        throw new Error(`Database ${dbName} already exists`);
      }
      throw new Error(`Failed to create database: ${error.message}`);
    }
  }

  static async dropDatabase(dbName: string): Promise<void> {
    console.log(`[DB Utils] Dropping database: ${dbName}`);
    const command = `docker exec -e PGPASSWORD=root postgres-container psql -U postgres -c "DROP DATABASE IF EXISTS ${dbName};"`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      console.log(`[DB Utils] Database dropped: ${dbName}`);
      if (stdout) console.log(`[DB Utils] stdout:`, stdout);
      if (stderr) console.log(`[DB Utils] stderr:`, stderr);
    } catch (error: any) {
      console.error(`[DB Utils] Failed to drop database: ${error.message}`);
      throw new Error(`Failed to drop database: ${error.message}`);
    }
  }

  static async testConnection(dbUrl: string): Promise<boolean> {
    console.log(`[DB Utils] Testing connection to database`);
    const prisma = new TenantPrismaClient({
      datasources: { db: { url: dbUrl } },
    });

    try {
      await prisma.$connect();
      await prisma.$disconnect();
      console.log(`[DB Utils] Connection test successful`);
      return true;
    } catch (error: any) {
      console.error(`[DB Utils] Connection test failed:`, error.message);
      return false;
    }
  }

  static async runMigrations(dbUrl: string): Promise<void> {
    console.log(`[DB Utils] Running migrations for database`);
    console.log(`[DB Utils] Database URL: ${dbUrl}`);
    
    const command = `npx prisma migrate deploy --schema=./src/db/tenant/schema.prisma`;
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        env: { ...process.env, TENANT_DB_URL: dbUrl },
        shell: '/bin/bash'
      });
      
      console.log(`[DB Utils] Migrations completed successfully`);
      console.log(`[DB Utils] Migration output:`, stdout);
      if (stderr) console.log(`[DB Utils] Migration stderr:`, stderr);
    } catch (error: any) {
      console.error(`[DB Utils] Migration failed:`, error.message);
      console.error(`[DB Utils] Error stdout:`, error.stdout);
      console.error(`[DB Utils] Error stderr:`, error.stderr);
      throw new Error(`Failed to run migrations: ${error.message}`);
    }
  }

  static generateDbUrl(dbName: string): string {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'root';
    
    const url = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
    console.log(`[DB Utils] Generated DB URL for ${dbName}`);
    return url;
  }

  static generateDbName(slug: string): string {
    const sanitizedSlug = slug.replace(/-/g, '_');
    const dbName = `tenant_${sanitizedSlug}_db`;
    console.log(`[DB Utils] Generated DB name: ${dbName}`);
    return dbName;
  }
}
