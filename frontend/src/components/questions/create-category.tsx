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

// Define props type

async function createCategory(url: string, { arg }: { arg: { name: string } }) {
  const response = await api.post(url, arg);
  return response.data;
}

const CreateCategory: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { setTechnologyFilter, technologyFilter } = useQuestionStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTechnologyFilter(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, setTechnologyFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };
  const { trigger } = useSWRMutation('/technology/create', createCategory);

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

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Search Technology..."
          className="w-[200px] border-gray-300"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button
          className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpen(true)}
        >
          Create Technology
        </Button>
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
    </>
  );
};

export default CreateCategory;
