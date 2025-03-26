import React from "react";

import dynamic from "next/dynamic";
import CreateCandidateDialog from "@/components/candidates/create-candidate-dialog";
import { candidatesList } from "@/shared/constants/data";
import { Card } from "@/components/ui/card";
import Loading from "@/app/loading";
import CandidateTable from "./Table";

const FiltersCandidates = dynamic(() => import("@/components/candidates/candidates-filters"), {
  ssr: false, loading: () => <Loading />
});


export default function Candidates() {

  return (
    <div className="p-4 sm:p-6 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 ">
          All Candidates &amp; Results
        </h1>
        <CreateCandidateDialog />
      </div>
      <Card className="flex flex-col p-4 sm:p-6 gap-2 min-h-[50%]">
        <FiltersCandidates candidates={candidatesList} />
        <CandidateTable/>
      </Card>
    </div>
  );
}