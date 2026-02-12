import { PrismaClient } from '../generated/client';
import { Difficulty, Question_type } from '../generated/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
const prisma = new PrismaClient();

dotenv.config();

// Define technology IDs (you can generate new UUIDs if needed)
const TECHNOLOGY_IDS = {
  MAGENTO: 'b76c519e-1f96-4d41-bbb6-157265597b27',
  SHOPIFY: '2a32e021-b2d7-4290-9213-7adf7b1eb7fc',
  AI_ML: 'd8a43f1e-05fa-4f44-9257-50db7638587c',
  PYTHON: 'e4950bb5-d11c-4305-b6f5-58c2e06cf370',
  LARAVEL: '4ce6151c-0541-4a6c-8267-b0b9cf6ce396',
  FLUTTER: '51755c31-60f8-4bc8-9332-9e3fc87f9fc2',
  MERN_STACK: 'c117d189-601a-4211-99d1-c2f4150e8b53',
  WORDPRESS: '6f7f5c59-828c-4e61-8b1e-1c88bdf4e9ce',
  PHP: 'c9e93ff8-3981-4e57-9f27-29691a635e1f',
  IOS: '8806de74-05ff-4dd6-906e-eaf26c11969e',
  REACT_NATIVE: '9402e1f9-59d3-4c8b-a9f5-1e117857f143',
  ANDROID: '8fc89b1a-0664-4e76-91f1-8638a71c71b0',
  JAVASCRIPT: 'b35e30a6-3e70-43e7-8c34-558fe5d1b369',
  MEAN_STACK: 'a9346e69-882f-49b4-a00e-3518f4eb4ea1',
  DEVOPS: 'bd0a5e7e-e493-4f8c-9b93-43db5fdd20e3',
  REACT: '7e83a6e1-7ff2-4478-88e5-ecf46f614e91',
  NODE: 'fcde8417-d0e2-4729-b1be-4010637dffad',
  EXPRESS: '20519de6-3a7f-4a34-949e-c442bff2a32f',
  MONGODB: 'c2043e56-60f3-46a1-86a6-e88e82e1fd8b',
  ANGULAR: 'ac1f7eb6-74aa-4ae3-8f38-871aa7fa1431',
  VUE: 'f1c8b2d3-4e5a-4c6b-9f0d-7e8f9b1c2d3e',
  NEXTJS: 'd1e8f1c2-4e5a-4c6b-9f0d-7e8f9b1c2d3e',
};

async function seedQuestions(questions: any[], technologyName: string) {
  for (const question of questions) {
    await prisma.questions.create({
      data: {
        technology_id: question.technology_id,
        question: question.question,
        correct_answer: question.correct_answer,
        options: question.options,
        time: question.time,
        difficulty_level: question.difficulty_level,
        type: question.type,
        meta: question.meta,
        created_by:""
      },
    });
  }
}

async function createTechnologies() {
  await prisma.technology.createMany({
    data: [
      { id: TECHNOLOGY_IDS.MAGENTO, name: 'Magento' },
      { id: TECHNOLOGY_IDS.SHOPIFY, name: 'Shopify' },
      { id: TECHNOLOGY_IDS.AI_ML, name: 'AI/ML' },
      { id: TECHNOLOGY_IDS.PYTHON, name: 'Python' },
      { id: TECHNOLOGY_IDS.LARAVEL, name: 'Laravel' },
      { id: TECHNOLOGY_IDS.FLUTTER, name: 'Flutter' },
      { id: TECHNOLOGY_IDS.MERN_STACK, name: 'MERN Stack' },
      { id: TECHNOLOGY_IDS.WORDPRESS, name: 'Wordpress' },
      { id: TECHNOLOGY_IDS.PHP, name: 'PHP' },
      { id: TECHNOLOGY_IDS.IOS, name: 'iOS' },
      { id: TECHNOLOGY_IDS.REACT_NATIVE, name: 'React Native' },
      { id: TECHNOLOGY_IDS.ANDROID, name: 'Android' },
      { id: TECHNOLOGY_IDS.JAVASCRIPT, name: 'JavaScript' },
      { id: TECHNOLOGY_IDS.MEAN_STACK, name: 'MEAN Stack' },
      { id: TECHNOLOGY_IDS.DEVOPS, name: 'Dev ops' },
      { id: TECHNOLOGY_IDS.MONGODB, name: 'MongoDB' },
      { id: TECHNOLOGY_IDS.EXPRESS, name: 'Express' },
      { id: TECHNOLOGY_IDS.REACT, name: 'React' },
      { id: TECHNOLOGY_IDS.NODE, name: 'Node.js' },
      { id: TECHNOLOGY_IDS.ANGULAR, name: 'Angular' },
      { id: TECHNOLOGY_IDS.VUE, name: 'Vue.js' },
      { id: TECHNOLOGY_IDS.NEXTJS, name: 'Next.js' },
    ],
    skipDuplicates: true,
  });
}


const resetDB = async () => {
  try {
    // Check if tables exist before truncating
    const tableCheck: any = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Answers';
    `;
    
    // Only truncate if tables exist
    if (tableCheck && tableCheck[0]?.count > 0) {
      await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE 
          "Answers",
          "Results",
          "Exam_questions",
          "Exam",
          "Candidate",
          "Questions",
          "Assessment_technology",
          "Assessments",
          "Technology",
          "Role_permissions",
          "Modules",
          "users",
          "Roles"
        CASCADE;
      `);
      console.log('✓ Database tables truncated');
    } else {
      console.log('⚠ Tables do not exist yet. Run migrations first: npx prisma migrate deploy');
    }
  } catch (error) {
    console.log('⚠ Could not truncate tables. They may not exist yet. Continuing with seeding...');
  }
};

async function main() {
  await resetDB();

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'superadminpassword',
    10
  );

  // Check if role exists, if not create it
  let role = await prisma.roles.findFirst({
    where: { name: 'Super Admin' },
  });

  if (!role) {
    role = await prisma.roles.create({
      data: {
        name: 'Super Admin',
      },
    });
  }

  // Check if modules exist, if not create them
  const moduleNames = ['candidates', 'questions', 'assessments', 'users', 'results'];
  for (const name of moduleNames) {
    const existingModule = await prisma.modules.findFirst({
      where: { name },
    });

    if (!existingModule) {
      const module = await prisma.modules.create({ data: { name } });
      await prisma.role_permissions.create({
        data: {
          role_id: role.id,
          module_id: module.id,
          can_edit: true,
          can_read: true,
        },
      });
    }
  }

  // Check if user exists, if not create it
  const existingUser = await prisma.user.findFirst({
    where: { email: 'alankrit@logicrays.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'alankrit@logicrays.com',
        password: hashedPassword,
        role_id: role.id,
        name: 'Super Admin',
        // created_by:""
      },
    });
  }

  // Create technologies first, before questions reference them
  await createTechnologies();
  console.log('\n🎉 Tenant database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
