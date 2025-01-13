import express from "express";
import { ArticleController } from "../controllers/articles.controllers";
import { validateRequest } from "../middlewares/validation.middleware";
// import {
//   createArticleSchema,
//   deleteArticleSchema,
//   getArticleByIdSchema,
// } from "../validationSchemas/articles.validations";
import paginationMiddleware from "../middlewares/pagination.middleware";

const articleRouter = express.Router();
const articleController = new ArticleController();

// articleRouter.get("/", paginationMiddleware, articleController.getAllArticles);
// articleRouter.get(
//   "/:id",
//   validateRequest(getArticleByIdSchema),
//   articleController.getArticleById,
// );

export default articleRouter;
