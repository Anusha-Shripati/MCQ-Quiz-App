import { Result } from '../common/types/types';
import { prisma } from '../db/prisma.client';
import {
  categorizeExamDate,
  formatInterviewResults,
  getDateBoundaries,
  generateLast7Months,
} from '../utils/dateUtils';
import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc';
export class DashboardService {
  async getQuestionData() {
    const questionData = await prisma.questions.groupBy({
      by: ['technology_id'],
      _count: true,
    });

    if (questionData.length === 0) return [];

    const technologyIds = questionData.map((q) => q.technology_id);
    const technologies = await prisma.technology.findMany({
      where: { id: { in: technologyIds } },
      select: { id: true, name: true },
    });

    const techMap = new Map(technologies.map(tech => [tech.id, tech.name]));

    return questionData.map((group) => ({
      ...group,
      name: techMap.get(group.technology_id) || 'Unknown',
    }));
  }

  async getInterviewData() {
    const results = await prisma.results.findMany({
      select: {
        percentage: true,
        exam: {
          select: {
            start_time: true,
            is_completed: true,
          },
        },
      },
      where: {
        exam: { is_completed: true },
      },
    });

    const last7Months = generateLast7Months();
    const monthlyData = new Map(
      last7Months.map(month => [month.key, { pass: 0, failed: 0, month: month.name }])
    );

    results.forEach(result => {
      const examDate = result.exam.start_time;
      const key = `${examDate.getFullYear()}-${examDate.getMonth()}`;

      if (monthlyData.has(key)) {
        const data = monthlyData.get(key)!;
        if (result.percentage >= 60) {
          data.pass++;
        } else {
          data.failed++;
        }
      }
    });

    const sortedData = Array.from(monthlyData.values());

    return {
      months: sortedData.map(item => item.month),
      pass: sortedData.map(item => item.pass),
      failed: sortedData.map(item => item.failed),
    };
  }

  async getInterviewCount() {
    const exams = await prisma.exam.findMany({
      select: { start_time: true },
    });

    const boundaries = getDateBoundaries();
    const counts = { lastMonth: 0, today: 0, upcoming: 0 };

    exams.forEach(({ start_time }) => {
      const category = categorizeExamDate(start_time, boundaries);
      if (category && category in counts) {
        counts[category as keyof typeof counts]++;
      }
    });

    return counts;
  }

  async interviewScoreData(filters: { language: string; min: string, max: string, page: string, limit: string }) {
    const { language, min, max, page, limit } = filters;
    const parsedPage = page ? parseInt(page) : 1
    const parsedLimit = page ? parseInt(limit) : 1
    const whereClause: any = {
      exam: {
        assessment: {}
      }
    };

    if (min)
      whereClause.percentage = {
        gte: parseFloat(min)
      }

    if (max)
      whereClause.percentage = {
        lte: parseFloat(max)
      }
    if (language?.trim()) {
      whereClause.exam.assessment.technologies = {
        some: { technology_id: language }
      };
    }
    const results = await prisma.results.findMany({
      where: whereClause,
      select: {
        percentage: true,
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            start_time: true,
            assessment: {
              select: {
                name: true,
                technologies: {
                  select: {
                    technology: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit
    });
    const count = await prisma.results.count({ where: whereClause })

    return { total: count, page: parsedPage, limit: parsedLimit, list: formatInterviewResults(results as unknown as Result[]) }
  }

  async calendarData(month: string, year: string) {

    dayjs.extend(utc);
    const startDate = dayjs().set('year', Number(year)).set('month', Number(month)).set('date', 1).startOf('day');
    const endDate = startDate.endOf('month');
    
    const exams = await prisma.exam.findMany({
      where: {
        start_time: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString()
        },
      },
      select: {
        start_time: true,
        end_time: true,
        is_completed:true,
        status:true,
        candidate: {
          select: {
            name: true,
            experience: true
          }
        },
        assessment: {
          select: {
            name: true,
            technologies: {
              select: {
                technology: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
        },
        results: {
          select: {
            id: true,
            percentage: true
          }
        }
      }
    });
    return exams

  }
}
