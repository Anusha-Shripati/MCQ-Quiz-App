import ViewQuestions from "@/components/questions/view-questions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'View Questions',
};

export default function ViewQuestionsPage() {
  return <ViewQuestions />;
}