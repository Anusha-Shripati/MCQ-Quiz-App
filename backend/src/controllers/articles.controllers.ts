import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../services/articles.services";

const articleService = new ArticleService();

export class ArticleController {}
