//library imports
import express from "express";

//local imports
import articleRouter from "./articles.router";
import adminRouter from "./user.router";
import roleRouter from './role.router'
import moduleRouter from './module.router'
import technologyRouter from './technology.router'
const router = express.Router();

router.use("/articles", articleRouter);
router.use("/user", adminRouter);
router.use("/role", roleRouter);
router.use("/module", moduleRouter);
router.use("/technology", technologyRouter);

export default router;
