import { Request, Response, NextFunction } from 'express';
import ExamService from '../services/exam.services';
import { generateResponse } from '../utils/generateResponse';

const examService = new ExamService();

export class ExamController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const examData = req.body;
      const newExam = await examService.createExam(examData);
      return generateResponse(res, 201, newExam, true, 'Exam created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const examData = req.body;

      const existingExam = await examService.getExamById(id);
      if (!existingExam) {
        return generateResponse(res, 404, {}, false, 'Exam not found!');
      }

      const updatedExam = await examService.updateExam(id, examData);
      return generateResponse(res, 200, updatedExam, true, 'Exam updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingExam = await examService.getExamById(id);
      if (!existingExam) {
        return generateResponse(res, 404, {}, false, 'Exam not found!');
      }

      await examService.deleteExam(id);
      return generateResponse(res, 200, {}, true, 'Exam deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query;
      const exams = await examService.getExams(search);
      return generateResponse(res, 200, exams, true, 'Exams fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const exam = await examService.getExamById(id);
      if (!exam) {
        return generateResponse(res, 404, {}, false, 'Exam not found!');
      }
      return generateResponse(res, 200, exam, true, 'Exam fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getExamById = async (req: Request, res: Response) => {
    const { examId } = req.params;
    const exam = await examService.getExamById(examId);
    return generateResponse(res, 200, exam, true, 'Exam fetched successfully');
  };

  startExam = async (req: Request, res: Response) => {
    const { examId } = req.params;
    const exam = await examService.startExam(examId);
    return generateResponse(res, 200, exam, true, 'Exam started successfully');
  };
}
