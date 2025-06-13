import { PrismaClient, Difficulty, Question_type } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import CandidatesService from '../../../services/candidates.services';
import ExamService from '../../../services/exam.services';
const prisma = new PrismaClient();

dotenv.config();

// Define technology IDs (you can generate new UUIDs if needed)
const TECHNOLOGY_IDS = {
  MONGODB: 'e3f1f2a4-6e17-4f6d-9d4a-96df7f6b0f98',
  JAVASCRIPT: 'a7c8f4b3-2d44-4f82-87aa-78b6a6fca0b9',
  PYTHON: '91f0f2d6-d4b7-4f6a-81e7-02928f315cc0',
  JAVA: 'c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
  NODE: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  REACT: 'd3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8g',
  EXPRESS: 'e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8g9h',
};

const mernStackQuestions = [
  // ---------------------- EASY ----------------------
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What does the "M" in MERN stack stand for?',
    correct_answer: ['0'],
    options: ['MongoDB', 'MySQL', 'Mongoose', 'Markdown'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'Which library is used to build UI in the MERN stack?',
    correct_answer: ['0'],
    options: ['React', 'Redux', 'Angular', 'Vue'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'What does Express.js help you build?',
    correct_answer: ['0'],
    options: ['Web servers', 'Databases', 'React apps', 'Browsers'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'Which runtime allows JavaScript to run outside the browser?',
    correct_answer: ['0'],
    options: ['Node.js', 'React', 'MongoDB', 'Express'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What type of database is MongoDB?',
    correct_answer: ['0'],
    options: ['NoSQL', 'SQL', 'Relational', 'GraphQL'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What syntax is used to write HTML in React components?',
    correct_answer: ['0'],
    options: ['JSX', 'XML', 'TSX', 'HTML'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'Which command initializes a Node.js project?',
    correct_answer: ['0'],
    options: ['npm init', 'node start', 'npm install', 'node init'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which command is used to start the MongoDB server?',
    correct_answer: ['0'],
    options: ['mongod', 'mongo-start', 'mongo-run', 'start-mongo'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'Which function defines a GET route in Express.js?',
    correct_answer: ['0'],
    options: ['app.get()', 'get()', 'router()', 'app.route()'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which keyword is used to declare a variable in JavaScript?',
    correct_answer: ['0'],
    options: ['let', 'int', 'define', 'varname'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What does `typeof null` return in JavaScript?',
    correct_answer: ['1'],
    options: ['null', 'object', 'undefined', 'boolean'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'Which hook is used for managing state in functional components?',
    correct_answer: ['0'],
    options: ['useState', 'useEffect', 'useContext', 'useRef'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'How do you parse JSON bodies in Express.js?',
    correct_answer: ['0'],
    options: ['express.json()', 'express.body()', 'express.parser()', 'express.req()'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which of the following is a MongoDB GUI client?',
    correct_answer: ['1'],
    options: ['Mongoose', 'MongoDB Compass', 'Postman', 'Studio 3T'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'Which file is the entry point for most Node.js apps?',
    correct_answer: ['0'],
    options: ['index.js', 'server.js', 'main.js', 'app.js'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },

  // ---------------------- MEDIUM ----------------------
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What does the React useEffect hook do?',
    correct_answer: ['2'],
    options: [
      'Manages component state',
      'Creates new components',
      'Performs side effects in function components',
      'Handles events',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'Which middleware is used for handling CORS in Express?',
    correct_answer: ['1'],
    options: ['body-parser', 'cors', 'helmet', 'morgan'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What does the "process" object in Node.js represent?',
    correct_answer: ['3'],
    options: [
      'File system module',
      'HTTP server',
      'Database connection',
      'Current Node.js process environment',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What does the term "replica set" mean in MongoDB?',
    correct_answer: ['0'],
    options: [
      'A group of MongoDB servers that maintain the same data set',
      'A collection of unrelated databases',
      'A backup of the database',
      'A query operation',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What is the purpose of keys in React lists?',
    correct_answer: ['3'],
    options: [
      'To style the list',
      'To enable event handling',
      'To create new list items',
      'To help React identify which items have changed',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is a closure in JavaScript?',
    correct_answer: ['2'],
    options: [
      'A type of loop',
      'A special object method',
      'A function with access to its outer scope',
      'A variable declaration',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'How do you handle errors in Express middleware?',
    correct_answer: ['1'],
    options: [
      'Using try-catch inside route handlers',
      'By defining error-handling middleware with four arguments',
      'By using async functions',
      'Using the res.send() method',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What does the Mongoose library do?',
    correct_answer: ['1'],
    options: [
      'Creates HTTP servers',
      'Provides an ODM for MongoDB',
      'Manages React state',
      'Compiles JavaScript',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What module is used for file operations in Node.js?',
    correct_answer: ['2'],
    options: ['http', 'net', 'fs', 'path'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What lifecycle method replaces componentDidMount in functional components?',
    correct_answer: ['0'],
    options: ['useEffect', 'useState', 'useReducer', 'useContext'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which method converts JSON to a JavaScript object?',
    correct_answer: ['1'],
    options: ['JSON.stringify()', 'JSON.parse()', 'JSON.objectify()', 'JSON.toJS()'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'Which command installs Express in a Node.js project?',
    correct_answer: ['3'],
    options: [
      'npm express',
      'npm get express',
      'npm install express --save-dev',
      'npm install express',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'How is data stored in MongoDB?',
    correct_answer: ['0'],
    options: ['In BSON documents', 'In tables', 'In XML files', 'In CSV files'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What is npm used for in Node.js projects?',
    correct_answer: ['2'],
    options: [
      'To run Node.js code',
      'To create Node.js apps',
      'To manage packages and dependencies',
      'To debug Node.js code',
    ],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What does Redux primarily manage in a React application?',
    correct_answer: ['1'],
    options: ['Component lifecycle', 'Application state', 'Routing', 'CSS styles'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which keyword is used to create a constant variable?',
    correct_answer: ['0'],
    options: ['const', 'let', 'var', 'static'],
    time: '3',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },

  // ---------------------- HARD ----------------------
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'How does the Node.js event loop handle asynchronous operations?',
    correct_answer: ['1'],
    options: [
      'By creating new threads for each operation',
      'By using a single-threaded event loop and callback queue',
      'By executing operations synchronously',
      'By blocking the main thread',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which aggregation pipeline stage filters documents in MongoDB?',
    correct_answer: ['0'],
    options: ['$match', '$group', '$project', '$sort'],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What is the purpose of React’s useCallback hook?',
    correct_answer: ['2'],
    options: [
      'To memoize component output',
      'To memoize state',
      'To memoize functions to prevent unnecessary re-renders',
      'To create context',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'How can you secure Express apps against common vulnerabilities?',
    correct_answer: ['1'],
    options: [
      'By using express.json()',
      'By using Helmet middleware',
      'By using body-parser',
      'By using cors',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is a Promise in JavaScript?',
    correct_answer: ['0'],
    options: [
      'An object representing eventual completion or failure of an async operation',
      'A function that returns a value',
      'A synchronous operation',
      'A variable type',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What does "callback hell" refer to in Node.js?',
    correct_answer: ['3'],
    options: [
      'A single callback function',
      'An error in a callback',
      'Callbacks executed synchronously',
      'Deeply nested callbacks making code hard to read',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What is sharding in MongoDB?',
    correct_answer: ['1'],
    options: [
      'A backup strategy',
      'Horizontal scaling by distributing data across multiple servers',
      'Data replication',
      'Database clustering',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'How do you optimize React app performance?',
    correct_answer: ['0'],
    options: [
      'Using memoization and code splitting',
      'Increasing component re-renders',
      'Avoiding hooks',
      'Using inline styles extensively',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'How can you handle file uploads in Express?',
    correct_answer: ['3'],
    options: ['Using cors', 'Using helmet', 'Using express.json()', 'Using multer middleware'],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which method is used to debounce a function?',
    correct_answer: ['1'],
    options: ['setTimeout', 'Using a timer to delay execution', 'clearTimeout', 'setInterval'],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What is the purpose of the "cluster" module in Node.js?',
    correct_answer: ['2'],
    options: [
      'File system operations',
      'Creating HTTP servers',
      'Enabling multi-core processing by spawning child processes',
      'Database connection pooling',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which operator is used to update a field in MongoDB?',
    correct_answer: ['3'],
    options: ['$set', '$update', '$change', '$inc'],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.REACT,
    question: 'What is React Fiber?',
    correct_answer: ['1'],
    options: [
      'A UI component library',
      'A reconciliation algorithm for rendering updates efficiently',
      'A type of hook',
      'A state management library',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.EXPRESS,
    question: 'How do you implement session management in Express?',
    correct_answer: ['0'],
    options: [
      'Using express-session middleware',
      'Using passport',
      'Using cookies manually',
      'Using JWT',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is the difference between "==" and "===" in JavaScript?',
    correct_answer: ['2'],
    options: [
      'They are the same',
      '== compares type and value, === compares only value',
      '== compares only value, === compares type and value',
      'They both compare only type',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.NODE,
    question: 'What is event-driven programming in Node.js?',
    correct_answer: ['1'],
    options: [
      'Using loops for events',
      'Using events and listeners to handle asynchronous operations',
      'Programming without events',
      'Blocking the main thread until events complete',
    ],
    time: '4',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

const mongodbQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What is the primary purpose of MongoDB?',
    correct_answer: ['0'],
    options: [
      'Document-based NoSQL database',
      'Relational database',
      'Graph database',
      'Key-value store',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which command is used to create a new database in MongoDB?',
    correct_answer: ['1'],
    options: [
      'create database_name',
      'use database_name',
      'new database_name',
      'db.createDatabase()',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What is a document in MongoDB?',
    correct_answer: ['0'],
    options: [
      'A record in a collection',
      'A table in a database',
      'A field in a record',
      'A database instance',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which of the following is a valid MongoDB data type?',
    correct_answer: ['0'],
    options: ['ObjectId', 'DateTime', 'TimeStamp', 'DateString'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'What is the default port number for MongoDB?',
    correct_answer: ['0'],
    options: ['27017', '3306', '5432', '6379'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which operator is used to update multiple documents in MongoDB?',
    correct_answer: ['0'],
    options: ['updateMany()', 'updateAll()', 'update()', 'modifyMany()'],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's aggregation framework?",
    correct_answer: ['0'],
    options: [
      'To process data records and return computed results',
      'To create database backups',
      'To manage user permissions',
      'To handle database connections',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which index type in MongoDB is used for text search?',
    correct_answer: ['0'],
    options: ['Text Index', 'Hash Index', 'BTree Index', 'Full Text Index'],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $lookup operator?",
    correct_answer: ['0'],
    options: [
      'To perform a left outer join',
      'To create a new collection',
      'To update multiple documents',
      'To delete documents',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which MongoDB feature is used for horizontal scaling?',
    correct_answer: ['0'],
    options: ['Sharding', 'Replication', 'Indexing', 'Aggregation'],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $graphLookup operator?",
    correct_answer: ['0'],
    options: [
      'To perform recursive searches on documents',
      'To create graph visualizations',
      'To perform joins between collections',
      'To update nested documents',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which MongoDB feature is used to ensure data consistency across multiple nodes?',
    correct_answer: ['0'],
    options: ['Write Concern', 'Read Preference', 'Sharding', 'Indexing'],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $facet operator?",
    correct_answer: ['0'],
    options: [
      'To create multi-faceted aggregations',
      'To perform text searches',
      'To create indexes',
      'To update documents',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: 'Which MongoDB feature is used to handle time-series data efficiently?',
    correct_answer: ['0'],
    options: [
      'Time Series Collections',
      'Capped Collections',
      'Sharded Collections',
      'Replicated Collections',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.MONGODB,
    question: "What is the purpose of MongoDB's $redact operator?",
    correct_answer: ['0'],
    options: [
      'To restrict document content based on conditions',
      'To perform data encryption',
      'To create backups',
      'To update documents',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

// JavaScript questions
const javascriptQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is JavaScript primarily used for?',
    correct_answer: ['0'],
    options: [
      'Adding interactivity to web pages',
      'Styling web pages',
      'Creating database schemas',
      'Server configuration',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which keyword is used to declare a variable in JavaScript?',
    correct_answer: ['3'],
    options: ['let', 'var', 'const', 'All of the above'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What does DOM stand for in JavaScript?',
    correct_answer: ['0'],
    options: [
      'Document Object Model',
      'Data Object Model',
      'Display Object Management',
      'Document Order Model',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'Which operator is used for strict equality in JavaScript?',
    correct_answer: ['0'],
    options: ['===', '==', '=', '!=='],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the result of '2' + 2 in JavaScript?",
    correct_answer: ['0'],
    options: ["'22'", '4', 'NaN', 'Error'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is a closure in JavaScript?',
    correct_answer: ['0'],
    options: [
      "A function with access to its outer function's scope",
      'A way to close a program',
      'A method to hide variables',
      'A type of loop',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What does the 'this' keyword refer to in JavaScript?",
    correct_answer: ['0'],
    options: [
      'The object it belongs to',
      'The current function',
      'The parent object',
      'The global object',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the purpose of the 'bind' method in JavaScript?",
    correct_answer: ['0'],
    options: [
      "To create a new function with a specific 'this' value",
      'To bind two objects together',
      'To prevent modification of an object',
      'To bind event listeners',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is a promise in JavaScript?',
    correct_answer: ['0'],
    options: [
      'An object representing the eventual completion of an asynchronous operation',
      'A function that always returns a callback after execution',
      'A reserved keyword used for declaring future variables',
      'A synchronous wrapper for JSON data',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },

  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the purpose of the 'async/await' syntax in JavaScript?",
    correct_answer: ['0'],
    options: [
      'To write asynchronous code that looks synchronous',
      'To declare synchronous functions',
      'To create new threads',
      'To handle synchronous errors',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is the event loop in JavaScript?',
    correct_answer: ['0'],
    options: [
      'The mechanism that handles asynchronous callbacks',
      'A type of for loop',
      'The way events are triggered',
      'A loop that checks for events continuously',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is the Temporal Dead Zone in JavaScript?',
    correct_answer: ['0'],
    options: [
      'The area where variables are inaccessible before declaration',
      'A memory management technique',
      'A period before garbage collection',
      'A phase in the event loop',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: "What is the difference between 'null' and 'undefined' in JavaScript?",
    correct_answer: ['0'],
    options: [
      "'null' is an assigned value representing no value, while 'undefined' means a variable has been declared but not assigned",
      "'undefined' is an assigned value representing no value, while 'null' means a variable has been declared but not assigned",
      'They are identical and can be used interchangeably',
      "'null' is for objects, 'undefined' is for primitives",
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is the purpose of the Symbol data type in JavaScript?',
    correct_answer: ['0'],
    options: [
      "To create unique identifiers that won't collide with other properties",
      'To represent special characters',
      'To create private methods',
      'To handle mathematical symbols',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.JAVASCRIPT,
    question: 'What is a generator function in JavaScript?',
    correct_answer: ['0'],
    options: [
      'A function that can be paused and resumed',
      'A function that generates random numbers',
      'A function that creates other functions',
      'A function that produces HTML',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

// Python questions
const pythonQuestions = [
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is Python primarily used for?',
    correct_answer: ['0'],
    options: [
      'General-purpose programming',
      'Only web development',
      'Only data science',
      'Only game development',
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'Which of the following is the correct way to create a list in Python?',
    correct_answer: ['0'],
    options: [
      'my_list = [1, 2, 3]',
      'my_list = (1, 2, 3)',
      'my_list = {1, 2, 3}',
      "my_list = '1, 2, 3'",
    ],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What is the output of 'Hello' + 'World' in Python?",
    correct_answer: ['0'],
    options: ["'HelloWorld'", "'Hello World'", 'Error', "'Hello' + 'World'"],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'Which keyword is used to define a function in Python?',
    correct_answer: ['0'],
    options: ['def', 'function', 'func', 'define'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is the correct way to start a for loop in Python?',
    correct_answer: ['0'],
    options: ['for x in range(5):', 'for (x = 0; x < 5; x++)', 'for x in 5', 'loop x from 1 to 5'],
    time: '2',
    difficulty_level: Difficulty.easy,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is a lambda function in Python?',
    correct_answer: ['0'],
    options: [
      'An anonymous function defined with the lambda keyword',
      'A function that takes no arguments',
      'A function that returns nothing',
      'A function that can only be used once',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is the purpose of the __init__ method in Python?',
    correct_answer: ['0'],
    options: [
      "To initialize an object's attributes when it's created",
      'To indicate the start of a program',
      'To import modules',
      'To declare class variables',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is the difference between a list and a tuple in Python?',
    correct_answer: ['0'],
    options: [
      'Lists are mutable, tuples are immutable',
      'Tuples are mutable, lists are immutable',
      'Lists can only contain numbers',
      'Tuples can only contain strings',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: "What does the 'with' statement do in Python?",
    correct_answer: ['0'],
    options: [
      'Simplifies exception handling for resources that need to be cleaned up',
      'Creates a new context for variables',
      'Imports all modules in a package',
      'Defines a conditional block',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is a decorator in Python?',
    correct_answer: ['0'],
    options: [
      'A function that takes another function and extends its behavior',
      'A special comment that changes how code runs',
      'A way to format strings',
      'A type of loop',
    ],
    time: '2',
    difficulty_level: Difficulty.medium,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is the Global Interpreter Lock (GIL) in Python?',
    correct_answer: ['0'],
    options: [
      'A mutex that allows only one thread to execute Python bytecode at a time',
      'A security feature that prevents unauthorized code execution',
      'A tool for managing global variables',
      'A lock that prevents multiple processes from running',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is metaclass in Python?',
    correct_answer: ['0'],
    options: [
      'The class of a class that defines how a class behaves',
      'A class that contains other classes',
      "A class that can't be instantiated",
      'A class that only has static methods',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is method resolution order (MRO) in Python?',
    correct_answer: ['0'],
    options: [
      'The order in which Python searches for methods in a hierarchy of classes',
      'The sequence in which methods are called',
      'A way to resolve naming conflicts in modules',
      'The order of parameters in a method',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is the purpose of __slots__ in Python?',
    correct_answer: ['0'],
    options: [
      'To explicitly declare data members and prevent the creation of __dict__',
      'To create read-only attributes',
      'To define slots for method parameters',
      'To reserve memory for future attributes',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
  {
    technology_id: TECHNOLOGY_IDS.PYTHON,
    question: 'What is a descriptor in Python?',
    correct_answer: ['0'],
    options: [
      'An object attribute with binding behavior, accessed via get/set/delete methods',
      'A special comment that describes a function',
      'A way to describe variable types',
      'A tool for documenting code',
    ],
    time: '2',
    difficulty_level: Difficulty.hard,
    type: Question_type.mcq,
    meta: {},
  },
];

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
      },
    });
  }
}

async function createTechnologies() {
  await prisma.technology.createMany({
    data: [
      {
        id: TECHNOLOGY_IDS.MONGODB,
        name: 'MongoDB',
      },
      {
        id: TECHNOLOGY_IDS.JAVASCRIPT,
        name: 'JavaScript',
      },
      {
        id: TECHNOLOGY_IDS.PYTHON,
        name: 'Python',
      },
      {
        id: TECHNOLOGY_IDS.JAVA,
        name: 'Java',
      },
      {
        id: TECHNOLOGY_IDS.NODE,
        name: 'Node.js',
      },
      {
        id: TECHNOLOGY_IDS.REACT,
        name: 'React',
      },
      {
        id: TECHNOLOGY_IDS.EXPRESS,
        name: 'Express',
      },
    ],
    skipDuplicates: true,
  });
}

async function createTestCandidates() {
  // Get superadmin user ID
  const superadmin = await prisma.user.findFirst({
    where: { email: 'alankrit@logicrays.com' },
  });

  if (!superadmin) {
    throw new Error('Superadmin user not found');
  }

  // Create assessments for each candidate
  const assessments = await Promise.all(
    Array.from({ length: 5 }, async (_, i) => {
      const assessment = await prisma.assessments.create({
        data: {
          name: `Test Assessment ${i + 1}`,
          created_by: superadmin.id,
          easy: 5,
          medium: 3,
          hard: 2,
          duration: 60,
        },
      });

      // Assign technology to assessment
      await prisma.assessment_technology.create({
        data: {
          assessment_id: assessment.id,
          technology_id: TECHNOLOGY_IDS.MONGODB,
          easy: 5,
          medium: 3,
          hard: 2,
        },
      });

      return assessment;
    })
  );
  const candidateService = new CandidatesService();
  const examService = new ExamService();
  // Create candidates with their unique assessments
  const candidates = assessments.map(async (assessment, i) => {
    const candiadte = {
      name: `test2_${i + 1}`,
      email: `test${i + 1}@gmail.com`,
      phone: `12345678${i}${i + 2}`,
      technology_id: TECHNOLOGY_IDS.MONGODB,
      experience: '6',
      assessment_id: assessment.id,
      meta: {},
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 10)),
      exam_id: '',
    };
    const newExam = await examService.createExam({
      user_id: superadmin.id,
      assessment_id: candiadte.assessment_id,
      meta: candiadte.meta || {},
      start_time: candiadte.start_date || new Date(),
      // ...existing code...
      end_time: new Date(new Date().setDate(new Date().getDate() + 10)),
      // ...existing code...
    });
    candiadte.exam_id = newExam?.id || '';
    await candidateService.createCandidate(candiadte);
  });

  console.log('Test candidates and their assessments created successfully');
}

const resetDB = async () => {
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
      },
    });
  }

  // Create technologies first, before questions reference them
  await createTechnologies();

  // Then seed questions for all technologies
  await seedQuestions(mongodbQuestions, 'MongoDB');
  await seedQuestions(javascriptQuestions, 'JavaScript');
  await seedQuestions(pythonQuestions, 'Python');
  await seedQuestions(mernStackQuestions, 'MERN');

  // Create test candidates
  await createTestCandidates();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
