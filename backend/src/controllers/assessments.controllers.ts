import { Request, Response, NextFunction } from 'express';
import AssessmentsService from '../services/assessments.services';
import { generateResponse } from '../utils/generateResponse';
import { prisma } from '../db/prisma.client';
import ExamService from '../services/exam.services';

const assessmentService = new AssessmentsService();
const examService = new ExamService();

export class AssessmentController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { technologies, ...assessmentPayload } = req.body;

      if (assessmentPayload.pass_criteria && typeof assessmentPayload.pass_criteria === 'string') {
        assessmentPayload.pass_criteria = parseInt(assessmentPayload.pass_criteria, 10);
      }

      for (const tech of technologies) {
        const availableQuestions = await prisma.questions.count({
          where: {
            technology_id: tech.technology_id,
            difficulty_level: tech.easy > 0 ? 'easy' : tech.medium > 0 ? 'medium' : 'hard',
            deleted_at: null,
          },
        });

        if (tech.easy > 0 && availableQuestions < tech.easy) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough easy questions available for technology ${tech.technology_id}. Requested: ${tech.easy}, Available: ${availableQuestions}`
          );
        }

        if (tech.medium > 0 && availableQuestions < tech.medium) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough medium questions available for technology ${tech.technology_id}. Requested: ${tech.medium}, Available: ${availableQuestions}`
          );
        }

        if (tech.hard > 0 && availableQuestions < tech.hard) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough hard questions available for technology ${tech.technology_id}. Requested: ${tech.hard}, Available: ${availableQuestions}`
          );
        }
      }

      const { easy, medium, hard } = technologies.reduce(
        (acc: any, tech: any) => {
          acc.easy += tech.easy || 0;
          acc.medium += tech.medium || 0;
          acc.hard += tech.hard || 0;
          return acc;
        },
        { easy: 0, medium: 0, hard: 0 }
      );

      const total = easy + medium + hard;
      if (total === 0) return 0;
      const score = (easy * 1 + medium * 2 + hard * 3) / total;

      const difficulty_score = Math.round(score);

      const newAssessment = await assessmentService.createAssessments({
        ...assessmentPayload,
        difficulty_score,
        easy,
        medium,
        hard,
        created_by: req.user?.id,
      });

      await assessmentService.assignTechnologiesToAssessment(
        newAssessment.id,
        req.body.technologies
      );

      const assessment = await assessmentService.getAssessmentById(newAssessment.id);

      return generateResponse(res, 200, newAssessment, true, 'Assessment created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { technologies, ...assessmentPayload } = req.body;

      // Convert pass_criteria to number if it's a string
      if (assessmentPayload.pass_criteria && typeof assessmentPayload.pass_criteria === 'string') {
        assessmentPayload.pass_criteria = parseInt(assessmentPayload.pass_criteria, 10);
      }

      const existingAssessment = await assessmentService.getAssessmentById(id);
      if (!existingAssessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }

      for (const tech of technologies) {
        const availableQuestions = await prisma.questions.count({
          where: {
            technology_id: tech.technology_id,
            difficulty_level: tech.easy > 0 ? 'easy' : tech.medium > 0 ? 'medium' : 'hard',
            deleted_at: null,
          },
        });

        if (tech.easy > 0 && availableQuestions < tech.easy) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough easy questions available for technology ${tech.technology_id}. Requested: ${tech.easy}, Available: ${availableQuestions}`
          );
        }

        if (tech.medium > 0 && availableQuestions < tech.medium) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough medium questions available for technology ${tech.technology_id}. Requested: ${tech.medium}, Available: ${availableQuestions}`
          );
        }

        if (tech.hard > 0 && availableQuestions < tech.hard) {
          return generateResponse(
            res,
            400,
            {},
            false,
            `Not enough hard questions available for technology ${tech.technology_id}. Requested: ${tech.hard}, Available: ${availableQuestions}`
          );
        }
      }

      const { easy, medium, hard } = technologies.reduce(
        (acc: any, tech: any) => {
          acc.easy += tech.easy || 0;
          acc.medium += tech.medium || 0;
          acc.hard += tech.hard || 0;
          return acc;
        },
        { easy: 0, medium: 0, hard: 0 }
      );

      const total = easy + medium + hard;
      if (total === 0) return 0;
      const score = (easy * 1 + medium * 2 + hard * 3) / total;
      const difficulty_score = Math.round(score);

      const updatedRole = await assessmentService.updateAssessments(id, {
        ...assessmentPayload,
        difficulty_score,
        easy,
        medium,
        hard,
      });

      if (technologies && Array.isArray(technologies)) {
        await assessmentService.deleteTechnologyAssessment(id);
        await assessmentService.assignTechnologiesToAssessment(updatedRole.id, technologies);

        // Find all incomplete exams for this assessment
        const incompleteExams = await prisma.exam.findMany({
          where: {
            assessment_id: id,
            is_completed: false,
          },
        });

        // For each incomplete exam, delete existing questions and create new ones
        for (const exam of incompleteExams) {
          // Delete existing exam questions
          await prisma.exam_questions.deleteMany({
            where: { exam_id: exam.id },
          });

          // Create new exam questions based on updated assessment
          await examService.createExamQuestionsForAssessment(exam.id, id);
        }
      }
      return generateResponse(res, 200, updatedRole, true, 'Assessment updated successfully');
    } catch (error) {
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingAssessment = await assessmentService.getAssessmentById(id);
      if (!existingAssessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }
      await assessmentService.deleteTechnologyAssessment(id);
      await assessmentService.deleteAssessment(id);
      return generateResponse(res, 200, {}, true, 'Assessment delete successfully');
    } catch (error) {
      next(error);
    }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query;
      const assessmentData = await assessmentService.getAssessments(search);
      return generateResponse(res, 200, assessmentData, true, 'Assessments fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getAllAssessment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assessmentData = await assessmentService.getAllAssessments();
      return generateResponse(res, 200, assessmentData, true, 'Assessments fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getAssessmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const assessment = await assessmentService.getAssessmentById(id);
      if (!assessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }
      return generateResponse(res, 200, assessment, true, 'Assessment fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
