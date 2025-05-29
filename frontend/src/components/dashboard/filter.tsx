'use client';
import { useMemo } from 'react';

import { FormField } from '../common/form-field';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '../ui/form/button';
import { IoCloseSharp } from 'react-icons/io5';

interface LanguageScoreSelect {
  setFilters: (name: string, value: string) => void;
  scores: string[];
  filters: {
    language: string;
    score: string;
  };
}

export default function LanguageScoreSelect({ setFilters, scores, filters }: LanguageScoreSelect) {
  const { data: technologies } = useSWR('technology/list', api.get);

  const technologyOptions = useMemo(
    () =>
      technologies?.data?.list.map((tech: { name: string; id: string }) => ({
        label: tech.name,
        value: tech.id,
      })) || [],
    [technologies]
  );
  const handleClearLanguageFilter = () => {
    setFilters('language', '');
  };

  const handleClearScoreFilter = () => {
    setFilters('score', '');
  };

  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-2">
        <FormField
          value={filters.language}
          onChange={(value) => setFilters('language', value)}
          type="select"
          options={technologyOptions}
        />
        {filters.language && (
          <Button
            onClick={handleClearLanguageFilter}
            className="p-1 border-none shadow-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <IoCloseSharp size={16} className="text-red-500" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <FormField
          value={filters.score}
          onChange={(value) => setFilters('score', value)}
          type="select"
          options={scores}
        />
        {filters.score && (
          <Button
            onClick={handleClearScoreFilter}
            className="p-1 border-none shadow-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <IoCloseSharp size={16} className="text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
