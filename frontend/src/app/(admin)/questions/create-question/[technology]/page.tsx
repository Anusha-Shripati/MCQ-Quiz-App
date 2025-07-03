import CreateQuestion from "@/components/questions/create-question";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create Question',
};

export default function CreateQuestionPage({ params }: { params: { technology: string } }) {
  return <CreateQuestion params={params} />;
}