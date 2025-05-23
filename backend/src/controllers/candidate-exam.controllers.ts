import { Request, Response, NextFunction } from 'express';
import { CandidateExamService } from '../services/candiate-exam.services';
import { generateResponse } from '../utils/generateResponse';
import { UploadService } from '../services/upload.services';

export class CandidateExamController {
  constructor(
    private candidateExamService: CandidateExamService,
    private uploadService: UploadService
  ) {}

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
  getCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = req.candidateInfo?.candidateId;
      const examId = req.candidateInfo?.examId;
      if (!candidateId) throw new Error('Candidate not authenticated');
      const candidate = await this.candidateExamService.getCandidate(candidateId,examId);

      generateResponse(res, 200, candidate, true, 'Candidate retrieved successfully');
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
      const candidate_id = req.candidateInfo?.candidateId;
      const exam_id  = req.candidateInfo?.examId as string;
      let file;
      
      if (req.file) {
          file = await this.uploadService.processFile(req.file);
          req.body.user_answer = [file.path];
        }
      if (!candidate_id) throw new Error('Candidate not authenticated');

      const answer = await this.candidateExamService.submitAnswer(exam_id, candidate_id, { ...req.body, file });
      const response = {
        message: 'Answer submitted successfully',
        answer
      };

      generateResponse(res, 200, response, true, response.message);
    } catch (error) {
      next(error);
    }
  };
  resetAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidate_id = req.candidateInfo?.candidateId;
      const {answer_id} = req.body
      if (!candidate_id) throw new Error('Candidate not authenticated');

      const answer = await this.candidateExamService.resetAnswer(answer_id);
      const response = {
        message: 'Answer reset successfully',
        answer
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

      await this.candidateExamService.finishExam(examId,candidateId);

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

  submitViolation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      await this.candidateExamService.submitViolation(examId, req.body); 

      generateResponse(res, 200, {}, true, 'Violation submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  saveSnapshot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');
      
      const snapshot = await this.candidateExamService.saveSnapshot(examId, req.file as Express.Multer.File, {...req.body,...req.query});

      generateResponse(res, 200, snapshot, true, 'snapshot saved successfully');
    } catch (error) {
      next(error);
    }
  };
}
