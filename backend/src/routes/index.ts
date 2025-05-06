//library imports
import express from 'express';
import articleRouter from './articles.router';
import assessmentRouter from './assessment.router';
import moduleRouter from './module.router';
import questionRouter from './question.router';
import dashboardRouter from './dasboard.router';
import roleRouter from './role.router';
import technologyRouter from './technology.router';
import adminRouter from './user.router';
import candidateRouter from './candidates.router';
import examRouter from './exam.router';
import candidateExamRouter from './candidate-exam.router';
import uploadRouter from './upload.router';

const router = express.Router();

router.use('/articles', articleRouter);
router.use('/user', adminRouter);
router.use('/role', roleRouter);
router.use('/module', moduleRouter);
router.use('/technology', technologyRouter);
router.use('/assessment', assessmentRouter);
router.use('/dashboard', dashboardRouter);
router.use('/question', questionRouter);
router.use('/candidate', candidateRouter);
router.use('/exam', examRouter);
router.use('/candidate-exam', candidateExamRouter);
router.use('/upload', uploadRouter);

export default router;
