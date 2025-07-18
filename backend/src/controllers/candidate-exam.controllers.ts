import { Request, Response, NextFunction } from 'express';
import { CandidateExamService } from '../services/candiate-exam.services';
import { generateResponse } from '../utils/generateResponse';
import { UploadService } from '../services/upload.services';
import path from 'path';
import fs from 'fs'
import { mergeQueue } from '../queue/mergeQueue';
import { prisma } from '../db/prisma.client';
export class CandidateExamController {
  constructor(
    private candidateExamService: CandidateExamService,
    private uploadService: UploadService
  ) { }

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
      const candidate = await this.candidateExamService.getCandidate(candidateId, examId);

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
      const exam_id = req.candidateInfo?.examId as string;

      if (!candidate_id) throw new Error('Candidate not authenticated');

      let file;

      if (req.body.merge_chunk) {

        const updated = await prisma.answers.updateMany({
          where: {
            exam_id: exam_id,
            question_id: req.body.question_id || null,
            question_name: req.body.question_name || null,
            candidate_id: candidate_id,
          },
          data: {
            user_answer: [],
          },
        });

        if (updated.count === 0) {
          await prisma.answers.create({
            data: {
              exam_id: exam_id,
              question_id: req.body.question_id || null,
              question_name: req.body.question_name || null,
              candidate_id: candidate_id,
              user_answer: [],
            },
          });
        }

        await mergeQueue.add('mergeChunk', {
          foldername: req.body.foldername,
          exam_id,
          candidate_id,
          body: req.body,
        });
        console.log('Merge task added to queue');
        return generateResponse(
          res,
          202,
          { message: 'Merging scheduled. Answer will be submitted shortly.' },
          true
        );
      }

      // If no merge required, submit directly
      const answer = await this.candidateExamService.submitAnswer(exam_id, candidate_id, {
        ...req.body,
        file,
      });

      generateResponse(res, 200, { message: 'Answer submitted successfully', answer }, true);
    } catch (error) {
      next(error);
    }
  };
  resetAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidate_id = req.candidateInfo?.candidateId;
      const { answer_id } = req.body;
      if (!candidate_id) throw new Error('Candidate not authenticated');

      const answer = await this.candidateExamService.resetAnswer(answer_id);
      const response = {
        message: 'Answer reset successfully',
        answer,
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

      await this.candidateExamService.finishExam(examId, candidateId);

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

      const snapshot = await this.candidateExamService.saveSnapshot(
        examId,
        req.file as Express.Multer.File,
        { ...req.body, ...req.query }
      );

      generateResponse(res, 200, snapshot, true, 'snapshot saved successfully');
    } catch (error) {
      next(error);
    }
  };
  sendThankYouEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      const result = await this.candidateExamService.sendThankYouEmail(examId, candidateId);

      generateResponse(res, 200, result, true, 'Thank you email sent successfully');
    } catch (error) {
      next(error);
    }
  };
  submitVerifiedImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      // if (!candidateId) throw new Error('Candidate not authenticated');

      // Ensure the file is uploaded
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const result = await this.uploadService.saveVerifiedImageToS3(req.file);
      // console.log('result', result);

      await this.candidateExamService.saveVerifiedImage(examId, result);

      generateResponse(res, 200, result, true, 'Verified image submitted successfully');
    } catch (error) {
      next(error);
    }
  }
  submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.params;
      const candidateId = req.candidateInfo?.candidateId;

      if (!candidateId) throw new Error('Candidate not authenticated');

      const feedback = await this.candidateExamService.submitFeedback(examId, candidateId, req.body);

      generateResponse(res, 200, feedback, true, 'Feedback submitted successfully');
    } catch (error) {
      next(error);
    }
  };
}
