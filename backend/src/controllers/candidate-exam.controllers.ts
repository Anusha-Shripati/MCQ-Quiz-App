import { Request, Response, NextFunction } from 'express';
import { CandidateExamService } from '../services/candiate-exam.services';
import { generateResponse } from '../utils/generateResponse';

export class CandidateExamController {
  constructor(private candidateExamService: CandidateExamService) {}

  getExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;
      if (!candidateId) throw new Error('Candidate not authenticated');
      const exam = await this.candidateExamService.getExam(examId, candidateId);

      generateResponse(res, 200, exam, true, 'Exam retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  startExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      const result = await this.candidateExamService.startExam(examId, candidateId);

      generateResponse(res, 200, result, true, 'Exam started successfully');
    } catch (error) {
      next(error);
    }
  };

  getNextQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      const nextQuestion = await this.candidateExamService.getNextQuestion(
        examId,
        candidateId,
        req.query.currentQuestionId as string | undefined
      );

      if (!nextQuestion) {
        generateResponse(
          res,
          200,
          {
            message: 'No more questions',
            shouldFinish: true,
          },
          true,
          'All questions answered'
        );
        return;
      }

      generateResponse(res, 200, nextQuestion, true, 'Next question retrieved');
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId, questionId } = req.params;
      const { answer } = req.body;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      // const nextQuestion = await this.candidateExamService.submitAnswer(
      //   examId,
      //   candidateId,
      //   questionId,
      //   answer
      // );

      const response = {
        message: 'Answer submitted successfully',
        // nextQuestion
      };

      generateResponse(res, 200, response, true, response.message);
    } catch (error) {
      next(error);
    }
  };

  finishExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      // const result = await this.candidateExamService.finishExam(
      // 	examId,
      // 	candidateId
      // );

      generateResponse(res, 200, {}, true, 'Exam completed successfully');
    } catch (error) {
      next(error);
    }
  };

  getExamStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      const status = await this.candidateExamService.getExamStatus(examId, candidateId);

      generateResponse(res, 200, status, true, 'Exam status retrieved');
    } catch (error) {
      next(error);
    }
  };
}
