//library imports
import express from "express";

//local imports
import articleRouter from "./articles.router";

const router = express.Router();

router.use("/articles", articleRouter);

export default router;
