import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password for the Super Admin user
  const hashedPassword = await bcrypt.hash("superadminpassword", 10);

  // Create the Super Admin user
  const user = await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      password: hashedPassword,
      role: Role.Super_Admin,
      profile: {
        create: {
          firstName: "Super",
          lastName: "Admin",
          contactNumber: "1234567890",
          street: "123 Admin St.",
          city: "Admin City",
          state: "Admin State",
          zipCode: "12345",
          country: "Admin Country",
        },
      },
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
