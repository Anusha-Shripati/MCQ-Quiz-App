import AssessmentHeader from "@/components/assessment/assessement-header";
import AssessmentDetails from "@/components/assessment/assessment-details";

export default function QuestionsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary-foreground">
          Assessment
        </h1>
        <AssessmentHeader />
      </div>
      <AssessmentDetails />
    </div>
  );
}
