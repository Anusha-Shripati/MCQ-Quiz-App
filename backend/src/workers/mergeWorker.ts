// workers/merge.worker.ts
import { Worker } from 'bullmq';
import redis from '../lib/redis';
import { UploadService } from '../tenant/services/upload.services';
import { CandidateExamService, ExamMeta } from '../tenant/services/candiate-exam.services';
import { getPrisma } from '../db/prisma/client';
import { getTenantPrisma } from '../db/tenant/client';
import { logger } from '../config/logger';

const uploadService = new UploadService();

export const registerMergeQueueWorker = () => {
  const worker = new Worker(
    'mergeChunk',
    async (job) => {
      try {
        const { foldername, exam_id, candidate_id, body, tenant_id, tenant_db_url } = job.data;
        
        // Get tenant prisma client
        const tenantPrisma = getTenantPrisma(tenant_id, tenant_db_url) as any;
        const candidateExamService = new CandidateExamService(tenantPrisma);
        
        const file = await uploadService.mergeChunk(foldername, exam_id, body, tenant_id);

        if (file) {
          const exam = await tenantPrisma.exam.findFirst({
            where: { id: exam_id },
            include: { results: {include:{answers:true}},exam_questions:true },
          });

          const res = await candidateExamService.submitAnswer(exam_id, candidate_id, {
            user_answer: [typeof file === 'string' ? file : file?.path],
            question_name: body.question_id ? null : "introduction",
            question_id: body.question_id ? body.question_id : null,
          });
          
          if (exam && exam.results) {
            await tenantPrisma.answers.update({
              where: { id: res.id },
              data: { result_id: exam.results.id },
            })
          }
        }
        logger.info('Merge worker job completed');
      } catch (error) {
        logger.error('Error processing mergeChunk job:', error);
        throw error;
      }
    },
    { connection: redis, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  logger.info('Merge queue worker registered');
};
