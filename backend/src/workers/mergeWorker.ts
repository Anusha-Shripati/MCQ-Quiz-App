// workers/merge.worker.ts
import { Worker } from 'bullmq';
import redis from '../lib/redis';
import { UploadService } from '../services/upload.services';
import { CandidateExamService, ExamMeta } from '../services/candiate-exam.services';
import { prisma } from '../db/prisma.client';

const uploadService = new UploadService();
const candidateExamService = new CandidateExamService();

export const registerMergeQueueWorker = () => {
  const worker = new Worker(
    'mergeChunk',
    async (job) => {
      try {
        const { foldername, exam_id, candidate_id, body } = job.data;
        const file = await uploadService.mergeChunk(foldername, exam_id, body);

        if (file) {
          const exam = await prisma.exam.findFirst({
            where: { id: exam_id },
            include: { results: {include:{answers:true}},exam_questions:true },
          });


          const res = await candidateExamService.submitAnswer(exam_id, candidate_id, {
            user_answer: [typeof file === 'string' ? file : file?.path],
            question_name: body.question_id ? null : "introduction",
            question_id: body.question_id ? body.question_id : null,
          });
          
          if (exam && exam.results) {
            await prisma.answers.update({
              where: { id: res.id },
              data: { result_id: exam.results.id },
            })
          }
        }
        console.log('Worker done')
      } catch (error) {
        console.error('Error processing mergeChunk job:', error);
        throw error;
      }
    },
    { connection: redis, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  console.log('Merge queue worker registered');
};
