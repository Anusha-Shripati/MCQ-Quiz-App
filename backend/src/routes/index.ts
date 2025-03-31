//library imports
import express from "express";

//local imports
import articleRouter from "./articles.router";
import adminRouter from "./user.router";
import roleRouter from './role.router'
const router = express.Router();

router.use("/articles", articleRouter);
router.use("/user", adminRouter);
router.use("/role", roleRouter);

export default router;
