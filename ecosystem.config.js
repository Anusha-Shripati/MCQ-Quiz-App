module.exports = {
  apps: [
    {
      name: 'mcq-quiz-backend',
      cwd: './backend',
      script: 'node',
      args: 'dist/src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      output: './logs/backend-out.log',
      error: './logs/backend-error.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
    },
    // {
    //   name: 'mcq-quiz-frontend',
    //   cwd: './frontend',
    //   script: 'npm',
    //   args: 'start',
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    //   merge_logs: true,
    //   out_file: './logs/frontend-out.log',
    //   error_file: './logs/frontend-error.log',
    //   combine_logs: true,
    //   time: true
    // }
  ],
};
