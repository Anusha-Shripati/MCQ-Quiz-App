import { Result } from '../common/types/types';

export const getDateBoundaries = (now: Date = new Date()) => {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  return {
    startOfToday,
    endOfToday,
    startOfLastMonth,
    endOfLastMonth,
  };
};

export const categorizeExamDate = (
  examDate: Date,
  boundaries: ReturnType<typeof getDateBoundaries>
) => {
  const { startOfToday, endOfToday, startOfLastMonth, endOfLastMonth } = boundaries;

  if (examDate >= startOfLastMonth && examDate <= endOfLastMonth) {
    return 'lastMonth';
  } else if (examDate >= startOfToday && examDate <= endOfToday) {
    return 'today';
  } else if (examDate > endOfToday) {
    return 'upcoming';
  }

  return null;
};

export const formatToISTDate = (dateString: string | Date): string => {
  const utcDate = new Date(dateString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  const day = istDate.getDate().toString().padStart(2, '0');
  const month = istDate.toLocaleString('en-US', { month: 'short' });
  const year = istDate.getFullYear();

  return `${day} ${month}-${year}`;
};

export const convertToISTISOString = (utcDate: Date): string => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + IST_OFFSET_MS);
  return istDate.toISOString();
};

export const formatInterviewResults = (results: Result[]) => {
  return results.map((result) => {
    const scoreValue = Number(result.percentage);
    const techNames = result.exam.assessment.technologies.map((t) => t.technology.name).join(', ');
    const passCriteria = result.exam.assessment.pass_criteria;

    return {
      id: result.id,
      date: formatToISTDate(result.exam.start_time),
      name: result.candidate.name,
      email: result.candidate.email,
      score: `${scoreValue.toFixed(2)}%`,
      scoreValue,
      assessmentName: result.exam.assessment.name,
      technologies: techNames,
      pass_criteria: passCriteria,
    };
  });
};

// Helper function for generating month arrays
export const generateLast7Months = (now: Date = new Date()) => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: monthNames[date.getMonth()],
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  });
};
export const sampleData = [
  {
    question: 'What does the "M" in MERN stack stand for?',
    correct_answer: '0', // Index of the correct answer in options
    options: 'MongoDB,MySQL,Mongoose,Markdown', // Comma-separated options
    difficulty_level: 'easy', // easy, medium, or hard
    type: 'mcq', // mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq
  },
  {
    question: 'Which hook is used for side effects in React?',
    correct_answer: '1',
    options: 'useState,useEffect,useContext,useReducer',
    difficulty_level: 'medium',
    type: 'mcq', // mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq
  },
  {
    question: 'What is the package manager for Node.js?',
    correct_answer: '0',
    options: 'npm,yarn,pnpm,bower',
    difficulty_level: 'Hard',
    type: 'mcq', // mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq
  },
  {
    question: 'Which of the following are JavaScript frameworks?',
    correct_answer: '0,2', // multiple correct: React, Vue
    options: 'React,PHP,Vue,Laravel',
    difficulty_level: 'Medium',
    type: 'multiple_select',
  },
  {
    question: '____ invented JavaScript.',
    correct_answer: 'Brendan Eich',
    options: '',
    difficulty_level: 'Easy',
    type: 'text',
  },
];

export const docData = [
  { field: 'Field', description: 'Description', example: 'Example' },
  {
    field: 'technology_name',
    description: 'Name of the technology (case insensitive)',
    example: 'JAVASCRIPT, REACT, NODE',
  },
  { field: 'question', description: 'The question text', example: 'What does DOM stand for?' },
  {
    field: 'correct_answer',
    description:
      'Index of correct option(s), starting from 0 or may be text for text question type',
    example: '0 (for single answer), 0,1 (for multiple), dog',
  },
  {
    field: 'options',
    description: 'Comma separated list of options',
    example: 'Option1,Option2,Option3,Option4 (For text, options will be empty)',
  },
  {
    field: 'difficulty_level',
    description: 'Level of difficulty',
    example: 'easy, medium, hard',
  },
  {
    field: 'type',
    description: 'Type of question',
    example: 'mcq, multiple_select, text',
  },
];

