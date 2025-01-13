// import request from "supertest";
// import appInstance from "../src/lib/ExpressAppProvider";
// import { prisma } from "../src/db/prisma.client";
// import { AppError } from "../src/common/errors/AppError";

// const app = appInstance.getServer();
// const baseUrl = "/api/v1/articles";

// //// ... existing imports ...

// // Update mock article with Date objects instead of string dates
// const mockArticle = {
//   id: 1,
//   nickname: "testuser",
//   title: "Test Article",
//   content: "This is a test article",
//   createdAt: new Date("2024-12-23T09:24:37.383Z"),
//   updatedAt: new Date("2024-12-23T09:24:37.383Z"),
// };

// beforeEach(() => {
//   jest.restoreAllMocks();
// });

// describe("Tests for Articles: /api/v1/articles", () => {
//   describe("GET /api/v1/articles", () => {
//     it("should return 200 OK with empty articles", async () => {
//       jest.spyOn(prisma.article, "findMany").mockResolvedValue([]);
//       jest.spyOn(prisma.article, "count").mockResolvedValue(0);

//       const response = await request(app).get(baseUrl);
//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         status: 200,
//         message: "Articles retrieved successfully",
//         data: { articles: [], totalArticles: 0 },
//       });
//     });

//     it("should return 200 OK with articles list", async () => {
//       jest.spyOn(prisma.article, "findMany").mockResolvedValue([mockArticle]);
//       jest.spyOn(prisma.article, "count").mockResolvedValue(1);

//       const response = await request(app).get(baseUrl);
//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         status: 200,
//         message: "Articles retrieved successfully",
//         data: {
//           articles: [
//             {
//               ...mockArticle,
//               createdAt: "2024-12-23T09:24:37.383Z",
//               updatedAt: "2024-12-23T09:24:37.383Z",
//             },
//           ],
//           totalArticles: 1,
//         },
//       });
//     });
//   });

//   describe("POST /api/v1/articles", () => {
//     it("should return 201 Created with new article", async () => {
//       const newArticleData = {
//         nickname: "newuser",
//         title: "New Article",
//         content: "This is a new article",
//       };

//       const mockNewArticle = {
//         ...newArticleData,
//         id: 2,
//         createdAt: "2024-12-23T09:24:37.476Z",
//         updatedAt: "2024-12-23T09:24:37.476Z",
//       };

//       // Mock the queue function instead of direct service call
//       jest
//         .spyOn(
//           require("../src/common/queue/articles.queue"),
//           "addJobArticleQueue",
//         )
//         .mockResolvedValue({ data: mockNewArticle });

//       const response = await request(app).post(baseUrl).send(newArticleData);

//       expect(response.status).toBe(201);
//       expect(response.body).toEqual({
//         success: true,
//         status: 201,
//         message: "Article created successfully",
//         data: mockNewArticle,
//       });
//     });

//     it("should return 400 Bad Request on validation failure", async () => {
//       const invalidArticleData = {
//         // Missing required fields like 'nickname', 'title', or 'content'
//         nickname: "",
//         title: "",
//         content: "",
//       };

//       const response = await request(app)
//         .post(baseUrl)
//         .send(invalidArticleData);

//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({
//         success: false,
//         status: 400,
//         message: expect.any(String), // Message can vary based on validation error
//         isOperation: true,
//       });
//     });
//   });

//   describe("GET /api/v1/articles/:id", () => {
//     it("should return the article for the given id", async () => {
//       const articleId = 1;
//       const mockArticle = {
//         id: articleId,
//         nickname: "testuser",
//         title: "Test Article",
//         content: "This is a test article",
//         createdAt: new Date("2024-12-23T09:24:37.383Z"),
//         updatedAt: new Date("2024-12-23T09:24:37.383Z"),
//       };

//       jest.spyOn(prisma.article, "findUnique").mockResolvedValue(mockArticle);

//       const response = await request(app).get(`${baseUrl}/${articleId}`);

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         status: 200,
//         message: "Article retrieved successfully",
//         data: {
//           ...mockArticle,
//           createdAt: "2024-12-23T09:24:37.383Z",
//           updatedAt: "2024-12-23T09:24:37.383Z",
//         },
//       });
//     });

//     it("should return 404 when article with the given id not found", async () => {
//       const articleId = 999;
//       jest
//         .spyOn(prisma.article, "findUnique")
//         .mockRejectedValue(new AppError("Article not found", 404));

//       const response = await request(app).get(`${baseUrl}/${articleId}`);
//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({
//         success: false,
//         status: 404,
//         message: "Article not found",
//         isOperation: true,
//       });
//     });
//   });

//   describe("DELETE /api/v1/articles/:id", () => {
//     it("should return 404 when article to delete not found", async () => {
//       jest
//         .spyOn(prisma.article, "delete")
//         .mockRejectedValue(new AppError("Article not found", 404));

//       const response = await request(app).delete(`${baseUrl}/999`);
//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({
//         success: false,
//         status: 404,
//         message: "Article not found",
//         isOperation: true,
//       });
//     });

//     it("should return 200 OK when article is deleted", async () => {
//       jest.spyOn(prisma.article, "delete").mockResolvedValue(mockArticle);

//       const response = await request(app).delete(`${baseUrl}/1`);
//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         status: 200,
//         message: "Article deleted successfully",
//         data: {
//           ...mockArticle,
//           createdAt: "2024-12-23T09:24:37.383Z",
//           updatedAt: "2024-12-23T09:24:37.383Z",
//         },
//       });
//     });
//   });
// });
