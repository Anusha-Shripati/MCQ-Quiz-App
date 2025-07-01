import { JsonValue } from '@prisma/client/runtime/library';

export interface CreateCandidate {
  assessment_id: string;
  technology_id?: string;
  name: string;
  email: string;
  experience: string;
  phone: string;
  meta?: any;
  start_date?: Date;
  end_date?: Date;
    
}

export interface UpdateCandidate extends Partial<CreateCandidate> {
  id: string;
}
