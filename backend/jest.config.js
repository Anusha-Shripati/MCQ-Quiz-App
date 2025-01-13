module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"], // Adjust the test match pattern as per your project structure
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
