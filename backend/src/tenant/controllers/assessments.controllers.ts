import { Request, Response, NextFunction } from 'express';
import AssessmentsService from '../services/assessments.services';
import { generateResponse } from '../../utils/generateResponse';
import ExamService from '../services/exam.services';
import { Questions } from '@prisma/client';
import { UsageService } from '../../platform/services/usage.service';
import { UsageMetric } from '../../db/prisma/generated/client';
import { getPrisma } from '../../db/prisma/client';

export class AssessmentController {
  private usageService: UsageService;

  constructor() {
    this.usageService = new UsageService(getPrisma());
  }
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { technologies, ...assessmentPayload } = req.body;
      const assessmentService = new AssessmentsService(req.context!.prisma);

      const existingAssessment = await req.context!.prisma.assessments.findFirst({
        where: {
          name: assessmentPayload.name,
          deleted_at: null,
        },
      });

      if (existingAssessment) {
        return generateResponse(
          res,
          400,
          {},
          false,
          `Assessment with name '${assessmentPayload.name}' already exists.`
        );
      }

      if (assessmentPayload.pass_criteria && typeof assessmentPayload.pass_criteria === 'string') {
        assessmentPayload.pass_criteria = parseInt(assessmentPayload.pass_criteria, 10);
      }

      for (const tech of technologies) {
        const technologiesName = await req.context!.prisma.technology.findUnique({
          where: {
            id: tech.technology_id,
          },
          select: {
            name: true,
          },
        });

        if (tech.easy.total > 0) {
          const easyQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'easy',
              deleted_at: null,
            },
          });

          if (easyQuestions < tech.easy.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough easy questions available for technology ${technologiesName?.name}. Requested: ${tech.easy}, Available: ${easyQuestions}`
            );
          }
        }
        if (tech.medium.total > 0) {
          const mediumQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'medium',
              deleted_at: null,
            },
          });
          if (mediumQuestions < tech.medium.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough medium questions available for technology ${technologiesName?.name}. Requested: ${tech.medium}, Available: ${mediumQuestions}`
            );
          }
        }

        if (tech.hard.total > 0) {
          const hardQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'hard',
              deleted_at: null,
            },
          });

          if (hardQuestions < tech.hard.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough hard questions available for technology ${technologiesName?.name}. Requested: ${tech.hard}, Available: ${hardQuestions}`
            );
          }
        }
      }

      const { easy, medium, hard } = technologies.reduce(
        (acc: any, tech: any) => {
          acc.easy += tech.easy.total || 0;
          acc.medium += tech.medium.total || 0;
          acc.hard += tech.hard.total || 0;
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

      await this.usageService.incrementUsage(req.context!.tenant!.id, UsageMetric.assessments);

      return generateResponse(res, 200, newAssessment, true, 'Assessment created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { technologies, ...assessmentPayload } = req.body;
      const assessmentService = new AssessmentsService(req.context!.prisma);
      const examService = new ExamService(req.context!.prisma);
      
      const existingAssessmentWithSameName = await req.context!.prisma.assessments.findFirst({
        where: {
          name: assessmentPayload.name,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingAssessmentWithSameName) {
        return generateResponse(
          res,
          400,
          {},
          false,
          `Assessment with name '${assessmentPayload.name}' already exists.`
        );
      }

      if (assessmentPayload.pass_criteria && typeof assessmentPayload.pass_criteria === 'string') {
        assessmentPayload.pass_criteria = parseInt(assessmentPayload.pass_criteria, 10);
      }

      const existingAssessment = await assessmentService.getAssessmentById(id);
      if (!existingAssessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }

      for (const tech of technologies) {
        const technologiesName = await req.context!.prisma.technology.findUnique({
          where: {
            id: tech.technology_id,
          },
          select: {
            name: true,
          },
        });

        if (tech.easy.total > 0) {
          const easyQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'easy',
              deleted_at: null,
            },
          });

          if (easyQuestions < tech.easy.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough easy questions available for technology ${technologiesName?.name}. Requested: ${tech.easy}, Available: ${easyQuestions}`
            );
          }
        }
        if (tech.medium.total > 0) {
          const mediumQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'medium',
              deleted_at: null,
            },
          });
          if (mediumQuestions < tech.medium.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough medium questions available for technology ${technologiesName?.name}. Requested: ${tech.medium}, Available: ${mediumQuestions}`
            );
          }
        }
        if (tech.hard.total > 0) {
          const hardQuestions = await req.context!.prisma.questions.count({
            where: {
              technology_id: tech.technology_id,
              difficulty_level: 'hard',
              deleted_at: null,
            },
          });

          if (hardQuestions < tech.hard.total) {
            return generateResponse(
              res,
              400,
              {},
              false,
              `Not enough hard questions available for technology ${technologiesName?.name}. Requested: ${tech.hard}, Available: ${hardQuestions}`
            );
          }
        }
      }

      const { easy, medium, hard } = technologies.reduce(
        (acc: any, tech: any) => {
          acc.easy += tech.easy.total || 0;
          acc.medium += tech.medium.total || 0;
          acc.hard += tech.hard.total || 0;
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

        await assessmentService.cacheService.deleteKey(`assessment:${id}`);
        await assessmentService.cacheService.deleteKey('assessment-all');

        await assessmentService.assignTechnologiesToAssessment(updatedRole.id, technologies);

        const incompleteExams = await req.context!.prisma.exam.findMany({
          where: {
            assessment_id: id,
            is_completed: false,
          },
        });

        // For each incomplete exam, delete existing questions and create new ones
        for (const exam of incompleteExams) {
          // Delete existing exam questions
          await req.context!.prisma.exam_questions.deleteMany({
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
      const assessmentService = new AssessmentsService(req.context!.prisma);
      
      const existingAssessment = await assessmentService.getAssessmentById(id);
      if (!existingAssessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }
      await assessmentService.deleteTechnologyAssessment(id);
      await assessmentService.deleteAssessment(id);
      // Removed decrementUsage call - usage tracks creation limits per period

      return generateResponse(res, 200, {}, true, 'Assessment delete successfully');
    } catch (error) {
      next(error);
    }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query;
      const assessmentService = new AssessmentsService(req.context!.prisma);
      
      const assessmentData = await assessmentService.getAssessments(search);
      return generateResponse(res, 200, assessmentData, true, 'Assessments fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getAllAssessment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assessmentService = new AssessmentsService(req.context!.prisma);
      
      const assessmentData = await assessmentService.getAllAssessments();
      return generateResponse(res, 200, assessmentData, true, 'Assessments fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getAssessmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const assessmentService = new AssessmentsService(req.context!.prisma);
      
      const assessment = await assessmentService.getAssessmentById(id);
      if (!assessment) {
        return generateResponse(res, 404, {}, false, 'Assessment not found!');
      }
      return generateResponse(res, 200, assessment, true, 'Assessment fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  checkUnique = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const existingAssessment = await req.context!.prisma.assessments.findFirst({
        where: {
          name,
          deleted_at: null,
        },
      });

      if (existingAssessment) {
        return generateResponse(
          res,
          400,
          {},
          false,
          `Assessment with name '${name}' already exists.`
        );
      }

      return generateResponse(res, 200, {}, true, 'Assessment name is unique');
    } catch (error) {
      next(error);
    }
  };

  checkQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const technologyIds = req.body.technologies;
      const results = await req.context!.prisma.questions.groupBy({
        by: ['technology_id', 'difficulty_level', 'type'],
        where: {
          technology_id: { in: technologyIds },
          deleted_at: null,
        },
        _count: {
          _all: true,
        },
      });
      const obj: { [key: string]: { easy: {[key: string]:number}; medium: {[key: string]:number}; hard: {[key: string]:number} } } = {};
      results.forEach((result: any) => {
        if (!obj[result?.technology_id as string]) {
          obj[result.technology_id]={
            easy:{},
            medium:{},
            hard:{},
          }
        }
        if(!obj[result.technology_id][result.difficulty_level as 'easy' | 'medium' | 'hard'][result.type])obj[result.technology_id][result.difficulty_level as 'easy' | 'medium' | 'hard'][result.type]=0
        obj[result.technology_id][result.difficulty_level as 'easy' | 'medium' | 'hard'][result.type] += result._count._all;
      });

      return generateResponse(res, 200, { success: true, results: obj }, true, 'Successfully checked');
    } catch (error) {
      next(error);
    }
  };
}
