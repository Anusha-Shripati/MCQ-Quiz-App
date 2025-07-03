import CreateAssessment from "@/components/assessments/create-assessment";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create Assessment',
};

export default function CreateAssessmentPage() {
  return <CreateAssessment />;
}