//library imports
import express from "express";

//local imports
import articleRouter from "./articles.router";
import adminRouter from "./user.router";

const router = express.Router();

router.use("/articles", articleRouter);
router.use("/user", adminRouter);

export default router;
