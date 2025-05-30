'use client';
import { ReactElement, useMemo, useRef } from 'react';

import { FormField } from '../../common/form-field';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Button } from '../../ui/form/button';
import { IoCloseSharp } from 'react-icons/io5';
import { technologyEndpoint } from '@/lib/endpoint';

interface LanguageScoreSelect {
  setFilters: (name: string, value: string) => void;
  filters: {
    language: string;
    min: null | number;
    max: null | number;
  };
}

export default function LanguageScoreSelect({ setFilters,  filters }: LanguageScoreSelect) {
  const { data: technologies } = useSWR(technologyEndpoint.LIST, api.get);
  const deboundeRef = useRef<NodeJS.Timeout | null>(null)
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
  const handleValue = (e:React.ChangeEvent<HTMLInputElement>, name: string) => {
    if (deboundeRef.current) clearTimeout(deboundeRef.current)
    setTimeout(() => {
      setFilters(name, e.target.value)
    }, 1000)
  }

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
          onChange={(e) => handleValue(e, 'min')}
          type="text"
          parentClassName='max-w-24'
          placeholder='Min score'
        /> to
        <FormField
          onChange={(e) => handleValue(e, 'max')}
          type="text"
          parentClassName='max-w-24'
          placeholder='Max score'
        />


      </div>
    </div>
  );
}
