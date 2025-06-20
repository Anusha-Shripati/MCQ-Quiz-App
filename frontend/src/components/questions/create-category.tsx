'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { useQuestionStore } from '@/store/questionStore';
import { usePathname, useRouter } from 'next/navigation';
import { technologyEndpoint } from '@/lib/endpoint';

import ImportSampleXLSX from './import-sample-xlsx';
import { useAuthStore } from '@/store/authStore';

import { QuestionCategory } from '@/shared/types/app';

async function createCategory(url: string, { arg }: { arg: { name: string } }) {
  const response = await api.post(url, arg);
  return response.data;
}

interface CreateCategoryProps {
  categoriesArray?: QuestionCategory[];
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ categoriesArray = [] }) => {
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  const { setTechnologyFilter, technologyFilter } = useQuestionStore();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      setTechnologyFilter(searchTerm);
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, setTechnologyFilter]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      setTechnologyFilter(search);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };
  const { trigger } = useSWRMutation(technologyEndpoint.CREATE, createCategory);

  const handleCreateCategory = async () => {
    try {
      const data = await trigger({ name: categoryName });
      if (data) {
        setCategoryName('');
        setOpen(false);
        toast.success('Technology created successfully');
        mutate(`/technology/list?search=${technologyFilter}`);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleImportSuccess = () => {
    // Refresh the technology list after successful import
    mutate(`/technology/list?search=${technologyFilter}`);
  };

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Search Technology..."
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300 min-w-[200px]"
          value={searchTerm}
          onChange={handleSearch}
        />
        {isQuestionEditable && (
          <>
          <Button
          className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push('/questions/create-question/new')}
        >
          Create Technology
        </Button>
        <Button
          className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
          onClick={() => setImportOpen(true)}
        >
          Import Questions
        </Button>
          </>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Technology Name"
              className="border-gray-300"
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button
              className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                handleCreateCategory();
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImportSampleXLSX
        importOpen={importOpen}
        setImportOpen={setImportOpen}
        onImportSuccess={handleImportSuccess}
        categoriesArray={categoriesArray}
      />
    </>
  );
};

export default CreateCategory;
