export const dashboardEndpoint = {
  INTERVIEW_DATA: '/dashboard/get-interview-data',
  CALENDAR_DATA: '/dashboard/get-calendar-data',
  INTERVIEW_COUNT: '/dashboard/get-interview-count',
  INTERVIEW_SCORE: '/dashboard/get-interview-score',
  QUESTIONS_DATA: '/dashboard/get-questions-data',
  TOP_ASSESSMENTS: '/dashboard/get-top-assessments',
  QUESTION_TYPE_PERFORMANCE: '/dashboard/get-question-type-performance',
  EXAM_DURATION_PERFORMANCE: '/dashboard/get-exam-duration-performance',
};
export const assessmentEndpoint = {
  LIST: '/assessment/list',
  ASSESSMENT_BY_ID: '/assessment',
  ALL: '/assessment/all',
  CHECK_UNIQUE: '/assessment/check-unique',
  CHECK_QUESTIONS: '/assessment/check-question',
};
export const technologyEndpoint = {
  LIST: '/technology/list',
  // TECHNOLOGY_BY_ID: '/technology',
  CREATE: '/technology/create',
  DOWNLOAD_TEMPLATE: '/question/download-template',
  CREATE_ONLY: '/technology/create-only',
  GET_TECHNOLOGY_BY_ID: '/technology',
  UPDATE: '/technology/:id/name',
  DELETE: '/technology',
};
export const userEndpoint = {
  LIST: '/user/list',
  CREATE: '/user/create',
  UPLOAD_IMAGE: '/user/upload-image',
  USER_BY_ID: '/user',
  CHANGE_PASSWORD: '/user/change-password',
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
};
export const candidateEndpoint = {
  LIST: '/candidate/list',
  CREATE: '/candidate/create',
  CANDIDATE_BY_ID: '/candidate',
};
export const questionEndpoint = {
  LIST: '/question/list',
  CREATE: '/question/create',
  QUESTION_BY_ID: '/question',
  DELETE: '/question/delete',
};
export const roleEndpoint = {
  LIST: '/role/list',
  CREATE: '/role/create',
};
export const resultEndpoint = {
  LIST: '/result/list',
  RESULT_BY_ID: '/result',
  UPDATE_SCORE: '/result/update-score',
  GET_FEEDBACK: '/result/feedback',
};
export const moduleEndpoint = {
  LIST: '/module/list',
};
export const examEndpoint = {
  BY_ID: '/candidate-exam',
  CANDIDATE_EXAM: 'candidate-exam',
  SEND_THANK_YOU_EMAIL: '/candidate-exam/send-thank-you-email',
};

// Platform Admin Endpoints
export const platformAdminEndpoint = {
  LOGIN: '/platform/admins/login',
  ME: '/platform/admins/me',
  LIST: '/platform/admins/list',
  CREATE: '/platform/admins/create',
  ADMIN_BY_ID: '/platform/admins',
  CHANGE_PASSWORD: '/platform/admins/change-password',
  UPLOAD_IMAGE: '/platform/admins/upload-image',
  VALIDATE_EMAIL: '/platform/admins/validate-email',
  VALIDATE_OTP: '/platform/admins/validate-otp',
  RESET_PASSWORD: '/platform/admins/reset-password',
};

export const platformRoleEndpoint = {
  LIST: '/platform/roles/list',
  CREATE: '/platform/roles/create',
  ROLE_BY_ID: '/platform/roles',
};

export const platformModuleEndpoint = {
  LIST: '/platform/modules/list',
};

export const platformPlanEndpoint = {
  LIST: '/platform/plans',
  CREATE: '/platform/plans',
  BY_ID: '/platform/plans',
  UPDATE: '/platform/plans',
  DELETE: '/platform/plans',
  TOGGLE: '/platform/plans',
};

export const platformTenantEndpoint = {
  LIST: '/platform/tenants',
  CREATE: '/platform/tenants',
  BY_ID: '/platform/tenants',
  UPDATE: '/platform/tenants',
  DELETE: '/platform/tenants',
  STATUS: '/platform/tenants',
  SUBSCRIPTION: '/platform/tenants',
  USAGE: '/platform/tenants',
  PROVISION: '/platform/provision',
};

export const platformDashboardEndpoint = {
  PLAN_DISTRIBUTION: '/platform/dashboard/plan-distribution',
  TENANT_GROWTH: '/platform/dashboard/tenant-growth',
  PLATFORM_USAGE: '/platform/dashboard/platform-usage',
};
