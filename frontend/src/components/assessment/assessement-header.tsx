"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AssessmentHeader() {
  const router = useRouter();

  const handleAddCategory = () => {
    router.push("/assessment/create-assessment");
  };

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search Assessment..."
        className="w-[200px] border-gray-300"
      />
      <Button
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleAddCategory}
      >
        Create assessment
      </Button>
    </div>
  );
}
