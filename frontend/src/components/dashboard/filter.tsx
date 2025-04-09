"use client";
import { useMemo, useState } from "react";

import { FormField } from "../common/form-field";
import useSWR from "swr";
import { api } from "@/lib/api";

interface LanguageScoreSelect {
  setFilters: (name: string, value: string) => void;
  scores: string[];
  filters: {
    language: string;
    score: string;
  }
}

export default function LanguageScoreSelect({
  setFilters,
  scores,
  filters
}: LanguageScoreSelect) {

  const { data: technologies } = useSWR('technology/list', api.get)

  const technologyOptions = useMemo(
    () =>
      technologies?.data?.list.map((tech:{name:string,id:string}) => ({
        label: tech.name,
        value: tech.id,
      })) || [],
    [technologies]
  );

  return (
    <div className="flex space-x-4">
      <FormField
        value={filters.language}
        onChange={(value) => setFilters('language', value)}
        type="select"
        options={technologyOptions}
      />
      <FormField
        value={filters.score}
        onChange={(value) => setFilters('score', value)}
        type="select"
        options={scores}
      />
    </div>
  );
}
