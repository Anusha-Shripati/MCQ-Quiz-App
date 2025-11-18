import { Prisma, Question_type, Questions, Technology } from '@prisma/client';
import { prisma } from '../db/prisma.client';
import * as XLSX from 'xlsx';
import { allTechnologiesWorldwide, docData, sampleData } from '../utils/dateUtils';
import { CacheService } from './cacheService';

interface QuestionsPayload {
  technology_id: string;
  question: string;
  correct_answer: string[];
  options: any;
  time: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  type: 'multiple_select' | 'video' | 'text' | 'mcq' | 'code_snippet' | 'code_snippet_with_mcq';
  meta: any;
  created_by: string;
}

interface ImportedQuestion {
  technology_name: string;
  question: string;
  correct_answer: string;
  options: string;
  difficulty_level: string;
}

export class QuestionService {
  private cacheService;
  private cacheTime = 60;

  constructor() {
    this.cacheService = new CacheService();
  }

  async getQuestions(filters: {
    technology_id?: string;
    page?: string;
    limit?: string;
    difficulty_level?: string;
    search?: string;
  }) {
    const key = this.cacheService.generateKey('questions', filters);
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const query: Prisma.QuestionsWhereInput = {
      deleted_at: null,
      technology_id: filters.technology_id ? filters.technology_id : undefined,
      difficulty_level: filters.difficulty_level
        ? { in: filters.difficulty_level.split(',') as QuestionsPayload['difficulty_level'][] }
        : undefined,
      question: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
    };
    if (filters.technology_id) {
      return prisma.technology.findUnique({
        where: {
          id: filters.technology_id,
        },
        include: {
          questions: {
            where: { ...query },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });
    }
    const response = prisma.questions.findMany({ include: { technology: true } });

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }

  async getQuestionById(id: string): Promise<Questions | null> {
    const data = await this.cacheService.getKey(`question:${id}`);
    if (data) JSON.stringify(data);

    const response = await prisma.questions.findUnique({ where: { id } });
    await this.cacheService.setKey(`question:${id}`, response, this.cacheTime);
    return response;
  }

  async getQuestionByName(question: string): Promise<Questions[] | null> {
    const data = await this.cacheService.getKey(`question-name:${question}`);
    if (data) JSON.stringify(data);

    const response = await prisma.questions.findMany({ where: { question } });
    await this.cacheService.setKey(`question:-name${question}`, response, this.cacheTime);
    return response;
  }
  async createQuestion(data: QuestionsPayload): Promise<Questions> {
    return prisma.questions.create({ data });
  }
  async deleteQuestion(questionId: string) {
    try {
      // Check if the question is associated with any exam
      const examQuestion = await prisma.exam_questions.findFirst({
        where: { question_id: questionId },
        include: {
          exam: {
            include: {
              assessment: true,
            },
          },
        },
      });

      if (examQuestion) {
        if (!examQuestion.exam.assessment.deleted_at) {
          const assessmentName = examQuestion.exam.assessment.name;
          throw new Error(
            `This question is associated with assessment "${assessmentName}". Please delete the assessment first or remove this question from the assessment.`
          );
        }
      }
      await prisma.exam_questions.deleteMany({
        where: { question_id: questionId },
      });

      return prisma.questions.delete({
        where: {
          id: questionId,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to delete question due to database constraints.');
      }
    }
  }
  async updateQuestion(id: string, data: QuestionsPayload) {
    return prisma.questions.update({ where: { id }, data });
  }

  async getQuestionByTechnologyId(filters: {
    technology_id?: string;
    page?: string;
    limit?: string;
    difficulty_level?: string;
    search?: string;
  }) {
    const key = this.cacheService.generateKey('questions:technology', filters);
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const query: Prisma.QuestionsWhereInput = {
      technology_id: filters.technology_id ? filters.technology_id : undefined,
      difficulty_level: filters.difficulty_level
        ? { in: filters.difficulty_level.split(',') as QuestionsPayload['difficulty_level'][] }
        : undefined,
      question: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      deleted_at: null,
    };

    const totalQuestions = await prisma.questions.count({
      where: { ...query },
    });
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || totalQuestions;

    const questions = await prisma.questions.findMany({
      where: { ...query },
      orderBy: { created_at: 'asc' },
      include: {
        created_by_user: {
          select: {
            name: true,
            deleted_at: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(
      totalQuestions / (filters.limit ? Number(filters.limit) : totalQuestions)
    );
    const technology = await prisma.technology.findUnique({ where: { id: filters.technology_id } });

    const response = {
      list: questions,
      total: totalQuestions,
      page,
      limit,
      totalPages,
      technology,
    };
    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }

  async downloadQuestionFile(): Promise<Buffer> {
    const technologiesWithQuestions = await prisma.technology.findMany({
      take: 10,
      include: {
        questions: {
          where: { deleted_at: null },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const sampleQuestionsData = technologiesWithQuestions
      .filter((tech) => tech.questions.length > 0)
      .map((tech) => {
        const question = tech.questions[0];
        return {
          question: question.question,
          correct_answer: question.correct_answer.join(','),
          options: Array.isArray(question.options) ? question.options.join(',') : question.options,
          difficulty_level: question.difficulty_level,
          type: question.type,
        };
      });
    const dataToUse = sampleQuestionsData.length > 0 ? sampleQuestionsData : sampleData;

    const worksheet = XLSX.utils.json_to_sheet(dataToUse);

    const wscols = [
      { wch: 50 }, // question
      { wch: 15 }, // correct_answer
      { wch: 50 }, // options
      { wch: 15 }, // difficulty_level
      { wch: 15 }, // type
    ];

    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions Template');
    const docSheet = XLSX.utils.json_to_sheet(docData);
    docSheet['!cols'] = [
      { wch: 15 }, // field
      { wch: 40 }, // description
      { wch: 40 }, // example
    ];

    XLSX.utils.book_append_sheet(workbook, docSheet, 'Instructions');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  }

  async importQuestionsFromXlsx(
    fileBuffer: Buffer,
    technologyId: string,
    created_by: string
  ): Promise<{
    totalImported: number;
    errors: string[];
    technologyName?: string;
  }> {
    const VALID_TYPES = Object.values(Question_type); // includes "mcq", "multi_select", "text"

    const detectType = (answers: string[]) => (answers.length > 1 ? 'multi_select' : 'mcq');

    // ----------- READ EXCEL FILE -------------
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const questions = XLSX.utils.sheet_to_json<any>(worksheet);

    if (questions.length === 0) {
      return {
        totalImported: 0,
        errors: ['The uploaded file contains no data or has an incorrect format'],
      };
    }

    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
    });

    if (!technology) {
      return {
        totalImported: 0,
        errors: [`Technology with ID ${technologyId} not found`],
      };
    }

    const errors: string[] = [];

    // -------------------------------------------------------
    // ------------------- VALIDATION LOOP -------------------
    // -------------------------------------------------------
    for (const [index, row] of questions.entries()) {
      const rowNum = index + 2;

      try {
        // REQUIRED QUESTION
        if (!row.question || String(row.question).trim() === '') {
          errors.push(`Row ${rowNum}: Missing question.`);
        }

        // REQUIRED correct_answer
        if (row.correct_answer == null || String(row.correct_answer).trim() === '') {
          errors.push(`Row ${rowNum}: Missing correct answer.`);
        }

        // REQUIRED difficulty
        if (!row.difficulty_level || String(row.difficulty_level).trim() === '') {
          errors.push(`Row ${rowNum}: Missing difficulty level.`);
        }

        const difficulty = String(row.difficulty_level).toLowerCase();
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
          errors.push(`Row ${rowNum}: Invalid difficulty level.`);
        }

        // --------------------------------------------
        // HANDLE TYPE
        // --------------------------------------------
        let questionType = row.type ? String(row.type).trim().toLowerCase() : '';

        if (questionType === '') {
          questionType = detectType(
            String(row.correct_answer).includes(',')
              ? String(row.correct_answer).split(',')
              : [String(row.correct_answer)]
          );
        }

        // VALIDATE TYPE
        if (!VALID_TYPES.includes(questionType as Question_type)) {
          errors.push(
            `Row ${rowNum}: Invalid question type "${row.type}". Supported types: ${VALID_TYPES.join(
              ', '
            )}`
          );
        }

        // ------------------------------------------------
        // TYPE-SPECIFIC VALIDATION
        // ------------------------------------------------

        if (questionType === 'text') {
          // FILL IN THE BLANK — NO OPTIONS REQUIRED
          row.__finalType = 'text';

          // correct_answer stays as string or comma list
          row.__correctArr = String(row.correct_answer)
            .split(',')
            .map((a: string) => a.trim());

          continue; // skip MCQ validations
        }

        // --------------------------------------------
        // MCQ & MULTI-SELECT VALIDATIONS
        // --------------------------------------------
        if (!row.options || String(row.options).trim() === '') {
          errors.push(`Row ${rowNum}: Missing options.`);
        }

        const optionsArray = String(row.options)
          .split(',')
          .map((o: string) => o.trim());

        if (optionsArray.length < 2) {
          errors.push(`Row ${rowNum}: Options must contain at least 2 values.`);
        }

        const correctArr = String(row.correct_answer).includes(',')
          ? String(row.correct_answer)
              .split(',')
              .map((a: string) => a.trim())
          : [String(row.correct_answer).trim()];

        // Correct answers must be numeric index
        for (const ans of correctArr) {
          if (!/^\d+$/.test(ans)) {
            errors.push(`Row ${rowNum}: Correct answer "${ans}" must be a number index.`);
            continue;
          }

          const idx = Number(ans);
          if (idx < 0 || idx >= optionsArray.length) {
            errors.push(
              `Row ${rowNum}: Correct answer index ${idx} out of range (0-${optionsArray.length - 1}).`
            );
          }
        }

        row.__finalType = questionType;
        row.__correctArr = correctArr;
        row.__optionsArray = optionsArray;
      } catch (err) {
        errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // -------------------------------------------------------
    // STOP IF ANY ERRORS
    // -------------------------------------------------------
    if (errors.length > 0) {
      return {
        totalImported: 0,
        errors,
      };
    }

    // -------------------------------------------------------
    // INSERT INTO DATABASE
    // -------------------------------------------------------
    let totalImported = 0;
    const questionsImportArray: any[] = [];

    try {
      await prisma.$transaction(async (tx) => {
        for (const row of questions) {
          const difficulty = String(row.difficulty_level).toLowerCase();

          questionsImportArray.push({
            technology_id: technologyId,
            question: String(row.question),

            correct_answer: row.__correctArr,
            options: row.__finalType === 'text' ? [] : row.__optionsArray,

            time: '60',
            difficulty_level: difficulty as 'easy' | 'medium' | 'hard',
            type: row.__finalType,
            meta: {},
            created_by,
          });

          totalImported++;
        }

        // DUPLICATE CHECK
        const existing = await tx.questions.findMany({
          where: {
            question: {
              in: questionsImportArray.map((q) => q.question),
            },
          },
        });

        if (existing.length) {
          const indexes: number[] = [];
          existing.forEach((e) => {
            const idx = questionsImportArray.findIndex((q) => q.question === e.question);
            if (idx !== -1) indexes.push(idx + 1);
          });

          throw new Error(indexes.join(', ') + ' questions already exist.');
        }

        await tx.questions.createMany({
          data: questionsImportArray,
        });
      });

      return {
        totalImported,
        technologyName: technology.name,
        errors: [],
      };
    } catch (err) {
      return {
        totalImported: 0,
        errors: [`Transaction failed: ${err instanceof Error ? err.message : err}`],
      };
    }
  }

  async getTechnology(): Promise<Technology[]> {
    return prisma.technology.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
    });
  }
}

export default QuestionService;
