"use client"
import CandidateFilter from "@/components/candidates/candidate-filter";
import Candidates from "@/components/candidates/candidates";
import CreateCandidate from "@/components/candidates/create-candidates";
import { useState } from "react";

export default function Candidate() {
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap">
        <h1 className="text-3xl font-bold text-secondary-foreground ml-6">
          Candidates
        </h1>
        <CreateCandidate setSearch={setSearch} />
      </div>
      <CandidateFilter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
      <div className="mt-6">
        <Candidates selectedFilter={selectedFilter} search={search} />
      </div>
    </div>
  );
}
