export const dashboardEndpoint = {
    INTERVIEW_DATA: '/dashboard/get-interview-data',
    CALENDAR_DATA: '/dashboard/get-calendar-data',
    INTERVIEW_COUNT: '/dashboard/get-interview-count',
    INTERVIEW_SCORE: '/dashboard/get-interview-score',
    QUESTIONS_DATA: '/dashboard/get-questions-data'
}
export const assessmentEndpoint = {
    LIST: "/assessment/list",
    ASSESSMENT_BY_ID:"/assessment",
    ALL:"/assessment/all"
}

export const technologyEndpoint = {
  LIST: '/technology/list',
  TECHNOLOGY_BY_ID: '/technology',
  CREATE: '/technology/create',
  DOWNLOAD_TEMPLATE: '/question/download-template',
};
export const userEndpoint={
    LIST:"/user/list",
    CREATE:"/user/create",
    UPLOAD_IMAGE:"/user/upload-image",
    USER_BY_ID:"/user",
    CHANGE_PASSWORD:"/user/change-password",
    LOGIN:'/user/login'
}
export const candidateEndpoint={
    LIST:"/candidate/list",
    CREATE:"/candidate/create",
    CANDIDATE_BY_ID:"/candidate"
}
export const questionEndpoint={
    LIST:"/question/list",
    CREATE:"/question/create",
    QUESTION_BY_ID:"/question",

}
export const roleEndpoint={
    LIST:"/role/list",
    CREATE:"/role/create",
}
export const resultEndpoint={
    LIST:"/result/list",
    RESULT_BY_ID:"/result",

}
export const moduleEndpoint={
    LIST:"/module/list",
}
export const examEndpoint={
    BY_ID:"/candidate-exam",
    CANDIDATE_EXAM:"/candidate-exam",
    SEND_THANK_YOU_EMAIL:"/candidate-exam/send-thank-you-email"
}