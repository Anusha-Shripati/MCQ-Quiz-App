import { Questions } from "@prisma/client";
import { prisma } from "../db/prisma.client";

interface QuestionsPayload {
    technology_id: string;
    question: string;
    correct_answer: string;
    options: any;
    time: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    type: 'multiple_select' | 'video' | 'text' | 'mcq';
    meta: any;
}

export class QuestionService {

    async getQuestions(filters:{technology_id?: string}) {
        if(filters.technology_id){
            return prisma.technology.findUnique({ where: { id: filters.technology_id },include:{questions:true} })
        }
        return prisma.questions.findMany({include:{technology:true}})
    }

    async getQuestionById(id: string): Promise<Questions | null> {
        return prisma.questions.findUnique({ where: { id } });
    }

    async createQuestion(data: QuestionsPayload): Promise<Questions> {
        return prisma.questions.create({ data })
    }
    async deleteQuestion(questionId: string) {
        return prisma.questions.deleteMany({
            where: {
                id: questionId
            }
        })
    }
    async updateQuestion(id: string, data: QuestionsPayload) {
        return prisma.questions.update({ where: { id }, data })
    }
}

export default QuestionService 