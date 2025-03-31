import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
const prisma = new PrismaClient();

dotenv.config()
async function main() {
  // Hash the password for the Super Admin user
  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'superadminpassword', 10);

  const role = await prisma.roles.create({
    data: {
      name: "Super Admin",
    },
  });

  ["candidates", "questions", "assessments","users"].map(async (name) => {
    const module = await prisma.modules.create({ data: { name } })
    const Roles_Permissions = await prisma.roles_Permissions.create({data:{role_id:role.id,module_id:module.id,can_edit:true,can_read:true}})
  })

  const user = await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      password: hashedPassword,
      role_id: role.id,
    },
  });
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
