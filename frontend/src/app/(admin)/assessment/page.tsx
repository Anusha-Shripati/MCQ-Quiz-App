import AssessmentHeader from "@/components/assessment/assessment-header";
import AssessmentDetails from "@/components/assessment/assessment-details";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen p-8 ">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assessment
            </h1>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              25
            </div>
          </div>
          <AssessmentHeader />
        </div>
      </div>
      <AssessmentDetails />
    </div>
  );
}
