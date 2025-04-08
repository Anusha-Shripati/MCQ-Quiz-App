//library imports
import express from "express";

//local imports
import articleRouter from "./articles.router";
import adminRouter from "./user.router";
import roleRouter from './role.router'
import moduleRouter from './module.router'
import technologyRouter from './technology.router'
import assessmentRouter from "./assessment.router";
import questionRouter from "./question.router";
const router = express.Router();

router.use("/articles", articleRouter);
router.use("/user", adminRouter);
router.use("/role", roleRouter);
router.use("/module", moduleRouter);
router.use("/technology", technologyRouter);
router.use("/assessment", assessmentRouter);
router.use("/question", questionRouter);


export default router;
