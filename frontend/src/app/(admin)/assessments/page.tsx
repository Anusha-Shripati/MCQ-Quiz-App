import AssessmentHeader from "@/components/assessments/assessment-header";
import AssessmentDetails from "@/components/assessments/assessment-details";

export default function AssessmentPage() {
  return (
    <div className="p-6 flex flex-col">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assessment
            </h1>
          </div>
          <AssessmentHeader />
        </div>
      </div>
      <AssessmentDetails />
    </div>
  );
}
