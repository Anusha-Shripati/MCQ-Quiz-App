import { ExamTokenPayload } from '../../middlewares/exam-auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role_id: string;
        role_name: string;
      };
      examCandidate?: ExamTokenPayload;
    }
  }
}
