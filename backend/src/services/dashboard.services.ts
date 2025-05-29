import { prisma } from '../db/prisma.client';
import {
  categorizeExamDate,
  convertToISTISOString,
  formatInterviewResults,
  getDateBoundaries,
  generateLast7Months,
} from '../utils/dateUtils';

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

  async interviewScoreData(filters: { language: string; score: string }) {
    const { language, score } = filters;

    const whereClause: any = {
      exam: {
        assessment: {}
      }
    };

    if (score?.trim()) {
      const scoreNum = parseFloat(score);
      if (!isNaN(scoreNum)) {
        whereClause.percentage = {
          gte: scoreNum - 5,
          lte: scoreNum + 5,
        };
      }
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
    });

    return formatInterviewResults(results as any[]);
  }

  async calendarData() {
    const exams = await prisma.exam.findMany({
      select: { start_time: true },
    });

    const dateMap = new Map<string, number>();

    exams.forEach(exam => {
      const istDateStr = convertToISTISOString(exam.start_time);
      const date = istDateStr.split('T')[0];
      
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
      exams: Array(count).fill(null).map(() => ({
        start_time: convertToISTISOString(new Date(date)),
      })),
    }));
  }
}
