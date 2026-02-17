'use client';
import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { useQuestionStore } from '@/store/questionStore';
import { technologyEndpoint } from '@/lib/endpoint';
import ImportSampleXLSX from './import-sample-xlsx';
import { QuestionCategory } from '@/shared/types/app';
import CreateTechnologyModal from '../ui/create-technology-modal';
// async function createCategory(url: string, { arg }: { arg: { name: string } }) {
//   const response = await api.post(url, arg);
//   return response.data;
// }
//  SWR mutation fetcher for function create a technology.
async function createTechnology(url: string, { arg }: { arg: { name: string } }) {
  return await api.post(url, arg);
}
interface TechnologyFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoriesArray?: QuestionCategory[];
}

export default function TechnologyFilters({
  searchQuery,
  setSearchQuery,
  categoriesArray = [],
}: TechnologyFiltersProps) {
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  const { technologyFilter } = useQuestionStore();
  // Create a technology by calling the CREATE_ONLY API endpoint
  const { trigger: createTrigger } = useSWRMutation(
    technologyEndpoint.CREATE_ONLY,
    createTechnology
  );
  //Handler function for create technology name
  const handleCreateTechnology = async () => {
    // validate the field is empty or not
    if (!categoryName.trim()) {
      toast.error('Please enter technology name');
      return;
    }

    try {
      const data = await createTrigger({ name: categoryName });
      if (data) {
        setCategoryName('');
        setOpen(false);

        toast.success(data?.message || 'Technology created successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/technology/list'));
      } else {
        toast.error(data?.message || 'Failed to create technology');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong.');
    }
  };
  // const { trigger } = useSWRMutation(technologyEndpoint.CREATE, createCategory);

  // const handleCreateCategory = async () => {
  //   try {
  //     const data = await trigger({ name: categoryName });
  //     if (data) {
  //       setCategoryName('');
  //       setOpen(false);
  //       toast.success('Technology created successfully');
  //       mutate(`/technology/list?search=${technologyFilter}`);
  //     }
  //   } catch (error: unknown) {
  //     const axiosError = error as AxiosError<{ message: string }>;
  //     toast.error(axiosError.response?.data?.message || 'Something went wrong.');
  //   }
  // };

  const handleImportSuccess = () => {
    mutate(`/technology/list?search=${technologyFilter}`);
  };

  return (
    <>
      <section className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 flex-wrap mb-2">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search Technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'pl-10 pr-4 h-10 w-full bg-white dark:bg-primary border-gray-200 dark:border-border',
                'focus:ring-2 focus:ring-blue-500 dark:focus:ring-white focus:border-transparent',
                'placeholder:text-gray-500 text-sm',
                'rounded-lg shadow-sm transition-all duration-200',
                'hover:border-gray-300 dark:hover:border-gray-600'
              )}
            />
          </div>

          {isQuestionEditable && (
            <div className="flex gap-2 ml-auto">
              <Button
                className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
                onClick={() => setOpen(true)}
              >
                Add Technology
              </Button>
              <Button
                className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
                onClick={() => setImportOpen(true)}
              >
                Import Questions
              </Button>
            </div>
          )}
        </div>
      </section>
      {open && (
        <CreateTechnologyModal
          actionsAlign="center"
          title={'Add Technology'}
          onOpenChange={() => setOpen(false)}
          actionButtons={
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded"
              onClick={() => handleCreateTechnology()}
            >
              Save
            </button>
          }
        >
          <input
            type="text"
            className="w-96 px-4 py-5 h-10 border border-gray-300 rounded hover:outline-gray-400 focus:outline-none focus:border-gray-500"
            placeholder="Enter Technology Name..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          {/* {error ? 'Technology is already exist' : ''} */}
        </CreateTechnologyModal>
      )}
      {/* <Dialog open={open} onOpenChange={setOpen}>
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
              onClick={handleCreateCategory}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

      <ImportSampleXLSX
        importOpen={importOpen}
        setImportOpen={setImportOpen}
        onImportSuccess={handleImportSuccess}
        categoriesArray={categoriesArray}
      />
    </>
  );
}