export const allTechnologiesWorldwide = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Kotlin',
  'Swift',
  'Scala',
  'Perl',
  'R',
  'Dart',

  // Frontend Technologies
  'HTML',
  'CSS',
  'SASS',
  'SCSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Nextjs',
  'Vuejs',
  'Nuxtjs',
  'Angular',
  'Svelte',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Redux',
  'Zustand',
  'jQuery',
  'Lit',
  'Alpinejs',

  // Backend Technologies
  'Nodejs',
  'Expressjs',
  'NestJS',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'Laravel',
  'Symfony',
  'Ruby on Rails',
  'ASPNET Core',
  'Phoenix',
  'Koajs',
  'Hapijs',
  'Micronaut',
  'Actix',
  'Gin',

  // Databases
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'SQLite',
  'MariaDB',
  'Oracle',
  'Firebase',
  'Redis',
  'Cassandra',
  'DynamoDB',
  'Couchbase',
  'Elasticsearch',
  'Neo4j',
  'TimescaleDB',
  'ClickHouse',

  // DevOps & CI/CD
  'Docker',
  'Kubernetes',
  'Jenkins',
  'GitLab CI',
  'GitHub Actions',
  'CircleCI',
  'Travis CI',
  'TeamCity',
  'Azure DevOps',
  'Terraform',
  'Ansible',
  'Puppet',
  'Chef',
  'Vagrant',
  'Helm',
  'Prometheus',
  'Grafana',

  // Cloud Platforms
  'AWS',
  'Google Cloud Platform',
  'Microsoft Azure',
  'IBM Cloud',
  'Alibaba Cloud',
  'DigitalOcean',
  'Heroku',
  'Netlify',
  'Vercel',
  'Render',
  'Cloudflare',
  'Firebase Hosting',
  'Oracle Cloud',

  // Version Control & Collaboration
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Subversion (SVN)',
  'Mercurial',

  // Mobile Development
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'Ionic',
  'Cordova',
  'Xamarin',
  'NativeScript',
  'Objective-C',

  // Desktop Development
  'Electron',
  'Tauri',
  'Qt',
  'GTK',
  'WinForms',
  'WPF',
  'NET MAUI',

  // AI & Machine Learning
  'TensorFlow',
  'PyTorch',
  'Keras',
  'Scikit-learn',
  'OpenCV',
  'XGBoost',
  'LightGBM',
  'Hugging Face Transformers',
  'LangChain',
  'spaCy',
  'NLTK',
  'Pandas',
  'NumPy',
  'Matplotlib',
  'Jupyter',
  'Google Colab',

  // Data Engineering & Big Data
  'Apache Hadoop',
  'Apache Spark',
  'Kafka',
  'Airflow',
  'Flink',
  'Presto',
  'Snowflake',
  'Databricks',
  'Redshift',
  'BigQuery',
  'Dask',
  'dbt',

  // APIs & Tools
  'GraphQL',
  'REST',
  'Apollo',
  'Postman',
  'Swagger',
  'gRPC',
  'OpenAPI',

  // CMS & E-commerce
  'WordPress',
  'Strapi',
  'Contentful',
  'Sanity',
  'Ghost',
  'Shopify',
  'Magento',
  'WooCommerce',
  'BigCommerce',
  'Medusajs',
  'Saleor',

  // Testing Tools
  'Jest',
  'Mocha',
  'Chai',
  'Vitest',
  'Cypress',
  'Playwright',
  'Selenium',
  'Puppeteer',
  'TestCafe',
  'JUnit',
  'RSpec',

  // Security
  'OWASP',
  'Burp Suite',
  'Metasploit',
  'Nmap',
  'Wireshark',
  'Snort',
  'Suricata',
  'Vault',

  // Miscellaneous Tools
  'Figma',
  'Adobe XD',
  'Sketch',
  'Notion',
  'Trello',
  'Jira',
  'Slack',
  'Zoom',
  'VS Code',
  'IntelliJ IDEA',
  'PostgreSQL Studio',
  'DataGrip',
];
