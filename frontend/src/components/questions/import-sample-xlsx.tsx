import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BsFiletypeXlsx, BsDownload, BsUpload, BsX } from 'react-icons/bs';
import { FiInfo } from 'react-icons/fi';
import useSWRMutation from 'swr/mutation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/form/button';
import { api } from '@/lib/api';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { QuestionCategory } from '@/shared/types/app';
import { FormField } from '../common/form-field';

interface ImportSampleXLSXProps {
  importOpen: boolean;
  setImportOpen: (open: boolean) => void;
  onImportSuccess?: () => void;
  categoriesArray: QuestionCategory[];
}

async function downloadTemplateFile(url: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  return response.blob();
}

async function uploadXlsxFile(url: string, { arg }: { arg: FormData }) {
  const response = await api.post(url, arg);
  return response;
}

const ImportSampleXLSX = ({
  importOpen,
  setImportOpen,
  onImportSuccess,
  categoriesArray
}: ImportSampleXLSXProps) => {
  const { trigger: downloadTemplateTrigger, isMutating: isDownloading } = useSWRMutation(
    '/api/v1/question/download-template',
    downloadTemplateFile
  );

  const { trigger: uploadFileTrigger, isMutating: isUploading } = useSWRMutation(
    '/question/import',
    uploadXlsxFile
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');

  const downloadSampleTemplate = async () => {
    try {
      toast.loading('Downloading template...');

      const blob = await downloadTemplateTrigger();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'questions-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.dismiss();
      toast.success('Template downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Download error:', error);
      toast.error('Failed to download template. Please try again.');
    }
  };

  const handleImportQuestions = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    if (!selectedTechnology) {
      toast.error('Please select a technology/category');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('technologyId', selectedTechnology);

    try {
      toast.loading('Importing questions...');
      const result = await uploadFileTrigger(formData);
      toast.dismiss();
      
      if (result.success) {
        toast.success(result.message || 'Questions imported successfully');
        setSelectedFile(null);
        setSelectedTechnology('');
        setImportOpen(false);
        if (onImportSuccess) onImportSuccess();
        mutate(`/technology/list`);
      } else {
        toast.error(result.message || 'Failed to import questions');
        if (result.data?.errors?.length > 0) {
          console.error('Import errors:', result.data.errors);
          toast.error(`Import Error: ${result.data.errors[0]}`);
          toast.error(`Found ${result.data.errors.length} validation errors.`);
        } else {
          toast.error('Failed to import questions. Please check your file format and try again.');
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Import error:', error);
      toast.error('Failed to import questions. Please check your file format and try again.');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload only XLSX file format');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload only XLSX file format');
      }
    }
  };

  const clearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 dark:text-gray-100">
              <BsUpload className="text-blue-500 dark:text-blue-400" />
              Import Questions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Technology selection dropdown */}
            <FormField
              type="select"
              options={categoriesArray.map(category => ({
                value: category.id,
                label: category.name
              }))}
              value={selectedTechnology}
              onChange={(value) => setSelectedTechnology(value)}
              className="w-full"
              placeholder="Technology"
            />

            {/* Upload area with improved visual feedback */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-4 transition-all duration-200 ease-in-out',
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-700 dark:border-blue-400'
                  : selectedFile
                    ? 'border-green-500 bg-green-50 dark:bg-gray-700 dark:border-green-400'
                    : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-gray-500',
                'flex flex-col items-center justify-center cursor-pointer'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDragging) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div
                className={cn(
                  'mb-4 text-5xl transition-transform duration-200',
                  isDragging ? 'scale-110' : '',
                  selectedFile
                    ? 'text-green-500 dark:text-green-300'
                    : 'text-blue-500 dark:text-blue-300'
                )}
              >
                <BsFiletypeXlsx />
              </div>

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-green-600 dark:text-green-300">
                      File Selected
                    </span>
                    <button
                      onClick={clearSelectedFile}
                      className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <BsX />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-1 font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Drag & Drop your XLSX file here
                  </p>
                  <button className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors">
                    Choose file
                  </button>
                </div>
              )}

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx"
                onChange={handleFileSelect}
              />
            </div>

            {/* File format info with better visual design */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3 dark:bg-gray-700 dark:border-gray-600">
              <div className="text-amber-500 dark:text-amber-300 mt-0.5">
                <FiInfo size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-200 mb-1">
                  File Format Requirements
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    • Format: <span className="font-medium dark:text-gray-200">XLSX only</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    • Max size: <span className="font-medium dark:text-gray-200">5 MB</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    • Header row: <span className="font-medium dark:text-gray-200">Required</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    • Empty rows: <span className="font-medium dark:text-gray-200">Ignored</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r bg-blue-100 dark:bg-gray-700 dark:border dark:border-gray-600 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 dark:bg-gray-600 rounded-md flex items-center justify-center text-white">
                  <BsFiletypeXlsx size={20} />
                </div>
                <span className="font-semibold text-blue-700 dark:text-gray-100">
                  Download Template
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                <span className="font-medium">Download the sample template</span> to get started. Use
                this format only. It includes headers and sample data. Do not modify the headers—just add
                your data below them.
              </p>

              <Button
                variant="ghost"
                className={cn(
                  'text-sm w-full border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-gray-500 text-blue-600 dark:text-white font-medium transition-all duration-200',
                  isDownloading && 'opacity-80'
                )}
                onClick={downloadSampleTemplate}
                disabled={isDownloading}
              >
                <BsDownload className="mr-2" />
                {isDownloading ? 'Downloading...' : 'Download Template'}
              </Button>
            </div>

            {/* Action buttons with improved styling */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setImportOpen(false)}
                disabled={isUploading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportQuestions}
                disabled={!selectedFile || !selectedTechnology || isUploading}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 dark:bg-blue-600 dark:hover:bg-blue-700',
                  (!selectedFile || !selectedTechnology) && 'opacity-60 cursor-not-allowed',
                  isUploading && 'animate-pulse'
                )}
              >
                {isUploading ? 'Importing...' : 'Import Questions'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportSampleXLSX;
