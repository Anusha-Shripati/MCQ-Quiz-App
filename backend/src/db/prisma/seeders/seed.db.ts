import { PrismaClient, Difficulty, Question_type } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
const prisma = new PrismaClient();

dotenv.config();

// Define technology IDs (you can generate new UUIDs if needed)
const TECHNOLOGY_IDS = {
  MONGODB: "e3f1f2a4-6e17-4f6d-9d4a-96df7f6b0f98",
  JAVASCRIPT: "a7c8f4b3-2d44-4f82-87aa-78b6a6fca0b9",
  PYTHON: "91f0f2d6-d4b7-4f6a-81e7-02928f315cc0",
};

const mongodbQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the primary purpose of MongoDB?",
    correct_answer: ["Document-based NoSQL database"],
    options: ["Document-based NoSQL database", "Relational database", "Graph database", "Key-value store"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which command is used to create a new database in MongoDB?",
    correct_answer: ["use database_name"],
    options: ["create database_name", "use database_name", "new database_name", "db.createDatabase()"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is a document in MongoDB?",
    correct_answer: ["A record in a collection"],
    options: ["A record in a collection", "A table in a database", "A field in a record", "A database instance"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which of the following is a valid MongoDB data type?",
    correct_answer: ["ObjectId"],
    options: ["ObjectId", "DateTime", "TimeStamp", "DateString"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the default port number for MongoDB?",
    correct_answer: ["27017"],
    options: ["27017", "3306", "5432", "6379"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which operator is used to update multiple documents in MongoDB?",
    correct_answer: ["updateMany()"],
    options: ["updateMany()", "updateAll()", "update()", "modifyMany()"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's aggregation framework?",
    correct_answer: ["To process data records and return computed results"],
    options: ["To process data records and return computed results", "To create database backups", "To manage user permissions", "To handle database connections"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which index type in MongoDB is used for text search?",
    correct_answer: ["Text Index"],
    options: ["Text Index", "Hash Index", "BTree Index", "Full Text Index"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $lookup operator?",
    correct_answer: ["To perform a left outer join"],
    options: ["To perform a left outer join", "To create a new collection", "To update multiple documents", "To delete documents"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which MongoDB feature is used for horizontal scaling?",
    correct_answer: ["Sharding"],
    options: ["Sharding", "Replication", "Indexing", "Aggregation"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $graphLookup operator?",
    correct_answer: ["To perform recursive searches on documents"],
    options: ["To perform recursive searches on documents", "To create graph visualizations", "To perform joins between collections", "To update nested documents"],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which MongoDB feature is used to ensure data consistency across multiple nodes?",
    correct_answer: ["Write Concern"],
    options: ["Write Concern", "Read Preference", "Sharding", "Indexing"],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $facet operator?",
    correct_answer: ["To create multi-faceted aggregations"],
    options: ["To create multi-faceted aggregations", "To perform text searches", "To create indexes", "To update documents"],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "Which MongoDB feature is used to handle time-series data efficiently?",
    correct_answer: ["Time Series Collections"],
    options: ["Time Series Collections", "Capped Collections", "Sharded Collections", "Replicated Collections"],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $redact operator?",
    correct_answer: ["To restrict document content based on conditions"],
    options: ["To restrict document content based on conditions", "To perform data encryption", "To create backups", "To update documents"],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];


// JavaScript questions
const javascriptQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is JavaScript primarily used for?",
    correct_answer: ["Adding interactivity to web pages"],
    options: ["Adding interactivity to web pages", "Styling web pages", "Creating database schemas", "Server configuration"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "Which keyword is used to declare a variable in JavaScript?",
    correct_answer: ["let"],
    options: ["let", "var", "const", "All of the above"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What does DOM stand for in JavaScript?",
    correct_answer: ["Document Object Model"],
    options: ["Document Object Model", "Data Object Model", "Display Object Management", "Document Order Model"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "Which operator is used for strict equality in JavaScript?",
    correct_answer: ["==="],
    options: ["===", "==", "=", "!=="],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the result of '2' + 2 in JavaScript?",
    correct_answer: ["'22'"],
    options: ["'22'", "4", "NaN", "Error"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is a closure in JavaScript?",
    correct_answer: ["A function with access to its outer function's scope"],
    options: ["A function with access to its outer function's scope", "A way to close a program", "A method to hide variables", "A type of loop"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What does the 'this' keyword refer to in JavaScript?",
    correct_answer: ["The object it belongs to"],
    options: ["The object it belongs to", "The current function", "The parent object", "The global object"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the purpose of the 'bind' method in JavaScript?",
    correct_answer: ["To create a new function with a specific 'this' value"],
    options: ["To create a new function with a specific 'this' value", "To bind two objects together", "To prevent modification of an object", "To bind event listeners"],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {}
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is a promise in JavaScript?",
    correct_answer: ["An object representing the eventual completion of an asynchronous operation"],
    options: [
      "To create a new function with a specific 'this' value",
      "To bind two objects together",
      "To prevent modification of an object",
      "To bind event listeners",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is a promise in JavaScript?",
    correct_answer:
      ["An object representing the eventual completion of an asynchronous operation"],
    options: [
      "An object representing the eventual completion of an asynchronous operation",
      "A type of variable",
      "A conditional statement",
      "A function declaration",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the purpose of the 'async/await' syntax in JavaScript?",
    correct_answer: ["To write asynchronous code that looks synchronous"],
    options: [
      "To write asynchronous code that looks synchronous",
      "To declare synchronous functions",
      "To create new threads",
      "To handle synchronous errors",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the event loop in JavaScript?",
    correct_answer: ["The mechanism that handles asynchronous callbacks"],
    options: [
      "The mechanism that handles asynchronous callbacks",
      "A type of for loop",
      "The way events are triggered",
      "A loop that checks for events continuously",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the Temporal Dead Zone in JavaScript?",
    correct_answer: ["The area where variables are inaccessible before declaration"],
    options: [
      "The area where variables are inaccessible before declaration",
      "A memory management technique",
      "A period before garbage collection",
      "A phase in the event loop",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the difference between 'null' and 'undefined' in JavaScript?",
    correct_answer: ["'null' is an assigned value representing no value, while 'undefined' means a variable has been declared but not assigned"],
    options: [
      "'null' is an assigned value representing no value, while 'undefined' means a variable has been declared but not assigned",
      "'undefined' is an assigned value representing no value, while 'null' means a variable has been declared but not assigned",
      "They are identical and can be used interchangeably",
      "'null' is for objects, 'undefined' is for primitives",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the purpose of the Symbol data type in JavaScript?",
    correct_answer: ["To create unique identifiers that won't collide with other properties"],
    options: [
      "To create unique identifiers that won't collide with other properties",
      "To represent special characters",
      "To create private methods",
      "To handle mathematical symbols",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is a generator function in JavaScript?",
    correct_answer: ["A function that can be paused and resumed"],
    options: [
      "A function that can be paused and resumed",
      "A function that generates random numbers",
      "A function that creates other functions",
      "A function that produces HTML",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

// Python questions
const pythonQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is Python primarily used for?",
    correct_answer: ["General-purpose programming"],
    options: ["General-purpose programming", "Only web development", "Only data science", "Only game development"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "Which of the following is the correct way to create a list in Python?",
    correct_answer: ["my_list = [1, 2, 3]"],
    options: ["my_list = [1, 2, 3]", "my_list = (1, 2, 3)", "my_list = {1, 2, 3}", "my_list = '1, 2, 3'"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the output of 'Hello' + 'World' in Python?",
    correct_answer: ["'HelloWorld'"],
    options: ["'HelloWorld'", "'Hello World'", "Error", "'Hello' + 'World'"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "Which keyword is used to define a function in Python?",
    correct_answer: ["def"],
    options: ["def", "function", "func", "define"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the correct way to start a for loop in Python?",
    correct_answer: ["for x in range(5):"],
    options: ["for x in range(5):", "for (x = 0; x < 5; x++)", "for x in 5", "loop x from 1 to 5"],
    time: "2",
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is a lambda function in Python?",
    correct_answer: ["An anonymous function defined with the lambda keyword"],
    options: [
      "An anonymous function defined with the lambda keyword",
      "A function that takes no arguments",
      "A function that returns nothing",
      "A function that can only be used once",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the purpose of the __init__ method in Python?",
    correct_answer: ["To initialize an object's attributes when it's created"],
    options: [
      "To initialize an object's attributes when it's created",
      "To indicate the start of a program",
      "To import modules",
      "To declare class variables",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the difference between a list and a tuple in Python?",
    correct_answer: ["Lists are mutable, tuples are immutable"],
    options: [
      "Lists are mutable, tuples are immutable",
      "Tuples are mutable, lists are immutable",
      "Lists can only contain numbers",
      "Tuples can only contain strings",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What does the 'with' statement do in Python?",
    correct_answer: ["Simplifies exception handling for resources that need to be cleaned up"],
    options: [
      "Simplifies exception handling for resources that need to be cleaned up",
      "Creates a new context for variables",
      "Imports all modules in a package",
      "Defines a conditional block",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is a decorator in Python?",
    correct_answer: ["A function that takes another function and extends its behavior"],
    options: [
      "A function that takes another function and extends its behavior",
      "A special comment that changes how code runs",
      "A way to format strings",
      "A type of loop",
    ],
    time: "2",
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the Global Interpreter Lock (GIL) in Python?",
    correct_answer: ["A mutex that allows only one thread to execute Python bytecode at a time"],
    options: [
      "A mutex that allows only one thread to execute Python bytecode at a time",
      "A security feature that prevents unauthorized code execution",
      "A tool for managing global variables",
      "A lock that prevents multiple processes from running",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is metaclass in Python?",
    correct_answer: ["The class of a class that defines how a class behaves"],
    options: [
      "The class of a class that defines how a class behaves",
      "A class that contains other classes",
      "A class that can't be instantiated",
      "A class that only has static methods",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is method resolution order (MRO) in Python?",
    correct_answer: ["The order in which Python searches for methods in a hierarchy of classes"],
    options: [
      "The order in which Python searches for methods in a hierarchy of classes",
      "The sequence in which methods are called",
      "A way to resolve naming conflicts in modules",
      "The order of parameters in a method",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the purpose of __slots__ in Python?",
    correct_answer: ["To explicitly declare data members and prevent the creation of __dict__"],
    options: [
      "To explicitly declare data members and prevent the creation of __dict__",
      "To create read-only attributes",
      "To define slots for method parameters",
      "To reserve memory for future attributes",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is a descriptor in Python?",
    correct_answer: ["An object attribute with binding behavior, accessed via get/set/delete methods"],
    options: [
      "An object attribute with binding behavior, accessed via get/set/delete methods",
      "A special comment that describes a function",
      "A way to describe variable types",
      "A tool for documenting code",
    ],
    time: "2",
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

async function seedQuestions(questions: any[], technologyName: string) {
  console.log(`Seeding ${technologyName} questions...`);
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
      },
    });
  }
  console.log(`${technologyName} questions seeded successfully`);
}

async function createTechnologies() {
  console.log("Creating technologies...");

  await prisma.technology.createMany({
    data: [
      {
        id: TECHNOLOGY_IDS.MONGODB,
        name: "MongoDB",
      },
      {
        id: TECHNOLOGY_IDS.JAVASCRIPT,
        name: "JavaScript",
      },
      {
        id: TECHNOLOGY_IDS.PYTHON,
        name: "Python",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Technologies created successfully");
}

// async function createTestCandidates() {
//   console.log("Creating test candidates...");

//   // Get superadmin user ID
//   const superadmin = await prisma.user.findFirst({
//     where: { email: "superadmin@example.com" },
//   });

//   if (!superadmin) {
//     throw new Error("Superadmin user not found");
//   }

//   // Create assessments for each candidate
//   const assessments = await Promise.all(
//     Array.from({ length: 30 }, async (_, i) => {
//       const assessment = await prisma.assessments.create({
//         data: {
//           name: `Test Assessment ${i + 1}`,
//           created_by: superadmin.id,
//           easy: 5,
//           medium: 3,
//           hard: 2,
//           duration: 60,
//         },
//       });

//       // Assign technology to assessment
//       await prisma.assessment_technology.create({
//         data: {
//           assessment_id: assessment.id,
//           technology_id: TECHNOLOGY_IDS.MONGODB,
//           easy: 5,
//           medium: 3,
//           hard: 2,
//         },
//       });

//       return assessment;
//     })
//   );

//   // Create candidates with their unique assessments
//   // const candidates = assessments.map((assessment, i) => ({
//   //   name: `test2_${i + 1}`,
//   //   email: `test${i + 1}@gmail.com`,
//   //   phone: `12345678${i}${i + 2}`,
//   //   technology_id: TECHNOLOGY_IDS.MONGODB,
//   //   experience: "6",
//   //   assessment_id: assessment.id,
//   // }));

//   // await prisma.candidate.createMany({
//   //   data: candidates,
//   //   skipDuplicates: true,
//   // });

//   console.log("Test candidates and their assessments created successfully");
// }

const resetDB = async ()=>{
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
}

async function main() {
  await resetDB();

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || "superadminpassword",
    10
  );

  // Check if role exists, if not create it
  let role = await prisma.roles.findFirst({
    where: { name: "Super Admin" },
  });

  if (!role) {
    role = await prisma.roles.create({
      data: {
        name: "Super Admin",
      },
    });
  }

  // Check if modules exist, if not create them
  const moduleNames = ["candidates", "questions", "assessments", "users"];
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
    where: { email: "superadmin@example.com" },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: "superadmin@example.com",
        password: hashedPassword,
        role_id: role.id,
        name: "Super Admin",
      },
    });
  }

  // Create technologies
  await createTechnologies();

  // Seed questions for all technologies
  await seedQuestions(mongodbQuestions, "MongoDB");
  await seedQuestions(javascriptQuestions, "JavaScript");
  await seedQuestions(pythonQuestions, "Python");

  // Create test candidates
  // await createTestCandidates();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });