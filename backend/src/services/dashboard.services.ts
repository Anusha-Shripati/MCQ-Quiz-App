import { prisma } from "../db/prisma.client";

export class DashboardService {

  async getQuestionData() {
    const questionData = await prisma.questions.groupBy({
      by: ['technology_id'],
      _count: true,

    });
    const technologyIds = [...new Set(questionData.map(q => q.technology_id))];

    const technologies = await prisma.technology.findMany({
      where: {
        id: { in: technologyIds },
      },
    })
    const finalResult = questionData.map(group => {
      const tech = technologies.find(t => t.id === group.technology_id)
      return {
        ...group,
        name: tech ? tech.name : "Unknown",
      }
    })

    return finalResult;
  }
  async getInterviewData() {
    return {
      months:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      pass: [120, 180, 160, 200, 190, 230, 280],
      failed: [30, 50, 60, 40, 70, 80, 100]
    }
  }

  async getInterviewCount() {
    return {
      lastMonth: 89,
      upcoming: 12,
      today: 5,
    }
  }

  async interviewScroreData() {
    return [
      {
        date: "18-Nov-24",
        name: "Darshit",
        email: "rohan@mail.com",
        phone: "9625002500",
        role: "MERN",
        experience: "3+",
        description: "MERN 3 years exp.",
        duration: "40min",
        status: "Not Started",
        score: "80%",
      },
      {
        date: "18-Nov-24",
        name: "Megh Patel",
        email: "viraj@mail.com",
        phone: "9625002500",
        role: "MERN",
        experience: "3+",
        description: "MERN 3 years exp.",
        duration: "40min",
        status: "Not Started",
        score: "40%",
      },
      {
        date: "18-Nov-24",
        name: "Viraj Singh",
        email: "viraj@mail.com",
        phone: "9625002500",
        role: "MERN",
        experience: "3+",
        description: "MERN 3 years exp.",
        duration: "40min",
        status: "Not Started",
        score: "60%",
      },
    ]
  }
}
