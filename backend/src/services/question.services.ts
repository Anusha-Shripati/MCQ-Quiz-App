import { Prisma, Questions, Technology } from '@prisma/client';
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
  type: 'multiple_select' | 'video' | 'text' | 'mcq' | 'code_snippet';
  meta: any;
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
    this.cacheService = new CacheService()
  }

  async getQuestions(filters: {
    technology_id?: string;
    page?: string;
    limit?: string;
    difficulty_level?: string;
    search?: string;
  }) {

    const key = this.cacheService.generateKey('questions', filters)
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data)

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

    await this.cacheService.setKey(key, response, this.cacheTime)
    return response
  }

  async getQuestionById(id: string): Promise<Questions | null> {

    const data = await this.cacheService.getKey(`question:${id}`)
    if (data) JSON.stringify(data)
    const response = prisma.questions.findUnique({ where: { id } });
    await this.cacheService.setKey(`question:${id}`, response, this.cacheTime)
    return response
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
              assessment: true
            }
          }
        }
      });
      
      if (examQuestion) {
        const assessmentName = examQuestion.exam.assessment.name;
        throw new Error(`This question is associated with assessment "${assessmentName}". Please delete the assessment first or remove this question from the assessment.`);
      }
      
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
    const key = this.cacheService.generateKey('questions:technology', filters)
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data)

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
      orderBy: { created_at: 'desc' },
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
    await this.cacheService.setKey(key, response, this.cacheTime)
    return response
  }

  async downloadQuestionFile(): Promise<Buffer> {
    const technologiesWithQuestions = await prisma.technology.findMany({
      take: 10,
      include: {
        questions: {
          where: { deleted_at: null },
          take: 1,
        }
      },
      orderBy: {
        name: 'asc',
      }
    });

    const sampleQuestionsData = technologiesWithQuestions
      .filter(tech => tech.questions.length > 0)
      .map(tech => {
        const question = tech.questions[0];
        return {
          question: question.question,
          correct_answer: question.correct_answer.join(','),
          options: Array.isArray(question.options) ? question.options.join(',') : question.options,
          difficulty_level: question.difficulty_level,
        };
      });
    console.log('Sample Questions Data:', sampleQuestionsData);
    const dataToUse = sampleQuestionsData.length > 0 ? sampleQuestionsData : sampleData;

    const worksheet = XLSX.utils.json_to_sheet(dataToUse);

    const wscols = [
      { wch: 50 }, // question
      { wch: 15 }, // correct_answer
      { wch: 50 }, // options
      { wch: 15 }, // difficulty_level
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

  async importQuestionsFromXlsx(fileBuffer: Buffer, technologyId: string): Promise<{ 
    totalImported: number,
    errors: string[],
    technologyName?: string 
  }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const questions = XLSX.utils.sheet_to_json<ImportedQuestion>(worksheet);

    if (questions.length === 0) {
      return {
        totalImported: 0,
        errors: ['The uploaded file contains no data or has an incorrect format']
      };
    }
    
    const technology = await prisma.technology.findUnique({
      where: { id: technologyId }
    });
    
    if (!technology) {
      return {
        totalImported: 0,
        errors: [`Technology with ID ${technologyId} not found`]
      };
    }
    
    const errors: string[] = [];
    
    for (const [index, row] of questions.entries()) { 
      const rowNum = index + 2; 
      
      try { 
        if (!row.question || String(row.question).trim() === '') {
          errors.push(`Row ${rowNum}: Missing question. This field is required.`);
        }

        if (!row.options || String(row.options).trim() === '') {
          errors.push(`Row ${rowNum}: Missing options. This field is required.`);
        }

        if (row.correct_answer == null || String(row.correct_answer).trim() === '') {
          errors.push(`Row ${rowNum}: Missing correct answer. This field is required.`);
        }

        if (!row.difficulty_level || String(row.difficulty_level).trim() === '') {
          errors.push(`Row ${rowNum}: Missing difficulty level. This field is required.`);
        }

        let optionsArray: string[] = [];
        let originalOptionsArray: string[] = [];
        if (row.options) {
          const optionsString = String(row.options);
          originalOptionsArray = optionsString.split(',').map(opt => opt.trim());
          
          // Process options for storage
          optionsArray = optionsString
            .split(',')
            .map(opt => opt.trim().toLowerCase().replace(/\s+/g, ' '));
          
          if (optionsArray.length < 4) {
            errors.push(`Row ${rowNum}: Options must contain at least 4 comma-separated values.`);
          }
        }

        // Validate correct_answer contains valid indexes
        if (row.correct_answer && optionsArray.length > 0) {
          const correctAnswer = String(row.correct_answer);
          let correctAnswersArray: string[];

          if (correctAnswer.includes(',')) {
            correctAnswersArray = correctAnswer.split(',').map(ans => ans.trim());
          } else {
            correctAnswersArray = [correctAnswer.trim()];
          }

          for (const answer of correctAnswersArray) {
            // Check if the answer is a valid number
            if (!/^\d+$/.test(answer)) {
              errors.push(`Row ${rowNum}: Correct answer "${answer}" is not a valid index number.`);
              continue;
            }

            const ansIndex = parseInt(answer, 10);
            if (ansIndex < 0 || ansIndex >= optionsArray.length) {
              console.log(ansIndex, optionsArray.length);
              errors.push(`Row ${rowNum}: Correct answer index ${ansIndex} is out of range. Must be between 0 and ${optionsArray.length - 1}.`);
            }
          }
        }

        if (row.difficulty_level) {
          const validDifficultyLevels = ['easy', 'medium', 'hard'];
          const difficultyLevel = String(row.difficulty_level).toLowerCase();

          if (!validDifficultyLevels.includes(difficultyLevel)) {
            errors.push(`Row ${rowNum}: Invalid difficulty level "${row.difficulty_level}". Must be one of: easy, medium, hard`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        errors.push(`Row ${rowNum}: ${errorMessage}`);
      }
    }

    // If any validation errors were found, return them without creating anything
    if (errors.length > 0) {
      return {
        totalImported: 0,
        errors
      };
    }

    // All validations passed, proceed with import using a transaction
    let totalImported = 0;

    try {
      await prisma.$transaction(async (tx) => {
        for (const row of questions) {
          const optionsString = String(row.options);
          const optionsArray = optionsString.split(',').map(opt => opt.trim());

          const correctAnswer = String(row.correct_answer);
          let correctAnswersIndexes: string[];

          if (correctAnswer.includes(',')) {
            correctAnswersIndexes = correctAnswer.split(',').map(ans => ans.trim());
          } else {
            correctAnswersIndexes = [correctAnswer.trim()];
          }

          const difficultyLevel = String(row.difficulty_level).toLowerCase();

          await tx.questions.create({
            data: {
              technology_id: technologyId, // Use the specified technology ID
              question: String(row.question),
              correct_answer: correctAnswersIndexes,
              options: optionsArray,
              time: "60",
              difficulty_level: difficultyLevel as 'easy' | 'medium' | 'hard',
              type: 'mcq',
              meta: {}
            }
          });

          totalImported++;
        }
      });

      return {
        totalImported,
        technologyName: technology.name,  // Include technology name in successful response
        errors: []
      };

    } catch (error) {
      console.error('Import transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during import';
      return {
        totalImported: 0,
        errors: [`Transaction failed: ${errorMessage}`]
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
