import { Result } from '../../common/types/types';
import { PrismaClient } from '../../db/tenant/generated/client';
import {
  categorizeExamDate,
  formatInterviewResults,
  getDateBoundaries,
  generateLast7Months,
} from '../../utils/dateUtils';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import { CacheService } from './cacheService';
export class DashboardService {
  private prisma: PrismaClient;
  private cacheService;
  private cacheTime = 60;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cacheService = new CacheService()
  }
  async getQuestionData() {

    const data = await this.cacheService.getKey('dashboard:question-data')
    if (data) {
      return JSON.parse(data)
    }
    const questionData = await this.prisma.questions.groupBy({
      by: ['technology_id'],
      _count: true,
    });

    if (questionData.length === 0) return [];

    const technologyIds = questionData.map((q) => q.technology_id);
    const technologies = await this.prisma.technology.findMany({
      where: { id: { in: technologyIds } },
      select: { id: true, name: true },
    });

    const techMap = new Map(technologies.map((tech) => [tech.id, tech.name]));

    const response = questionData.map((group) => ({
      ...group,
      name: techMap.get(group.technology_id) || 'Unknown',
    }));
    await this.cacheService.setKey('dashboard:question-data', response, this.cacheTime)
    return response
  }

  async getInterviewData(filter: string = 'year', customStart?: string, customEnd?: string) {
    const key = this.cacheService.generateKey('dashboard:interview-data', { filter, customStart, customEnd });
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }

    dayjs.extend(utc);
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs = now;
    let groupBy: 'day' | 'month' = 'month';

    // Determine date range based on filter
    switch (filter) {
      case 'today':
        startDate = now.startOf('day');
        endDate = now.endOf('day');
        groupBy = 'day';
        break;
      case 'last7days':
        startDate = now.subtract(6, 'days').startOf('day');
        groupBy = 'day';
        break;
      case 'month':
        startDate = now.startOf('month');
        groupBy = 'day';
        break;
      case 'year':
        startDate = now.startOf('year');
        groupBy = 'month';
        break;
      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom date range requires start and end dates');
        }
        startDate = dayjs(customStart).startOf('day');
        endDate = dayjs(customEnd).endOf('day');
        const daysDiff = endDate.diff(startDate, 'days');
        groupBy = daysDiff > 31 ? 'month' : 'day';
        break;
      default:
        startDate = now.startOf('year');
        groupBy = 'month';
    }

    const results = await this.prisma.results.findMany({
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
        exam: {
          is_completed: true,
          start_time: {
            gte: startDate.toDate(),
            lte: endDate.toDate(),
          },
        },
      },
    });

    // Initialize data structure
    const dataMap = new Map<string, { pass: number; failed: number; label: string }>();

    if (groupBy === 'month') {
      // Generate all months in range
      let current = startDate.startOf('month');
      while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
        const key = current.format('YYYY-MM');
        dataMap.set(key, {
          pass: 0,
          failed: 0,
          label: current.format('MMM YYYY'),
        });
        current = current.add(1, 'month');
      }
    } else {
      // Generate all days in range
      let current = startDate.startOf('day');
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        const key = current.format('YYYY-MM-DD');
        dataMap.set(key, {
          pass: 0,
          failed: 0,
          label: current.format('MMM DD'),
        });
        current = current.add(1, 'day');
      }
    }

    // Populate data
    results.forEach((result) => {
      const examDate = dayjs(result.exam.start_time);
      const key = groupBy === 'month' 
        ? examDate.format('YYYY-MM')
        : examDate.format('YYYY-MM-DD');

      if (dataMap.has(key)) {
        const data = dataMap.get(key)!;
        if (result.percentage >= 60) {
          data.pass++;
        } else {
          data.failed++;
        }
      }
    });

    const sortedData = Array.from(dataMap.values());
    const response = {
      labels: sortedData.map((item) => item.label),
      pass: sortedData.map((item) => item.pass),
      failed: sortedData.map((item) => item.failed),
      groupBy,
    };

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }

  async getInterviewCount() {
    const data = await this.cacheService.getKey('dashboard:interview-count')
    if (data) {
      return JSON.parse(data)
    }
    const exams = await this.prisma.exam.findMany({
      select: { start_time: true },
      where: { deleted_at: null },
    });

    const boundaries = getDateBoundaries();
    const counts = { thisMonth: 0, today: 0, upcoming: 0 };

    exams.forEach(({ start_time }) => {
      const localDate = new Date(start_time);
      const category = categorizeExamDate(localDate, boundaries);
      if (category && category in counts) {
        counts[category as keyof typeof counts]++;
      }
    });
    await this.cacheService.setKey('dashboard:interview-count', counts, this.cacheTime)
    return counts;
  }

  async interviewScoreData(filters: {
    language: string;
    min: string;
    max: string;
    page: string;
    limit: string;
  }) {
    const { language, min, max } = filters;

    const key = await this.cacheService.generateKey('dashboard:interview-score', {
      language,
      min,
      max,
    });
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }

    // Fixed limit of 15 records as requested
    const parsedLimit = 10;

    const whereClause: any = {
      deleted_at: null,
      exam: {
        assessment: {
          technologies: {
            some: {
              technology_id: language,
            },
          },
        },
      },
    };

    const percentage: any = {};

    if (min) {
      percentage.gte = parseFloat(min);
    }

    if (max) {
      percentage.lte = parseFloat(max);
    }

    if (Object.keys(percentage).length > 0) {
      whereClause.percentage = percentage;
    }

    if (language?.trim()) {
      whereClause.exam.assessment.technologies.some = {
        technology_id: language,
      };
    }

    const results = await this.prisma.results.findMany({
      where: whereClause,
      select: {
        percentage: true,
        id: true,
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
                pass_criteria: true,
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
      take: parsedLimit,
      orderBy: {
        created_at: 'desc',
      },
    });
    const count = await this.prisma.results.count({ where: whereClause });

    const response = {
      total: count,
      page: 1,
      limit: parsedLimit,
      list: formatInterviewResults(results as unknown as Result[]),
    };
    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }

  async calendarData(month: string, year: string) {
    const key = this.cacheService.generateKey('dashboard:calender-data', { month, year });
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }
    dayjs.extend(utc);
    const startDate = dayjs()
      .set('year', Number(year))
      .set('month', Number(month))
      .set('date', 1)
      .startOf('day');
    const endDate = startDate.endOf('month');

    const exams = await this.prisma.exam.findMany({
      where: {
        start_time: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        deleted_at: null,
      },
      select: {
        start_time: true,
        end_time: true,
        is_completed: true,
        status: true,
        candidate: {
          select: {
            name: true,
            experience: true,
          },
          where: {
            deleted_at: null,
          },
        },
        assessment: {
          select: {
            name: true,
            pass_criteria: true,
            technologies: {
              select: {
                technology: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        results: {
          select: {
            id: true,
            percentage: true,
          },
        },
      },
    });
    await this.cacheService.setKey(key, exams, this.cacheTime);
    return exams;
  }

  async getTopAssignedAssessments(limit: number = 5) {
    const key = this.cacheService.generateKey('dashboard:top-assessments', { limit });
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }

    const assessmentCounts = await this.prisma.candidate.groupBy({
      by: ['assessment_id'],
      _count: {
        id: true,
      },
      where: {
        deleted_at: null,
        assessment: {
          deleted_at: null,
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    if (assessmentCounts.length === 0) {
      return [];
    }

    const assessmentIds = assessmentCounts.map((item) => item.assessment_id);
    const assessments = await this.prisma.assessments.findMany({
      where: {
        id: { in: assessmentIds },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        technologies: {
          select: {
            technology: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const assessmentMap = new Map(
      assessments.map((assessment) => [
        assessment.id,
        {
          name: assessment.name,
          technologies: assessment.technologies.map((t) => t.technology.name),
        },
      ])
    );

    const response = assessmentCounts.map((item) => {
      const assessmentInfo = assessmentMap.get(item.assessment_id);
      return {
        assessment_id: item.assessment_id,
        name: assessmentInfo?.name || 'Unknown',
        technologies: assessmentInfo?.technologies || [],
        count: item._count.id,
      };
    });

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }

  async getQuestionTypePerformance() {
    const key = 'dashboard:question-type-performance';
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }

    const questionTypePerformance = await this.prisma.answers.groupBy({
      by: ['question_id'],
      _avg: {
        score: true,
      },
      _count: {
        id: true,
      },
      
    });

    if (questionTypePerformance.length === 0) {
      return [];
    }

    const questionIds = questionTypePerformance
      .map((item) => item.question_id)
      .filter((id) => id !== null);

    const questions = await this.prisma.questions.findMany({
      where: {
        id: { in: questionIds },
        deleted_at: null,
      },
      select: {
        id: true,
        type: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q.type]));

    // Group by question type
    const typePerformanceMap = new Map<
      string,
      { totalScore: number; count: number; questionCount: number }
    >();

    questionTypePerformance.forEach((item) => {
      if (item.question_id) {
        const type = questionMap.get(item.question_id) || 'unknown';
        const existing = typePerformanceMap.get(type) || {
          totalScore: 0,
          count: 0,
          questionCount: 0,
        };

        existing.totalScore += item._avg.score || 0;
        existing.count += 1;
        existing.questionCount += item._count.id;

        typePerformanceMap.set(type, existing);
      }
    });

    const response = Array.from(typePerformanceMap.entries()).map(
      ([type, data]) => ({
        type,
        avgScore: parseFloat((data.totalScore / data.count).toFixed(2)),
        totalAttempts: data.questionCount,
        questionsCount: data.count,
      })
    );

    // Sort by average score descending
    response.sort((a, b) => b.avgScore - a.avgScore);

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }
  async getExamDurationVsPerformance() {
    const key = 'dashboard:exam-duration-performance';
    const data = await this.cacheService.getKey(key);
    if (data) {
      return JSON.parse(data);
    }
  
    const exams = await this.prisma.exam.findMany({
      where: {
        deleted_at: null,
        is_completed: true,
        results: {
          isNot: null,
        },
      },
      select: {
        id: true,
        start_time: true,
        end_time: true,
        results: {
          select: {
            percentage: true,
          },
        },
      },
    });
  
    if (exams.length === 0) {
      return [];
    }
  
    // Calculate duration in minutes and group by duration ranges
    const durationRanges = [
      { min: 0, max: 15, label: '0-15 min' },
      { min: 15, max: 30, label: '15-30 min' },
      { min: 30, max: 60, label: '30-60 min' },
      { min: 60, max: 120, label: '1-2 hrs' },
      { min: 120, max: Infinity, label: '2+ hrs' },
    ];
  
    const rangeData = durationRanges.map((range) => ({
      range: range.label,
      minMinutes: range.min,
      maxMinutes: range.max,
      exams: [] as { duration: number; percentage: number }[],
    }));
  
    exams.forEach((exam) => {
      if (!exam.results) return;
      
      const durationMs = new Date(exam.end_time).getTime() - new Date(exam.start_time).getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      const percentage = exam.results.percentage || 0;
  
      const rangeIndex = rangeData.findIndex(
        (r) => durationMinutes >= r.minMinutes && durationMinutes < r.maxMinutes
      );
  
      if (rangeIndex !== -1) {
        rangeData[rangeIndex].exams.push({
          duration: durationMinutes,
          percentage,
        });
      }
    });
  
    const response = rangeData
      .filter((r) => r.exams.length > 0)
      .map((r) => {
        const avgPercentage =
          r.exams.reduce((sum, e) => sum + e.percentage, 0) / r.exams.length;
        const avgDuration =
          r.exams.reduce((sum, e) => sum + e.duration, 0) / r.exams.length;
        const passCount = r.exams.filter((e) => e.percentage >= 60).length;
        const passRate = (passCount / r.exams.length) * 100;
  
        return {
          durationRange: r.range,
          avgDuration: Math.round(avgDuration),
          avgPercentage: parseFloat(avgPercentage.toFixed(2)),
          passRate: parseFloat(passRate.toFixed(2)),
          totalExams: r.exams.length,
          passCount,
          failCount: r.exams.length - passCount,
        };
      });
  
    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }
}
