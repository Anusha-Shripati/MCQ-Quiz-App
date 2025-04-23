import { JsonValue } from '@prisma/client/runtime/library';

export interface CreateCandidate {
  name: string;
  email: string;
  phone: string;
  experience: string;
  assessment_id: string;
  start_date?: Date;
  end_date?: Date;
  technology_id: string;
  meta?: JsonValue;
}

export interface UpdateCandidate extends Partial<CreateCandidate> {
  id: string;
}
