import { ExamTokenPayload } from '../../middlewares/exam-auth.middleware';

declare global {
  namespace Express {
    interface Request {
      // Tenant/Platform Context
      context?: {
        type: 'PLATFORM' | 'TENANT';
        tenant?: {
          id: string;
          name: string;
          slug: string;
          status: string;
          plan?: any;
        };
        prisma: any; // Will be either Platform or Tenant PrismaClient
      };
      
      // Authenticated User
      user?: {
        id: string;
        email: string;
        role_id: string;
        role_name: string;
        token_type?: 'PLATFORM_ADMIN' | 'TENANT_ADMIN';
      };
      
      // Candidate Info (for exam access)
      candidateInfo?: { 
        candidateId: string; 
        examId: string; 
        name: string; 
        email: string 
      };
      
      // File Upload
      file: Express.Multer.File;
      
      // Exam Candidate
      examCandidate?: ExamTokenPayload;
      
      // Validated Data from middleware
      validatedData?: any;
    }
  }
}
